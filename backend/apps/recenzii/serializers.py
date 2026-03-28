from rest_framework import serializers
from .models import Recenzie, ImagineRecenzie

class ImagineRecenzieSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagineRecenzie
        fields = ('id', 'recenzie', 'imagine')
        read_only_fields = ('id',)

class RecenzieSerializer(serializers.ModelSerializer):
    imagini = ImagineRecenzieSerializer(many=True, read_only=True)
    utilizator_username = serializers.ReadOnlyField(source='utilizator.username')

    class Meta:
        model = Recenzie
        fields = (
            'id', 'text', 'nota', 'data', 'status', 'motivRespingere',
            'utilizator', 'utilizator_username', 'atractie', 'imagini'
        )
        read_only_fields = ('utilizator', 'status', 'data', 'motivRespingere')