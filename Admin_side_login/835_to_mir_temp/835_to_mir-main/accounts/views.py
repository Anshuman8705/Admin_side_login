import base64
import io
import secrets

import pyotp
import qrcode

from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth import logout

from django.contrib.auth.decorators import login_required

from django.shortcuts import render
from django.shortcuts import redirect

from .forms import SignupForm
from .forms import LoginForm


# ============================================================
# SIGNUP
# ============================================================

def signup_view(request):

    if request.user.is_authenticated:

        return redirect("home")


    if request.method == "POST":

        form = SignupForm(request.POST)

        if form.is_valid():

            user = form.save()

            # Login user temporarily
            login(
                request,
                user
            )

            # Force TOTP setup
            request.session["totp_setup_required"] = True

            return redirect("totp_setup")

    else:

        form = SignupForm()


    return render(
        request,
        "accounts/signup.html",
        {
            "form": form
        }
    )


# ============================================================
# LOGIN
# ============================================================

def login_view(request):

    if request.user.is_authenticated:

        return redirect("home")


    if request.method == "POST":

        form = LoginForm(request.POST)

        if form.is_valid():

            user = form.user

            # Login user into Django session
            login(
                request,
                user
            )

            # User has not configured TOTP yet
            if not user.totp_enabled:

                request.session[
                    "totp_setup_required"
                ] = True

                return redirect(
                    "totp_setup"
                )

            # TOTP already configured
            request.session[
                "totp_verified"
            ] = False

            return redirect(
                "totp_verify"
            )

    else:

        form = LoginForm()


    return render(
        request,
        "accounts/login.html",
        {
            "form": form
        }
    )


# ============================================================
# TOTP SETUP
# ============================================================

@login_required
def totp_setup_view(request):

    user = request.user


    # Already enabled
    if user.totp_enabled:

        return redirect(
            "home"
        )


    # Generate secret if it doesn't exist
    if not user.totp_secret:

        user.totp_secret = pyotp.random_base32()

        user.save(
            update_fields=[
                "totp_secret"
            ]
        )


    secret = user.totp_secret


    # Create TOTP object
    totp = pyotp.TOTP(
        secret
    )


    # Create provisioning URI
    provisioning_uri = totp.provisioning_uri(

        name=user.email,

        issuer_name="Project835"
    )


    # Generate QR code
    qr = qrcode.QRCode(
        version=1,

        error_correction=qrcode.constants.ERROR_CORRECT_L,

        box_size=10,

        border=4,
    )


    qr.add_data(
        provisioning_uri
    )

    qr.make(
        fit=True
    )


    img = qr.make_image()


    # Convert QR image to base64
    buffer = io.BytesIO()

    img.save(
        buffer,
        format="PNG"
    )


    qr_code = base64.b64encode(
        buffer.getvalue()
    ).decode()


    if request.method == "POST":

        code = request.POST.get(
            "code",
            ""
        ).strip()


        if totp.verify(code):

            user.totp_enabled = True

            # Generate recovery codes
            recovery_codes = []

            for _ in range(10):

                recovery_codes.append(
                    secrets.token_hex(4).upper()
                )


            user.recovery_codes = recovery_codes

            user.save(
                update_fields=[
                    "totp_enabled",
                    "recovery_codes"
                ]
            )


            request.session[
                "totp_verified"
            ] = True

            request.session[
                "totp_setup_required"
            ] = False


            messages.success(
                request,
                "Authenticator successfully configured."
            )


            return render(
                request,
                "accounts/totp_setup.html",
                {
                    "qr_code": qr_code,
                    "secret": secret,
                    "verified": True,
                    "recovery_codes": recovery_codes,
                }
            )


        else:

            messages.error(
                request,
                "Invalid authenticator code."
            )


    return render(
        request,
        "accounts/totp_setup.html",
        {
            "qr_code": qr_code,
            "secret": secret,
            "verified": False,
        }
    )


# ============================================================
# TOTP LOGIN VERIFICATION
# ============================================================

@login_required
def totp_verify_view(request):

    user = request.user


    # TOTP not configured
    if not user.totp_enabled:

        return redirect(
            "totp_setup"
        )


    # Already verified
    if request.session.get(
        "totp_verified",
        False
    ):

        return redirect(
            "home"
        )


    if request.method == "POST":

        code = request.POST.get(
            "code",
            ""
        ).strip()


        totp = pyotp.TOTP(
            user.totp_secret
        )


        if totp.verify(code):

            request.session[
                "totp_verified"
            ] = True


            messages.success(
                request,
                "Authentication successful."
            )


            return redirect(
                "home"
            )


        messages.error(
            request,
            "Invalid authenticator code."
        )


    return render(
        request,
        "accounts/totp_verify.html"
    )


# ============================================================
# LOGOUT
# ============================================================

def logout_view(request):

    logout(request)

    return redirect(
        "login"
    )