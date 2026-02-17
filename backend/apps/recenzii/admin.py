from django.contrib import admin
from .models import Recenzie, ImagineRecenzie


class ImagineRecenzieInline(admin.TabularInline):
    """Afișează imaginile direct în pagina recenziei."""
    model = ImagineRecenzie
    extra = 1


@admin.register(Recenzie)
class RecenzieAdmin(admin.ModelAdmin):
    list_display = ('utilizator', 'atractie', 'nota', 'status', 'data')
    search_fields = ('utilizator__username', 'atractie__nume', 'text')
    list_filter = ('status', 'nota')
    inlines = [ImagineRecenzieInline]


@admin.register(ImagineRecenzie)
class ImagineRecenzieAdmin(admin.ModelAdmin):
    list_display = ('recenzie', 'imagineUrl')
