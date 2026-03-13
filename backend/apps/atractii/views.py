from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AtractieTuristica
from .serializers import AtractieTuristicaSerializer

class AtractieTuristicaViewSet(viewsets.ModelViewSet):
    queryset = AtractieTuristica.objects.all()
    serializer_class = AtractieTuristicaSerializer

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
            return Response({
                'corect': True,
                "mesaj": f'Bravo! Ai ghicit corect: {atractie.nume}! +20 XP',
            })
        else:
            return Response({
                'corect': False,
                'mesaj': 'Răspuns greșit, mai încearcă!',
            })