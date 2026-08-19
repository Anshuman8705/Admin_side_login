from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('home/', include('home.urls')),
    path('edi835/', include('edi835.urls')),
    path('api/', include('api.urls')),
    path('api/', include('mir_mapper.urls')),
    path('', include('converter.urls')),
]
