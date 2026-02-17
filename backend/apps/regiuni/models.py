from django.db import models


class PreparatLocal(models.Model):
    """Preparat tradițional local asociat unei regiuni."""
    nume = models.CharField(max_length=255)
    regiune = models.CharField(max_length=255)
    imagineUrl = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = 'preparat_local'
        verbose_name = 'Preparat Local'
        verbose_name_plural = 'Preparate Locale'

    def __str__(self):
        return f"{self.nume} ({self.regiune})"


class Festival(models.Model):
    """Festival care poate fi asociat unui traseu pe baza perioadei."""
    nume = models.CharField(max_length=255)
    dataStart = models.DateField()
    dataEnd = models.DateField()

    class Meta:
        db_table = 'festival'
        verbose_name = 'Festival'
        verbose_name_plural = 'Festivaluri'

    def __str__(self):
        return f"{self.nume} ({self.dataStart} - {self.dataEnd})"
