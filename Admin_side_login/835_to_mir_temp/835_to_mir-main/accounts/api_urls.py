from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import (
    signup_api,
    login_api,
    totp_setup_api,
    totp_verify_api,
    user_profile_api,
)

urlpatterns = [
    path("auth/signup/", signup_api, name="api_signup"),
    path("auth/login/", login_api, name="api_login"),
    path("auth/totp-setup/", totp_setup_api, name="api_totp_setup"),
    path("auth/totp-verify/", totp_verify_api, name="api_totp_verify"),
    path("user/profile/", user_profile_api, name="api_user_profile"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
