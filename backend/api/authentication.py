import os

import requests
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions


class SupabaseAuthentication(authentication.BaseAuthentication):
    """Validate Supabase access tokens and map their users into Django ownership rows."""

    def authenticate_header(self, request):
        return "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode("utf-8")
        if not header:
            return None
        parts = header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise exceptions.AuthenticationFailed("Invalid authorization header.")

        supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        publishable_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "") or os.environ.get("SUPABASE_ANON_KEY", "")
        if not supabase_url or not publishable_key:
            raise exceptions.AuthenticationFailed("Supabase authentication is not configured.")

        token = parts[1]
        try:
            response = requests.get(
                f"{supabase_url}/auth/v1/user",
                headers={"apikey": publishable_key, "Authorization": f"Bearer {token}"},
                timeout=8,
            )
        except requests.RequestException as exc:
            raise exceptions.AuthenticationFailed("Authentication service is unavailable.") from exc

        if response.status_code != 200:
            raise exceptions.AuthenticationFailed("Session is invalid or expired.")

        payload = response.json()
        supabase_id = payload.get("id")
        email = payload.get("email", "")
        if not supabase_id:
            raise exceptions.AuthenticationFailed("Session has no user identifier.")

        metadata = payload.get("user_metadata") or {}
        app_metadata = payload.get("app_metadata") or {}
        name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]
        role = app_metadata.get("role") or metadata.get("role") or "student"
        user, _ = User.objects.get_or_create(
            username=supabase_id,
            defaults={"email": email, "first_name": name[:150]},
        )
        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if user.first_name != name[:150]:
            user.first_name = name[:150]
            changed = True
        should_be_staff = role in {"admin", "coordinator"}
        if user.is_staff != should_be_staff:
            user.is_staff = should_be_staff
            changed = True
        if changed:
            user.save(update_fields=["email", "first_name", "is_staff"])

        profile = user.profile if hasattr(user, "profile") else None
        if profile is None:
            from .models import UserProfile

            profile = UserProfile.objects.create(
                user=user,
                student_prn=metadata.get("student_prn") or None,
                department=metadata.get("department") or "School of Computer Science & Applications",
                phone=metadata.get("phone") or None,
                role=role,
            )
        else:
            updates = []
            for field, value in {
                "student_prn": metadata.get("student_prn") or profile.student_prn,
                "department": metadata.get("department") or profile.department,
                "phone": metadata.get("phone") or profile.phone,
                "role": role,
            }.items():
                if getattr(profile, field) != value:
                    setattr(profile, field, value)
                    updates.append(field)
            if updates:
                profile.save(update_fields=updates)

        return user, token
