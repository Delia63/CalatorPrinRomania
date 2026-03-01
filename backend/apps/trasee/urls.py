from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TraseuViewSet

router = DefaultRouter()
router.register(r'trasee', TraseuViewSet)

urlpatterns = [path('', include(router.urls)),]