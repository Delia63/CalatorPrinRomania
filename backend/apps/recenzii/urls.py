from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecenzieViewSet, ImagineRecenzieViewSet

router = DefaultRouter()
router.register(r'recenzii', RecenzieViewSet, basename='recenzii')
router.register(r'imagini-recenzii', ImagineRecenzieViewSet, basename='imagini-recenzii')

urlpatterns = [
    path('', include(router.urls)),
]