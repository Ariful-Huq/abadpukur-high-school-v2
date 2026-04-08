# backend/users/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from datetime import datetime, UTC


class VersionedJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            auth_data = super().authenticate(request)
        except Exception:
            return None

        if auth_data is None:
            return None

        user, token = auth_data

        if user.force_logout_timestamp:
            token_iat_raw = token.get('iat')

            if token_iat_raw:
                # Convert JWT 'iat' to UTC datetime
                token_iat_datetime = datetime.fromtimestamp(
                    token_iat_raw, tz=UTC)

                # Force the user's logout timestamp to UTC for a fair comparison
                user_logout_utc = user.force_logout_timestamp.astimezone(UTC)

                # Check if token was issued BEFORE the logout command
                # We add a small 1-second buffer to handle network latency
                if token_iat_datetime < user_logout_utc:
                    raise AuthenticationFailed(
                        "Session invalidated. Please log in again.")

        return user, token
