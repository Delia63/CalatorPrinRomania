from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.atractii.urls')),
    path('api/', include('apps.trasee.urls')),
    path('api/utilizatori/', include('apps.utilizatori.urls')),
]