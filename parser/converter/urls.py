from django.urls import path
from converter import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/convert/', views.api_convert, name='api_convert'),
    path('api/validate/', views.api_validate, name='api_validate'),
    path('api/download/', views.download_mir, name='download_mir'),
]
