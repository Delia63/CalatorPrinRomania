from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import InregistrareView, ProfilView, BadgeViewSet, DescoperaAtractieView, NotificareViewSet, ProgresUtilizatorView

router = DefaultRouter()
router.register(r'badges', BadgeViewSet)
router.register(r'notificari', NotificareViewSet, basename='notificari')

urlpatterns = [
    path('', include(router.urls)),
    path('inregistrare/', InregistrareView.as_view(), name='inregistrare'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profil/', ProfilView.as_view(), name='profil'),
    path('descopera/', DescoperaAtractieView.as_view(), name='descopera'),
    path('progres/', ProgresUtilizatorView.as_view(), name='progres'),
]