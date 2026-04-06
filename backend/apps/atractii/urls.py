from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AtractieTuristicaViewSet

router = DefaultRouter()
router.register(r'atractii', AtractieTuristicaViewSet, basename='atractii')

urlpatterns = [
    path('', include(router.urls)),
]