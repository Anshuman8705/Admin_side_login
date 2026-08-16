from django.contrib.auth.decorators import login_required

from django.shortcuts import render
from django.shortcuts import redirect


@login_required
def home_view(request):

    user = request.user


    # TOTP setup hasn't been completed
    if not user.totp_enabled:

        return redirect(
            "totp_setup"
        )


    # TOTP hasn't been verified during this login
    if not request.session.get(
        "totp_verified",
        False
    ):

        return redirect(
            "totp_verify"
        )


    return render(
        request,
        "home/index.html"
    )