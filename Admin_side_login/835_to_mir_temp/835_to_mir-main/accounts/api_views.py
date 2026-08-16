import base64
import io
import secrets

import pyotp
import qrcode

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    TOTPSetupSerializer,
    TOTPVerifySerializer,
    UserSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def signup_api(request):
    """User registration endpoint"""
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response(
            {
                "message": "Account created successfully",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "totp_setup_required": True,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_api(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    user = authenticate(username=email, password=password)

    if not user:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Generate tokens
    refresh = RefreshToken.for_user(user)

    response_data = {
        "message": "Login successful",
        "user": UserSerializer(user).data,
        "tokens": {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
    }

    # Check TOTP status
    if not user.totp_enabled:
        response_data["totp_setup_required"] = True
    else:
        response_data["totp_verification_required"] = True

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def totp_setup_api(request):
    """TOTP setup endpoint"""
    user = request.user

    # Already enabled
    if user.totp_enabled and request.method == "GET":
        return Response(
            {"error": "TOTP already enabled"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Generate secret if doesn't exist
    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
        user.save(update_fields=["totp_secret"])

    # GET request - return QR code
    if request.method == "GET":
        secret = user.totp_secret
        totp = pyotp.TOTP(secret)

        # Create provisioning URI
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="Project835",
        )

        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image()

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_code = base64.b64encode(buffer.getvalue()).decode()

        return Response(
            {
                "qr_code": f"data:image/png;base64,{qr_code}",
                "secret": secret,
            }
        )

    # POST request - verify code
    serializer = TOTPSetupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    code = serializer.validated_data.get("code", "").strip()
    totp = pyotp.TOTP(user.totp_secret)

    if totp.verify(code):
        user.totp_enabled = True

        # Generate recovery codes
        recovery_codes = []
        for _ in range(10):
            recovery_codes.append(secrets.token_hex(4).upper())

        user.recovery_codes = recovery_codes
        user.save(update_fields=["totp_enabled", "recovery_codes"])

        return Response(
            {
                "message": "TOTP enabled successfully",
                "recovery_codes": recovery_codes,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"error": "Invalid code"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def totp_verify_api(request):
    """TOTP verification endpoint"""
    user = request.user

    if not user.totp_enabled:
        return Response(
            {"error": "TOTP not enabled"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = TOTPVerifySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    code = serializer.validated_data["code"].strip()
    totp = pyotp.TOTP(user.totp_secret)

    if totp.verify(code):
        return Response(
            {"message": "Verification successful"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"error": "Invalid code"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    """Get user profile"""
    return Response(UserSerializer(request.user).data)
