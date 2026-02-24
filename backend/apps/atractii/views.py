from rest_framework import viewsets
from .models import AtractieTuristica
from .serializers import AtractieTuristicaSerializer

class AtractieTuristicaViewSet(viewsets.ModelViewSet):
    queryset = AtractieTuristica.objects.all()
    serializer_class = AtractieTuristicaSerializer