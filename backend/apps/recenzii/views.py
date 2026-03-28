from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Avg

from .models import Recenzie, ImagineRecenzie
from .serializers import RecenzieSerializer,ImagineRecenzieSerializer
from apps.utilizatori.models import Notificare, Utilizator

class RecenzieViewSet(viewsets.ModelViewSet):
    serializer_class = RecenzieSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Recenzie.objects.all()
        atractie_id = self.request.query_params.get('atractie')
        if atractie_id:
            queryset = queryset.filter(atractie_id=atractie_id)
        return queryset
    
    def perform_create(self, serializer):
        recenzie = serializer.save(utilizator=self.request.user)
        admini = Utilizator.objects.filter(is_staff=True)
        for admin in admini:
            Notificare.objects.create(
                utilizator=admin,
                tip='admin',
                mesaj=f"Recenzie nouă de la {self.request.user.username} "
                    f"pentru {recenzie.atractie.nume} — necesită aprobare"
            )
    
    @action(detail=True, methods=['patch'], url_path='aproba',
            permission_classes=[IsAdminUser])
    def aproba(self, request, pk=None):
        recenzie = self.get_object()
        recenzie.status = 'aprobata'
        recenzie.save()

        self._recalculeaza_rating(recenzie.atractie)
        Notificare.objects.create(
            utilizator=recenzie.utilizator,
            tip='recenzie',
            mesaj=f"Recenzia ta pentru {recenzie.atractie.nume} a fost aprobată! ✅"
        )
        return Response({'status': 'aprobata'})
    
    @action(detail=True, methods=['patch'], url_path='respinge',
            permission_classes=[IsAdminUser])
    def respinge(self, request, pk=None):
        recenzie = self.get_object()
        motiv = request.data.get('motiv', 'Fără motiv specificat')
        recenzie.status = 'respinsa'
        recenzie.motivRespingere = motiv
        recenzie.save()

        Notificare.objects.create(
            utilizator=recenzie.utilizator,
            tip='recenzie',
            mesaj=f"Recenzia ta pentru {recenzie.atractie.nume} a fost respinsă. "
                  f"Motiv: {motiv}"
        )
        return Response({'status': 'respinsa'})
    
    def _recalculeaza_rating(self, atractie):
        avg = Recenzie.objects.filter(
            atractie=atractie, status='aprobata'
        ).aggregate(Avg('nota'))['nota__avg']
        atractie.ratingMediu = round(avg,2) if avg else 0
        atractie.save()

    @action(detail=False, methods=['get'], url_path='ale-mele')
    def ale_mele(self,request):
        recenzii = Recenzie.objects.filter(utilizator=request.user)
        serializer = self.get_serializer(recenzii, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='aprobate')
    def aprobate(self, request):
        atractie_id = request.query_params.get('atractie')
        recenzii = Recenzie.objects.filter(status='aprobata')
        if atractie_id:
            recenzii = recenzii.filter(atractie_id=atractie_id)
        serializer = self.get_serializer(recenzii, many=True)
        return Response(serializer.data)
    
class ImagineRecenzieViewSet(viewsets.ModelViewSet):
    serializer_class = ImagineRecenzieSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
         return ImagineRecenzie.objects.all()
        
    def perform_create(self, serializer):
        serializer.save()
        