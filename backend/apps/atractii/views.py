from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AtractieTuristica
from .serializers import AtractieTuristicaSerializer
from apps.utilizatori.models import DescoperiAtractie, Badge, UtilizatorBadge, Notificare
from django.utils import timezone

class AtractieTuristicaViewSet(viewsets.ModelViewSet):
    serializer_class = AtractieTuristicaSerializer

    def get_queryset(self):
        queryset = AtractieTuristica.objects.all()

        tip = self.request.query_params.get('tip')
        if tip:
            queryset = queryset.filter(tip__icontains=tip)
        
        rating_min = self.request.query_params.get('rating_min')
        if rating_min:
            queryset = queryset.filter(ratingMediu__gte=float(rating_min))

        tarif_max = self.request.query_params.get('tarif_max')
        if tarif_max:
            queryset = queryset.filter(tarif__lte=float(tarif_max))
        
        gratuit = self.request.query_params.get('gratuit')
        if gratuit and gratuit.lower() == 'true':
            queryset = queryset.filter(tarif=0)

        return queryset

    @action(detail=True, methods=['get'], url_path='curiozitate', 
            permission_classes=[AllowAny])
    def curiozitate(self, request, pk=None):
        atractie = self.get_object()
        return Response({
            'id': atractie.id,
            'curiozitate': atractie.curiozitate,
        })
    
    @action(detail=True, methods=['post'], url_path='ghiceste', 
            permission_classes=[IsAuthenticated])
    def ghiceste(self, request, pk=None):
        atractie = self.get_object()
        raspuns = request.data.get('raspuns', '').strip().lower()
        raspuns_corect = atractie.nume.strip().lower()

        if raspuns == raspuns_corect:
            # Înregistrăm descoperirea
            descoperire, created = DescoperiAtractie.objects.get_or_create(
                utilizator=request.user,
                atractie=atractie,
            )
            
            if descoperire.esteDescoperita == 'N':
                descoperire.esteDescoperita = 'D'
                descoperire.dataDescoperire = timezone.now().date()
                descoperire.save()
                
                # Bonus XP
                request.user.xp += 20
                request.user.save()
                
                # Verificăm badge-uri
                self._verifica_badges(request.user)
                
                return Response({
                    'corect': True,
                    "mesaj": f'Bravo! Ai ghicit corect: {atractie.nume}! +20 XP',
                })
            else:
                return Response({
                    'corect': True,
                    'mesaj': f'Ai ghicit deja această atracție: {atractie.nume}!',
                })
        else:
            return Response({
                'corect': False,
                'mesaj': 'Răspuns greșit, mai încearcă!',
            })

    def _verifica_badges(self, utilizator):
        nr_descoperiri = DescoperiAtractie.objects.filter(utilizator=utilizator, esteDescoperita='D').count()
        praguri = {1: 'Prima descoperire', 5: 'Explorator', 10: 'Explorator Local', 25: 'Aventurier', 50: 'Maestru al României'}

        for prag, nume_badge in praguri.items():
            if nr_descoperiri >= prag:
                badge = Badge.objects.filter(nume=nume_badge).first()
                if badge and not UtilizatorBadge.objects.filter(utilizator=utilizator, badge=badge).exists():
                    UtilizatorBadge.objects.create(utilizator=utilizator, badge=badge)
                    # Notificare
                    Notificare.objects.create(
                        utilizator=utilizator,
                        tip='badge',
                        mesaj=f"Felicitări! Ai obținut badge-ul: {nume_badge}"
                    )