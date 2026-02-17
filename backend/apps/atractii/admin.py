from django.contrib import admin
from .models import AtractieTuristica


@admin.register(AtractieTuristica)
class AtractieTuristicaAdmin(admin.ModelAdmin):
    list_display = ('nume', 'tip', 'tarif', 'ratingMediu')
    search_fields = ('nume', 'descriere', 'tip')
    list_filter = ('tip',)
