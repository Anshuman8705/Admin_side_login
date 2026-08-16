from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "email",
        "name",
        "mobile",
        "totp_enabled",
        "is_active",
        "is_staff",
        "created_at",
    )

    search_fields = (
        "email",
        "name",
        "mobile",
    )

    list_filter = (
        "totp_enabled",
        "is_active",
        "is_staff",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )