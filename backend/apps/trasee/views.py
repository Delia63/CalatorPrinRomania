import requests
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Traseu
from .serializers import TraseuSerializer
from apps.atractii.models import AtractieTuristica
from apps.regiuni.models import Festival, PreparatLocal
from datetime import datetime
import math

def distanta_punct_la_linie(punct, linie):
    # calculare dist min dintre un punct si o linie GeoJSON
    lat_p, lon_p = punct
    min_dist = float('inf')

    coords = linie['geometry']['coordinates']
    for i in range(len(coords) - 1):
        lon1, lat1 = coords[i]
        lon2, lat2 = coords[i + 1]

        # dist aprox in km
        dx = (lon2 - lon1) * math.cos(math.radians((lat1 + lat2) / 2)) * 111
        dy = (lat2 - lat1) * 111
        length_sq = dx**2 + dy**2

        if length_sq == 0:
            dist = math.sqrt(((lon_p - lon1) * math.cos(math.radians(lat1)) * 111)**2 + ((lat_p - lat1) * 111)**2)
        else:
            dpx = (lon_p - lon1) * math.cos(math.radians(lat1)) * 111
            dpy = (lat_p - lat1) * 111
            t = max(0, min(1, (dpx * dx + dpy * dy) / length_sq))
            dist = math.sqrt((dpx - t * dx)**2 + (dpy - t *dy)**2)

        min_dist = min(min_dist, dist)

    return min_dist
    

class TraseuViewSet(viewsets.ModelViewSet):
    queryset = Traseu.objects.all()
    serializer_class = TraseuSerializer

    @action(detail=False, methods=['post'], url_path='calculeaza')
    def calculeaza(self, request):
        punct_start = request.data.get('punctStart')
        punct_sosire = request.data.get('punctSosire')
        abatere_km = float(request.data.get('abatereMaxKm', 10))

        if not punct_start or not punct_sosire:
            return Response({
                'error': 'punctStart si punctSosire sunt obligatorii'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # apel API ORS
        def geocode(loc):
            url = 'https://api.openrouteservice.org/geocode/search'
            params = {
                'api_key': settings.ORS_API_KEY,
                'text': loc + ', Romania',
                'size': 1
            }
            r = requests.get(url, params=params)
            data = r.json()
            coords = data['features'][0]['geometry']['coordinates']
            
            return coords
        
        try:
            start_coords = geocode(punct_start)
            end_coords = geocode(punct_sosire)
        except Exception:
            return Response({
                'error': 'Nu am putut gasi una dintre locatii'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # apel ORS directions
        url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'
        headers = {
            'Authorization': settings.ORS_API_KEY,
            'Content-Type': 'application/json'
        }
        body = {'coordinates': [start_coords, end_coords], 'preference': 'shortest'}

        try:
            r = requests.post(url, json=body, headers=headers)
            ruta = r.json()
        except Exception:
            return Response({
                'error': 'Eroare la calculul traseului'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # gasire atractii de a lungul traseului
        feature = ruta['features'][0]
        summary = feature['properties']['summary']

        atractii_pe_traseu = []
        for atractie in AtractieTuristica.objects.all():
            dist = distanta_punct_la_linie((float(atractie.latitudine), float(atractie.longitudine)), feature)

            if dist <= abatere_km:
                atractii_pe_traseu.append({
                    'id': atractie.id,
                    'nume': atractie.nume,
                    'tip': atractie.tip,
                    'latitudine': float(atractie.latitudine),
                    'longitudine': float(atractie.longitudine),
                    'tarif': float(atractie.tarif),
                    'ratingMediu': float(atractie.ratingMediu),
                    'imagineCopertaUrl': atractie.imagineCopertaUrl,
                })
        
        festivaluri_pe_traseu = []
        data_start = request.data.get('dataStart')
        data_end = request.data.get('dataEnd')
        if data_start and data_end:
            data_start = datetime.strptime(data_start, '%Y-%m-%d').date()
            data_end = datetime.strptime(data_end, '%Y-%m-%d').date()
            festivaluri = Festival.objects.filter(
                dataStart__lte=data_end,
                dataEnd__gte=data_start
            )
            for f in festivaluri:
                festivaluri_pe_traseu.append({
                    'id': f.id,
                    'nume': f.nume,
                    'dataStart': str(f.dataStart),
                    'dataEnd': str(f.dataEnd),
                })

        regiuni_traseu = set()
        route_coords = feature['geometry']['coordinates']
        for coord in route_coords[::50]:
            lon, lat = coord
            if lat > 47.0:
                regiuni_traseu.add('Maramureș')
                regiuni_traseu.add('Moldova')
            elif lat > 46.0 and lon < 24.0:
                regiuni_traseu.add('Transilvania')
            elif lat > 46.0 and lon > 26.0:
                regiuni_traseu.add('Moldova')
            elif lat > 45.5:
                regiuni_traseu.add('Transilvania')
            elif lat < 44.5 and lon > 25.0:
                regiuni_traseu.add('Muntenia')
            elif lat < 45.5 and lon < 24.0:
                regiuni_traseu.add('Oltenia')
            elif lon > 28.0:
                regiuni_traseu.add('Dobrogea')
            else:
                regiuni_traseu.add('Muntenia')
                regiuni_traseu.add('Transilvania')

        preparate_pe_traseu = []
        if regiuni_traseu:
                preparate = PreparatLocal.objects.filter(regiune__in = regiuni_traseu)

                for p in preparate:
                    preparate_pe_traseu.append({
                        'id': p.id,
                        'nume': p.nume,
                        'regiune': p.regiune,
                    })

        res_data = {
            'geojson': ruta,
            'distantaKm': round(summary['distance'] / 1000, 2),
            'durataMin': round(summary['duration'] / 60),
            'atractii': atractii_pe_traseu,
            'festivaluri': festivaluri_pe_traseu,
            'preparate': preparate_pe_traseu,
        }

        if request.user.is_authenticated:
            Traseu.objects.create(
                utilizator = request.user,
                punctStart = punct_start,
                punctSosire = punct_sosire,
                distantaKm = res_data['distantaKm'],
                durataMin = res_data['durataMin'],
                tip = 'automat'
            )

        return Response(res_data)
    
    @action(detail=False, methods=['get'], url_path='prestabilite')
    def prestabilite(self, request):
        trasee = Traseu.objects.filter(estePrestabilit=True)
        serializer = self.get_serializer(trasee, many=True)

        return Response(serializer.data)
            
