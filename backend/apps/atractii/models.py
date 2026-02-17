from django.db import models


class AtractieTuristica(models.Model):
    """Atracție turistică de pe teritoriul României."""
    nume = models.CharField(max_length=255)
    descriere = models.TextField()
    tip = models.CharField(max_length=255)  # castel, peșteră, biserică, etc.
    latitudine = models.DecimalField(max_digits=19, decimal_places=10)
    longitudine = models.DecimalField(max_digits=19, decimal_places=10)
    programVizitare = models.CharField(max_length=255, blank=True, default='')
    tarif = models.DecimalField(max_digits=19, decimal_places=2, default=0)
    ratingMediu = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    imagineCopertaUrl = models.CharField(max_length=255, blank=True, default='')
    curiozitate = models.TextField(blank=True, default='')  # hint pt mecanism ghicire

    class Meta:
        db_table = 'atractie_turistica'
        verbose_name = 'Atracție Turistică'
        verbose_name_plural = 'Atracții Turistice'

    def __str__(self):
        return f"{self.nume} ({self.tip})"
