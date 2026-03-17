from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Utilizator, Badge, UtilizatorBadge, Notificare, DescoperiAtractie

class InregistrareSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Utilizator
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Parolele nu coincid!'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = Utilizator.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user
    

class UtilizatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilizator
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'rol', 'nivel', 'xp')
        read_only_fields = ('rol', 'nivel', 'xp')


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UtilizatorBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UtilizatorBadge
        fields = ('id', 'badge', 'dataObtinere')

class NotificareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificare
        fields = '__all__'

class DescoperireAtractieSerializer(serializers.ModelSerializer):
    atractie_nume = serializers.ReadOnlyField(source='atractie.nume')

    class Meta:
        model = DescoperiAtractie
        fields = ('id', 'atractie', 'atractie_nume', 'esteDescoperita', 'dataDescoperire', 'incercari')
