from rest_framework import serializers
from .models import Traseu, PunctTraseu

class PunctTraseuSerializer(serializers.ModelSerializer):
    class Meta:
        model = PunctTraseu
        fields = '__all__'

class TraseuSerializer(serializers.ModelSerializer):
    puncte = PunctTraseuSerializer(many=True, read_only=True)
    class Meta:
        model = Traseu
        fields = '__all__'