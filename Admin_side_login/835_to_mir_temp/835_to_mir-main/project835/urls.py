from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect


def root_redirect(request):
    return redirect("login")


urlpatterns = [
    path("admin/", admin.site.urls),

    # Template-based views (keep for backward compatibility)
    path("accounts/", include("accounts.urls")),
    path("home/", include("home.urls")),

    # API endpoints
    path("api/", include("accounts.api_urls")),

    path("", root_redirect, name="root"),
]