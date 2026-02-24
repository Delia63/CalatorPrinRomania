from django.core.management.base import BaseCommand
from apps.atractii.models import AtractieTuristica
from apps.regiuni.models import PreparatLocal, Festival
from apps.utilizatori.models import Badge


class Command(BaseCommand):
    help = 'Populează baza de date cu date de test pentru CalatorPrinRomania'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Șterge datele existente înainte de a adăuga altele noi',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Șterg datele existente...')
            AtractieTuristica.objects.all().delete()
            PreparatLocal.objects.all().delete()
            Festival.objects.all().delete()
            Badge.objects.all().delete()
            self.stdout.write(self.style.WARNING('Date șterse!'))

        self._seed_atractii()
        self._seed_preparate()
        self._seed_festivaluri()
        self._seed_badge_uri()

        self.stdout.write(self.style.SUCCESS('Date de test adăugate cu succes!'))

    def _seed_atractii(self):
        atractii = [
            # === CASTELE ===
            {
                'nume': 'Castelul Bran',
                'descriere': 'Cunoscut drept "Castelul lui Dracula", este unul dintre cele mai vizitate obiective turistice din România.',
                'tip': 'castel',
                'latitudine': 45.5150,
                'longitudine': 25.3670,
                'programVizitare': 'Luni: 12:00-18:00, Marți-Duminică: 09:00-18:00',
                'tarif': 50,
                'curiozitate': 'Ce castel din Brașov este asociat cu legenda lui Dracula, deși Vlad Țepeș nu a locuit niciodată aici?',
            },
            {
                'nume': 'Castelul Peleș',
                'descriere': 'Castel neorenascentist din Sinaia, fost reședință regală a României.',
                'tip': 'castel',
                'latitudine': 45.3600,
                'longitudine': 25.5420,
                'programVizitare': 'Miercuri-Duminică: 09:15-16:15',
                'tarif': 50,
                'curiozitate': 'Ce castel din Sinaia a fost primul din Europa iluminat integral cu electricitate?',
            },
            {
                'nume': 'Castelul Corvinilor',
                'descriere': 'Castel gotic din Hunedoara, unul dintre cele mai mari castele din Europa.',
                'tip': 'castel',
                'latitudine': 45.7489,
                'longitudine': 22.8881,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 40,
                'curiozitate': 'Ce castel gotic din Hunedoara se spune că l-a ținut prizonier pe Vlad Țepeș timp de 7 ani?',
            },
            {
                'nume': 'Cetatea Alba Carolina',
                'descriere': 'Cetate bastionară de tip Vauban, cea mai mare din România.',
                'tip': 'cetate',
                'latitudine': 46.0667,
                'longitudine': 23.5700,
                'programVizitare': 'Non-stop (exterior), Muzeu: 10:00-18:00',
                'tarif': 0,
                'curiozitate': 'Ce cetate în formă de stea din Alba Iulia a fost locul Marii Uniri din 1918?',
            },
            # === BISERICI ȘI MĂNĂSTIRI ===
            {
                'nume': 'Mănăstirea Voroneț',
                'descriere': 'Cunoscută drept "Capela Sixtină a Estului" datorită frescelor sale exterioare.',
                'tip': 'biserică',
                'latitudine': 47.5167,
                'longitudine': 25.8667,
                'programVizitare': 'Zilnic: 08:00-18:00',
                'tarif': 10,
                'curiozitate': 'Ce mănăstire din Bucovina este numită "Capela Sixtină a Estului" datorită albastului unic al frescelor?',
            },
            {
                'nume': 'Mănăstirea Sucevița',
                'descriere': 'Mănăstire fortificată din Bucovina cu fresce exterioare bine conservate.',
                'tip': 'biserică',
                'latitudine': 47.7833,
                'longitudine': 25.7167,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 10,
                'curiozitate': 'Ce mănăstire fortificată din Bucovina are cea mai mare suprafață de fresce exterioare din Moldova?',
            },
            {
                'nume': 'Biserica Neagră',
                'descriere': 'Cea mai mare biserică în stil gotic din sud-estul Europei, situată în Brașov.',
                'tip': 'biserică',
                'latitudine': 45.6403,
                'longitudine': 25.5887,
                'programVizitare': 'Luni-Sâmbătă: 10:00-17:00',
                'tarif': 15,
                'curiozitate': 'Ce biserică gotică din Brașov și-a primit numele după un incendiu devastator din 1689?',
            },
            # === PEȘTERI ===
            {
                'nume': 'Peștera Scărișoara',
                'descriere': 'Adăpostește cel mai mare ghețar subteran din România.',
                'tip': 'peșteră',
                'latitudine': 46.4903,
                'longitudine': 22.8133,
                'programVizitare': 'Marți-Duminică: 09:00-17:00',
                'tarif': 20,
                'curiozitate': 'Ce peșteră din Munții Apuseni adăpostește un ghețar subteran vechi de peste 3.500 de ani?',
            },
            {
                'nume': 'Peștera Muierilor',
                'descriere': 'Peșteră cu stalactite și stalagmite spectaculoase din Gorj.',
                'tip': 'peșteră',
                'latitudine': 45.1667,
                'longitudine': 23.7167,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 15,
                'curiozitate': 'Ce peșteră din Gorj și-a primit numele de la femeile care se ascundeau aici în timpul invaziilor otomane?',
            },
            # === NATURĂ ===
            {
                'nume': 'Salina Turda',
                'descriere': 'Mină de sare transformată în parc de distracții subteran, unică în lume.',
                'tip': 'mină',
                'latitudine': 46.5870,
                'longitudine': 23.7860,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 50,
                'curiozitate': 'Ce mină de sare din Transilvania a fost transformată într-un parc de distracții subteran unic în lume?',
            },
            {
                'nume': 'Transfăgărășanul',
                'descriere': 'Cel mai spectaculos drum din România, traversând Munții Făgăraș.',
                'tip': 'drum',
                'latitudine': 45.5986,
                'longitudine': 24.6153,
                'programVizitare': 'Deschis iunie-octombrie (în funcție de vreme)',
                'tarif': 0,
                'curiozitate': 'Ce drum montan din România a fost numit de Top Gear "cel mai frumos drum din lume"?',
            },
            {
                'nume': 'Lacul Sfânta Ana',
                'descriere': 'Singurul lac vulcanic din România, situat în craterul vulcanului Ciomatu.',
                'tip': 'lac',
                'latitudine': 46.1281,
                'longitudine': 25.8800,
                'programVizitare': 'Non-stop',
                'tarif': 5,
                'curiozitate': 'Ce lac din Harghita este singurul lac vulcanic din sud-estul Europei?',
            },
            # === MUZEE ===
            {
                'nume': 'Muzeul ASTRA',
                'descriere': 'Cel mai mare muzeu în aer liber din România, situat în Sibiu.',
                'tip': 'muzeu',
                'latitudine': 45.7700,
                'longitudine': 24.1167,
                'programVizitare': 'Marți-Duminică: 10:00-18:00',
                'tarif': 30,
                'curiozitate': 'Ce muzeu în aer liber din Sibiu prezintă peste 300 de construcții tradiționale din toată România?',
            },
            {
                'nume': 'Muzeul Satului',
                'descriere': 'Muzeu etnografic în aer liber din București, cu gospodării tradiționale.',
                'tip': 'muzeu',
                'latitudine': 44.4725,
                'longitudine': 26.0767,
                'programVizitare': 'Marți-Duminică: 09:00-17:00',
                'tarif': 20,
                'curiozitate': 'Ce muzeu din București aflat pe malul lacului Herăstrău prezintă case țărănești din toate regiunile țării?',
            },
            {
                'nume': 'Sfinxul Bucegilor',
                'descriere': 'Formațiune stâncoasă naturală care seamănă cu un sfinx, situată la 2.216m altitudine.',
                'tip': 'formațiune naturală',
                'latitudine': 45.4000,
                'longitudine': 25.4500,
                'programVizitare': 'Non-stop',
                'tarif': 0,
                'curiozitate': 'Ce formațiune stâncoasă din Bucegi, la peste 2.200m altitudine, seamănă cu capul unui sfinx?',
            },
        ]

        count = 0
        for data in atractii:
            obj, created = AtractieTuristica.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Atracții turistice: {count} adăugate')

    def _seed_preparate(self):
        preparate = [
            # Transilvania
            {'nume': 'Ciorbă de burtă', 'regiune': 'Transilvania'},
            {'nume': 'Varză à la Cluj', 'regiune': 'Transilvania'},
            {'nume': 'Kürtőskalács (Cozonac secuiesc)', 'regiune': 'Transilvania'},
            {'nume': 'Balmoș', 'regiune': 'Transilvania'},
            {'nume': 'Papanași ardelenești', 'regiune': 'Transilvania'},
            # Moldova
            {'nume': 'Ciorbă de perișoare', 'regiune': 'Moldova'},
            {'nume': 'Tochitură moldovenească', 'regiune': 'Moldova'},
            {'nume': 'Plăcintă cu brânză', 'regiune': 'Moldova'},
            {'nume': 'Alivenci', 'regiune': 'Moldova'},
            # Muntenia / Oltenia
            {'nume': 'Sarmale', 'regiune': 'Muntenia'},
            {'nume': 'Pomana porcului', 'regiune': 'Oltenia'},
            {'nume': 'Ciorbă de fasole cu ciolan afumat', 'regiune': 'Oltenia'},
            {'nume': 'Mici (Mititei)', 'regiune': 'Muntenia'},
            # Maramureș
            {'nume': 'Tocană de cartofi', 'regiune': 'Maramureș'},
            {'nume': 'Cârnaț afumat de Maramureș', 'regiune': 'Maramureș'},
            {'nume': 'Struț de Maramureș', 'regiune': 'Maramureș'},
            # Dobrogea
            {'nume': 'Saramură de crap', 'regiune': 'Dobrogea'},
            {'nume': 'Plachie de pește', 'regiune': 'Dobrogea'},
            # Banat
            {'nume': 'Rață pe varză', 'regiune': 'Banat'},
            {'nume': 'Gomboți cu prune', 'regiune': 'Banat'},
        ]

        count = 0
        for data in preparate:
            obj, created = PreparatLocal.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Preparate locale: {count} adăugate')

    def _seed_festivaluri(self):
        from datetime import date

        festivaluri = [
            {'nume': 'Festivalul Medieval Sighișoara', 'dataStart': date(2026, 7, 24), 'dataEnd': date(2026, 7, 26)},
            {'nume': 'Untold Festival', 'dataStart': date(2026, 8, 6), 'dataEnd': date(2026, 8, 9)},
            {'nume': 'Electric Castle', 'dataStart': date(2026, 7, 15), 'dataEnd': date(2026, 7, 19)},
            {'nume': 'Festivalul Ouălor Încondeiate – Ciocănești', 'dataStart': date(2026, 4, 10), 'dataEnd': date(2026, 4, 12)},
            {'nume': 'Festivalul Internațional de Teatru Sibiu (FITS)', 'dataStart': date(2026, 6, 12), 'dataEnd': date(2026, 6, 21)},
            {'nume': 'Neversea', 'dataStart': date(2026, 7, 2), 'dataEnd': date(2026, 7, 5)},
            {'nume': 'Festivalul Medieval Brașov – Junii Brașovului', 'dataStart': date(2026, 5, 1), 'dataEnd': date(2026, 5, 3)},
            {'nume': 'Sambra Oilor – Bran', 'dataStart': date(2026, 4, 20), 'dataEnd': date(2026, 4, 20)},
            {'nume': 'Hora de la Prislop', 'dataStart': date(2026, 8, 15), 'dataEnd': date(2026, 8, 15)},
            {'nume': 'Festivalul Sarmale Satu Mare', 'dataStart': date(2026, 9, 5), 'dataEnd': date(2026, 9, 7)},
        ]

        count = 0
        for data in festivaluri:
            obj, created = Festival.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Festivaluri: {count} adăugate')

    def _seed_badge_uri(self):
        badge_uri = [
            {
                'nume': 'Exploratorul Carpaților',
                'descriere': 'Ai descoperit 5 atracții montane sau peșteri',
                'criteriu': 'descoperiri_munte_pestera >= 5',
                'iconUrl': '🏔️',
            },
            {
                'nume': 'Iubitorul de Castele',
                'descriere': 'Ai descoperit 3 castele sau cetăți',
                'criteriu': 'descoperiri_castel_cetate >= 3',
                'iconUrl': '🏰',
            },
            {
                'nume': 'Pelerin Credincios',
                'descriere': 'Ai descoperit 5 biserici sau mănăstiri',
                'criteriu': 'descoperiri_biserica >= 5',
                'iconUrl': '⛪',
            },
            {
                'nume': 'Explorator Local',
                'descriere': 'Ai descoperit 10 atracții turistice',
                'criteriu': 'total_descoperiri >= 10',
                'iconUrl': '🗺️',
            },
            {
                'nume': 'Aventurier',
                'descriere': 'Ai descoperit 25 de atracții turistice',
                'criteriu': 'total_descoperiri >= 25',
                'iconUrl': '🧭',
            },
            {
                'nume': 'Maestru al României',
                'descriere': 'Ai descoperit 50 de atracții turistice',
                'criteriu': 'total_descoperiri >= 50',
                'iconUrl': '👑',
            },
            {
                'nume': 'Primul Traseu',
                'descriere': 'Ai completat primul tău traseu',
                'criteriu': 'trasee_completate >= 1',
                'iconUrl': '🚗',
            },
            {
                'nume': 'Călător Experimentat',
                'descriere': 'Ai completat 5 trasee',
                'criteriu': 'trasee_completate >= 5',
                'iconUrl': '✈️',
            },
        ]

        count = 0
        for data in badge_uri:
            obj, created = Badge.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Badge-uri: {count} adăugate')
