from django.db import models


class Traseu(models.Model):
    """Traseu introdus de utilizator sau prestabilit."""
    punctStart = models.CharField(max_length=255)
    punctSosire = models.CharField(max_length=255)
    distantaKm = models.DecimalField(max_digits=19, decimal_places=2)
    durataMin = models.IntegerField()
    dataPlanificata = models.DateField(null=True, blank=True)
    abatereMaxKm = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True)
    tip = models.CharField(max_length=255, blank=True, default='')
    estePrestabilit = models.BooleanField(default=False)
    utilizator = models.ForeignKey(
        'utilizatori.Utilizator',
        on_delete=models.CASCADE,
        related_name='trasee',
        null=True,
        blank=True  # traseele prestabilite nu au utilizator
    )

    class Meta:
        db_table = 'traseu'
        verbose_name = 'Traseu'
        verbose_name_plural = 'Trasee'

    def __str__(self):
        return f"{self.punctStart} → {self.punctSosire}"


class PunctTraseu(models.Model):
    """Punct (atracție) pe un traseu, cu ordinea sa."""
    ordine = models.IntegerField()
    atractie = models.ForeignKey(
        'atractii.AtractieTuristica',
        on_delete=models.CASCADE,
        related_name='puncte_traseu'
    )
    traseu = models.ForeignKey(
        Traseu,
        on_delete=models.CASCADE,
        related_name='puncte'
    )

    class Meta:
        db_table = 'punct_traseu'
        verbose_name = 'Punct Traseu'
        verbose_name_plural = 'Puncte Traseu'
        ordering = ['ordine']

    def __str__(self):
        return f"#{self.ordine} - {self.atractie.nume} (Traseu: {self.traseu})"


class TraseuPreparatLocal(models.Model):
    """Legătură M:N între Traseu și PreparatLocal."""
    traseu = models.ForeignKey(
        Traseu,
        on_delete=models.CASCADE,
        related_name='preparate'
    )
    preparat = models.ForeignKey(
        'regiuni.PreparatLocal',
        on_delete=models.CASCADE,
        related_name='trasee'
    )

    class Meta:
        db_table = 'traseu_preparat_local'
        verbose_name = 'Traseu - Preparat Local'
        verbose_name_plural = 'Traseu - Preparate Locale'
        unique_together = ('traseu', 'preparat')

    def __str__(self):
        return f"{self.traseu} - {self.preparat.nume}"


class TraseuFestival(models.Model):
    """Legătură M:N între Traseu și Festival."""
    traseu = models.ForeignKey(
        Traseu,
        on_delete=models.CASCADE,
        related_name='festivaluri'
    )
    festival = models.ForeignKey(
        'regiuni.Festival',
        on_delete=models.CASCADE,
        related_name='trasee'
    )

    class Meta:
        db_table = 'traseu_festival'
        verbose_name = 'Traseu - Festival'
        verbose_name_plural = 'Traseu - Festivaluri'
        unique_together = ('traseu', 'festival')

    def __str__(self):
        return f"{self.traseu} - {self.festival.nume}"
