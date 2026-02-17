from django.contrib import admin
from .models import Traseu, PunctTraseu, TraseuPreparatLocal, TraseuFestival


class PunctTraseuInline(admin.TabularInline):
    """Afișează punctele traseului direct în pagina traseului."""
    model = PunctTraseu
    extra = 1


@admin.register(Traseu)
class TraseuAdmin(admin.ModelAdmin):
    list_display = ('punctStart', 'punctSosire', 'distantaKm', 'durataMin', 'estePrestabilit', 'utilizator')
    search_fields = ('punctStart', 'punctSosire')
    list_filter = ('estePrestabilit', 'tip')
    inlines = [PunctTraseuInline]


@admin.register(PunctTraseu)
class PunctTraseuAdmin(admin.ModelAdmin):
    list_display = ('traseu', 'ordine', 'atractie')
    list_filter = ('traseu',)


@admin.register(TraseuPreparatLocal)
class TraseuPreparatLocalAdmin(admin.ModelAdmin):
    list_display = ('traseu', 'preparat')


@admin.register(TraseuFestival)
class TraseuFestivalAdmin(admin.ModelAdmin):
    list_display = ('traseu', 'festival')
