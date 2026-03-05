from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Utilizator, Badge, UtilizatorBadge, DescoperiAtractie
from .serializers import (
    InregistrareSerializer, UtilizatorSerializer, BadgeSerializer, UtilizatorBadgeSerializer
)
from apps.atractii.models import AtractieTuristica

class InregistrareView(generics.CreateAPIView):
    queryset = Utilizator.objects.all()
    permission_classes = [AllowAny]
    serializer_class = InregistrareSerializer


class ProfilView(generics.RetrieveAPIView):
    serializer_class = UtilizatorSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='ale-mele')
    def ale_mele(self, request):
        badges = UtilizatorBadge.objects.filter(utilizator=request.user)
        serializer = UtilizatorBadgeSerializer(badges, many=True)
        return Response(serializer.data)
    

class DescoperaAtractieView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        atractie_id = request.data.get('atractie_id')

        try:
            atractie = AtractieTuristica.objects.get(id=atractie_id)
        except AtractieTuristica.DoesNotExist:
            return Response({'error': 'Atracție negăsită'}, status=status.HTTP_404_NOT_FOUND)
        
        descoperire, created = DescoperiAtractie.objects.get_or_create(
            utilizator=request.user,
            atractie=atractie,
        )

        if not created:
            return Response({'mesaj': 'Atracție deja descoperită'}, status=status.HTTP_200_OK)
        
        request.user.xp += 10
        request.user.save()

        badges_acordate = self._verifica_badges(request.user)

        return Response({
            'mesaj': 'Atracție descoperită! +10 XP',
            'xp_total': request.user.xp,
            'badges_noi': badges_acordate,
        }, status=status.HTTP_201_CREATED)
    
    def _verifica_badges(self, utilizator):
        nr_descoperiri = DescoperiAtractie.objects.filter(utilizator=utilizator).count()
        badges_noi=[]

        praguri = {1: 'Prima descoperire', 5: 'Explorator', 10: 'Aventurier', 25: 'Călător', 50: 'Expert'}

        for prag, nume_badge in  praguri.items():
            if nr_descoperiri >= prag:
                badge = Badge.objects.filter(nume=nume_badge).first()
                if badge and not UtilizatorBadge.objects.filter(utilizator=utilizator, badge=badge).exists():
                    UtilizatorBadge.objects.create(utilizator=utilizator, badge=badge)
                    badges_noi.append(nume_badge)

        return badges_noi
    
