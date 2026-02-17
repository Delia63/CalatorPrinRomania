from django.contrib import admin
from .models import PreparatLocal, Festival


@admin.register(PreparatLocal)
class PreparatLocalAdmin(admin.ModelAdmin):
    list_display = ('nume', 'regiune')
    search_fields = ('nume', 'regiune')
    list_filter = ('regiune',)


@admin.register(Festival)
class FestivalAdmin(admin.ModelAdmin):
    list_display = ('nume', 'dataStart', 'dataEnd')
    search_fields = ('nume',)
    list_filter = ('dataStart',)
