from django.db import models


class Recenzie(models.Model):
    """Recenzie lăsată de un utilizator pentru o atracție turistică."""
    text = models.CharField(max_length=255)
    nota = models.IntegerField()  # 1-5
    data = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=255, default='in_asteptare')  # in_asteptare, aprobata, respinsa
    motivRespingere = models.CharField(max_length=255, blank=True, default='')
    utilizator = models.ForeignKey(
        'utilizatori.Utilizator',
        on_delete=models.CASCADE,
        related_name='recenzii'
    )
    atractie = models.ForeignKey(
        'atractii.AtractieTuristica',
        on_delete=models.CASCADE,
        related_name='recenzii'
    )

    class Meta:
        db_table = 'recenzie'
        verbose_name = 'Recenzie'
        verbose_name_plural = 'Recenzii'

    def __str__(self):
        return f"{self.utilizator.username} - {self.atractie.nume} ({self.nota}★)"


class ImagineRecenzie(models.Model):
    """Imagine atașată unei recenzii (trebuie aprobată de admin)."""
    recenzie = models.ForeignKey(
        Recenzie,
        on_delete=models.CASCADE,
        related_name='imagini'
    )
    imagineUrl = models.CharField(max_length=255)

    class Meta:
        db_table = 'imagine_recenzie'
        verbose_name = 'Imagine Recenzie'
        verbose_name_plural = 'Imagini Recenzii'

    def __str__(self):
        return f"Imagine - {self.recenzie}"
