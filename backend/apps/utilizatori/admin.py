from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilizator, Badge, UtilizatorBadge, DescoperiAtractie


@admin.register(Utilizator)
class UtilizatorAdmin(UserAdmin):
    """Admin pentru Utilizator — extinde UserAdmin pentru a include câmpurile custom."""
    fieldsets = UserAdmin.fieldsets + (
        ('Profil Călător', {'fields': ('rol', 'nivel', 'xp')}),
    )
    list_display = ('username', 'email', 'rol', 'nivel', 'xp', 'is_staff')
    list_filter = ('rol', 'nivel', 'is_staff')


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('nume', 'criteriu')
    search_fields = ('nume', 'descriere')


@admin.register(UtilizatorBadge)
class UtilizatorBadgeAdmin(admin.ModelAdmin):
    list_display = ('utilizator', 'badge')
    list_filter = ('badge',)


@admin.register(DescoperiAtractie)
class DescoperiAtractieAdmin(admin.ModelAdmin):
    list_display = ('utilizator', 'atractie', 'esteDescoperita', 'incercari', 'dataDescoperire')
    list_filter = ('esteDescoperita',)
    search_fields = ('utilizator__username', 'atractie__nume')
