from django.db import models
from django.contrib.auth.models import AbstractUser


class Utilizator(AbstractUser):
    """Utilizator custom care extinde AbstractUser din Django."""
    rol = models.CharField(max_length=255, default='utilizator')
    nivel = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)

    class Meta:
        db_table = 'utilizator'
        verbose_name = 'Utilizator'
        verbose_name_plural = 'Utilizatori'

    def __str__(self):
        return self.username


class Badge(models.Model):
    """Badge pe care utilizatorii îl pot obține."""
    nume = models.CharField(max_length=255)
    descriere = models.CharField(max_length=255)
    criteriu = models.CharField(max_length=255)
    iconUrl = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = 'badge'
        verbose_name = 'Badge'
        verbose_name_plural = 'Badge-uri'

    def __str__(self):
        return self.nume


class UtilizatorBadge(models.Model):
    """Legătură M:N între Utilizator și Badge."""
    utilizator = models.ForeignKey(
        Utilizator,
        on_delete=models.CASCADE,
        related_name='badge_uri'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='utilizatori'
    )
    dataObtinere = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'utilizator_badge'
        verbose_name = 'Utilizator Badge'
        verbose_name_plural = 'Utilizator Badge-uri'
        unique_together = ('utilizator', 'badge')
    
    def __str__(self):
        return f"{self.utilizator.username} - {self.badge.nume}"

    
class Notificare(models.Model):
    TIP_CHOICES = [
        ('badge', 'Badge Nou'),
        ('recenzie', 'Status Recenzie'),
        ('admin', 'Mesaj Admin'),
        ('altul', 'Altul'),
    ]

    mesaj = models.TextField()
    tip = models.CharField(max_length=20, choices=TIP_CHOICES, default='altul')
    esteCitita = models.BooleanField(default=False)
    dataCreare = models.DateTimeField(auto_now_add=True)
    utilizator = models.ForeignKey(
        Utilizator,
        on_delete=models.CASCADE,
        related_name='notificari'
    )

    class Meta:
        db_table = 'notificare'
        verbose_name = 'Notificare'
        verbose_name_plural = 'Notificari'
        ordering = ['-dataCreare']
    
    def __str__(self):
        return f"{self.utilizator.username} - {self.tip}"

    
class DescoperiAtractie(models.Model):
    """Progresul unui utilizator în ghicirea unei atracții."""
    esteDescoperita = models.CharField(max_length=1, default='N')  # 'D' sau 'N'
    dataDescoperire = models.DateField(null=True, blank=True)
    incercari = models.IntegerField(default=0)
    intrebariCuroare = models.IntegerField(default=0)  # hints folosite
    utilizator = models.ForeignKey(
        Utilizator,
        on_delete=models.CASCADE,
        related_name='descoperiri'
    )
    atractie = models.ForeignKey(
        'atractii.AtractieTuristica',
        on_delete=models.CASCADE,
        related_name='descoperiri'
    )

    class Meta:
        db_table = 'descoperi_atractie'
        verbose_name = 'Descoperire Atracție'
        verbose_name_plural = 'Descoperiri Atracții'
        unique_together = ('utilizator', 'atractie')

    def __str__(self):
        status = 'Descoperită' if self.esteDescoperita == 'D' else 'Nedescoperită'
        return f"{self.utilizator.username} - {self.atractie.nume} ({status})"
