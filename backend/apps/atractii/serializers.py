from rest_framework import serializers
from .models import AtractieTuristica

class AtractieTuristicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtractieTuristica
        fields = '__all__'