"""
Management command: python manage.py imbogateste_atractii

Îmbogățește atracțiile din DB cu date din:
  - Wikipedia RO  → descriere detaliată
  - Wikimedia     → poză reprezentativă
  - Overpass API  → coordonate exacte + ore vizitare
"""

import os
import time
import requests
from django.core.management.base import BaseCommand
from apps.atractii.models import AtractieTuristica


WIKIPEDIA_SUMMARY_RO  = "https://ro.wikipedia.org/api/rest_v1/page/summary/{}"
WIKIPEDIA_SUMMARY_EN  = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"
WIKIPEDIA_SEARCH_RO   = "https://ro.wikipedia.org/w/api.php"
WIKIMEDIA_COMMONS_API = "https://commons.wikimedia.org/w/api.php"
UNSPLASH_API          = "https://api.unsplash.com/search/photos"
OVERPASS_URL          = "https://overpass-api.de/api/interpreter"
HEADERS               = {"User-Agent": "CalatorPrinRomania/1.0 (contact@example.com)"}


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _get_summary(url):
    """Returnează (descriere, imagine_url) sau (None, None)."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            data = r.json()
            descriere = data.get("extract", "")[:1200]
            thumbnail = data.get("thumbnail", {}).get("source", "")
            original  = data.get("originalimage", {}).get("source", thumbnail)
            if descriere:
                return descriere, original
    except Exception:
        pass
    return None, None


def _wikipedia(nume: str):
    """Cauta pe Wikipedia RO/EN, cu fallback prin API de cautare."""
    # 1. Wikipedia RO — titlu direct
    for titlu in [nome := nume,
                  nome.replace("ș", "s").replace("ț", "t").replace("ă", "a").replace("î", "i").replace("Ă", "A")]:
        desc, img = _get_summary(WIKIPEDIA_SUMMARY_RO.format(requests.utils.quote(titlu)))
        if desc:
            return desc, img

    # 2. Wikipedia EN — titlu direct
    desc, img = _get_summary(WIKIPEDIA_SUMMARY_EN.format(requests.utils.quote(nume)))
    if desc:
        return desc, img

    # 3. Fallback — cautare prin API Wikipedia RO
    try:
        r = requests.get(WIKIPEDIA_SEARCH_RO, headers=HEADERS, timeout=10, params={
            "action": "query", "list": "search",
            "srsearch": f"{nume} Romania",
            "srlimit": 1, "format": "json"
        })
        if r.status_code == 200:
            results = r.json().get("query", {}).get("search", [])
            if results:
                titlu_gasit = results[0]["title"]
                desc, img = _get_summary(WIKIPEDIA_SUMMARY_RO.format(requests.utils.quote(titlu_gasit)))
                if desc:
                    return desc, img
    except Exception:
        pass

    return None, None


EXTENSII_IMAGINE = ('.jpg', '.jpeg', '.png', '.webp')
EXCLUDE_CUVINTE  = ('map', 'logo', 'icon', 'flag', 'coat', 'seal', 'emblem', 'locator', 'blank')

def _wikimedia_commons(nume: str):
    """
    Cauta pe Wikimedia Commons o imagine reprezentativa.
    Returneaza URL-ul imaginii sau None.
    """
    termeni = [
        nume,
        f"{nume} Romania",
        nume.replace('ș', 's').replace('ț', 't').replace('ă', 'a').replace('â', 'a').replace('î', 'i'),
    ]
    for termen in termeni:
        try:
            r = requests.get(WIKIMEDIA_COMMONS_API, headers=HEADERS, timeout=10, params={
                'action': 'query', 'generator': 'search',
                'gsrnamespace': 6, 'gsrsearch': termen,
                'gsrlimit': 10, 'prop': 'imageinfo',
                'iiprop': 'url|mime|size', 'format': 'json',
            })
            if r.status_code != 200:
                continue

            pages = r.json().get('query', {}).get('pages', {})
            candidati = []

            for page in pages.values():
                info_list = page.get('imageinfo', [])
                if not info_list:
                    continue
                info = info_list[0]
                url  = info.get('url', '')
                w    = info.get('width', 0)
                h    = info.get('height', 0)

                if not any(url.lower().endswith(ext) for ext in EXTENSII_IMAGINE):
                    continue
                if any(exc in url.lower() for exc in EXCLUDE_CUVINTE):
                    continue
                if w < 400 or h < 300:
                    continue

                candidati.append((w * h, url))

            if candidati:
                candidati.sort(reverse=True)
                return candidati[0][1]

        except Exception:
            continue

    return None


def _unsplash(nume: str, access_key: str) -> str | None:
    """
    Cauta pe Unsplash o fotografie reprezentativa.
    Returneaza URL-ul imaginii (regular size) sau None.
    """
    if not access_key or access_key == 'pune_aici_access_key_ul_tau':
        return None
    termeni = [f"{nume} Romania", nume]
    for termen in termeni:
        try:
            r = requests.get(UNSPLASH_API, timeout=10, params={
                'query'      : termen,
                'per_page'   : 1,
                'orientation': 'landscape',
            }, headers={
                **HEADERS,
                'Authorization': f'Client-ID {access_key}',
            })
            if r.status_code == 200:
                results = r.json().get('results', [])
                if results:
                    # preferăm 'regular' (1080px) sau 'full'
                    urls = results[0].get('urls', {})
                    url = urls.get('regular') or urls.get('full')
                    if url:
                        return url
        except Exception:
            continue
    return None


def _overpass(nume: str):
    """Returnează (lat, lon, ore) sau (None, None, None)."""
    query = f"""
    [out:json][timeout:25];
    (
      node["name"="{nume}"]["tourism"](44.0,20.0,48.5,30.0);
      way["name"="{nume}"]["tourism"](44.0,20.0,48.5,30.0);
      relation["name"="{nume}"]["tourism"](44.0,20.0,48.5,30.0);
    );
    out center;
    """
    try:
        r = requests.post(OVERPASS_URL, data={"data": query}, headers=HEADERS, timeout=30)
        if r.status_code == 200:
            elems = r.json().get("elements", [])
            if elems:
                el  = elems[0]
                lat = el.get("lat") or el.get("center", {}).get("lat")
                lon = el.get("lon") or el.get("center", {}).get("lon")
                ore = el.get("tags", {}).get("opening_hours", "")
                if lat and lon:
                    return lat, lon, ore
    except Exception:
        pass
    return None, None, None


# ──────────────────────────────────────────────
# Command
# ──────────────────────────────────────────────

class Command(BaseCommand):
    help = "Îmbogățește atracțiile din DB cu date din Wikipedia, Wikimedia și Overpass."

    def add_arguments(self, parser):
        parser.add_argument(
            "--only",
            type=str,
            default="",
            help="Procesează doar atracția cu numele dat (parțial, case-insensitive).",
        )
        parser.add_argument(
            "--skip-coordonate",
            action="store_true",
            help="Nu actualiza coordonatele din Overpass.",
        )
        parser.add_argument(
            "--skip-wikipedia",
            action="store_true",
            help="Nu actualiza descrierea și poza din Wikipedia.",
        )

    def handle(self, *args, **options):
        filtru        = options["only"].lower()
        skip_coords   = options["skip_coordonate"]
        skip_wiki     = options["skip_wikipedia"]
        unsplash_key  = os.environ.get('UNSPLASH_ACCESS_KEY', '')

        if unsplash_key and unsplash_key != 'pune_aici_access_key_ul_tau':
            self.stdout.write(self.style.SUCCESS('  Unsplash: cheie configurata ✓'))
        else:
            self.stdout.write(self.style.WARNING('  Unsplash: cheie lipsa, se sare fallback-ul Unsplash'))

        atractii = AtractieTuristica.objects.all()
        if filtru:
            atractii = atractii.filter(nume__icontains=filtru)

        total = atractii.count()
        self.stdout.write(f"Procesez {total} atracții...\n")

        for i, atractie in enumerate(atractii, 1):
            self.stdout.write(f"[{i}/{total}] {atractie.nume} ...", ending=" ")
            modificat = False

            # ── Wikipedia ──────────────────────────────
            if not skip_wiki:
                descriere, poza = _wikipedia(atractie.nume)

                if descriere and (not atractie.descriere or len(atractie.descriere) < 100):
                    atractie.descriere = descriere
                    modificat = True

                if poza:  # Wikipedia a găsit o poză
                    atractie.imagineCopertaUrl = poza
                    modificat = True
                    self.stdout.write(f"  🖼️ poză Wikipedia", ending=" ")
                else:
                    # Fallback: Wikimedia Commons
                    poza_commons = _wikimedia_commons(atractie.nume)
                    if poza_commons:
                        atractie.imagineCopertaUrl = poza_commons
                        modificat = True
                        self.stdout.write(f"  🖼️ poză Commons", ending=" ")
                    else:
                        # Fallback 2: Unsplash
                        poza_unsplash = _unsplash(atractie.nume, unsplash_key)
                        if poza_unsplash:
                            atractie.imagineCopertaUrl = poza_unsplash
                            modificat = True
                            self.stdout.write(f"  🖼️ poză Unsplash", ending=" ")
                        else:
                            self.stdout.write(f"  ⚠️ fără poză", ending=" ")

            # ── Overpass ───────────────────────────────
            if not skip_coords:
                lat, lon, ore = _overpass(atractie.nume)

                if lat and lon:
                    atractie.latitudine  = lat
                    atractie.longitudine = lon
                    modificat = True

                if ore and not atractie.programVizitare:
                    atractie.programVizitare = ore
                    modificat = True

            # ── Salvare ────────────────────────────────
            if modificat:
                atractie.save()
                self.stdout.write(self.style.SUCCESS("✓ actualizat"))
            else:
                self.stdout.write(self.style.WARNING("— fără modificări"))

            # Pauză să nu supraîncărcăm API-urile gratuite
            time.sleep(1)

        self.stdout.write(self.style.SUCCESS(f"\nGata! {total} atracții procesate."))
