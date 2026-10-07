"""First-party authentication, independent of the database hosting provider."""
from urllib.parse import urlencode
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import UserProfile


class AuthThrottle(AnonRateThrottle):
    rate = '20/hour'


def public_user(user):
    profile = getattr(user, 'profile', None)
    return {'id': user.pk, 'email': user.email,
            'user_metadata': {'full_name': user.get_full_name(),
                              'student_prn': profile.student_prn if profile else '',
                              'department': profile.department if profile else ''},
            'app_metadata': {'role': 'admin' if user.is_staff else 'student'}}


def session(user):
    token = RefreshToken.for_user(user)
    return {'access_token': str(token.access_token), 'refresh_token': str(token),
            'user': public_user(user)}


class Registration(serializers.Serializer):
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, max_length=128)
    name = serializers.CharField(max_length=150)
    studentPrn = serializers.CharField(max_length=50)
    department = serializers.CharField(max_length=200)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def register(request):
    form = Registration(data=request.data)
    form.is_valid(raise_exception=True)
    data = form.validated_data
    email = data['email'].lower()
    user = User(username=email, email=email, first_name=data['name'])
    try:
        validate_password(data['password'], user)
    except ValidationError as exc:
        return Response({'error': ' '.join(exc.messages)}, status=400)
    try:
        with transaction.atomic():
            user.set_password(data['password'])
            user.save()
            UserProfile.objects.create(user=user, student_prn=data['studentPrn'], department=data['department'])
    except IntegrityError:
        return Response({'error': 'An account with that email or PRN already exists.'}, status=400)
    return Response({'session': session(user)}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def login(request):
    email = str(request.data.get('email', '')).strip().lower()
    password = request.data.get('password', '')
    if not isinstance(password, str) or len(password) > 128:
        return Response({'error': 'Email or password is incorrect.'}, status=401)
    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Email or password is incorrect.'}, status=401)
    return Response({'session': session(user)})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def refresh(request):
    serializer = TokenRefreshSerializer(data={'refresh': request.data.get('refresh_token', '')})
    try:
        serializer.is_valid(raise_exception=True)
    except TokenError:
        return Response({'error': 'Session expired. Please sign in again.'}, status=401)
    return Response({'access_token': serializer.validated_data['access'],
                     'refresh_token': serializer.validated_data['refresh']})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def logout(request):
    try:
        RefreshToken(request.data.get('refresh_token', '')).blacklist()
    except TokenError:
        pass
    return Response(status=204)


@api_view(['GET'])
def me(request):
    return Response(public_user(request.user))


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def forgot_password(request):
    form = serializers.EmailField()
    email = form.run_validation(request.data.get('email', '')).lower()
    if not settings.EMAIL_HOST and settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
        return Response({'error': 'Password-reset email is not configured yet. Contact the administrator.'}, status=503)
    user = User.objects.filter(username=email, is_active=True).first()
    if user and user.has_usable_password():
        query = urlencode({'reset-password': '1', 'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                           'token': default_token_generator.make_token(user)})
        try:
            send_mail('Reset your DeadlineAI password',
                      f'Reset your password using this link within one hour:\n{settings.FRONTEND_URL}/?{query}\n\nIf you did not request this, ignore this email.',
                      settings.DEFAULT_FROM_EMAIL, [user.email])
        except Exception:
            return Response({'error': 'Password-reset email is temporarily unavailable.'}, status=503)
    return Response({'message': 'If that account exists, a reset link has been sent.'})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AuthThrottle])
def reset_password(request):
    try:
        user = User.objects.get(pk=urlsafe_base64_decode(str(request.data.get('uid', ''))).decode())
        if not user.is_active or not default_token_generator.check_token(user, str(request.data.get('token', ''))):
            raise ValueError()
    except (ValueError, TypeError, OverflowError, User.DoesNotExist, UnicodeDecodeError):
        return Response({'error': 'This reset link is invalid or expired. Request another link.'}, status=400)
    password = request.data.get('password', '')
    if not isinstance(password, str) or len(password) > 128:
        return Response({'error': 'Enter a valid password.'}, status=400)
    try:
        validate_password(password, user)
    except ValidationError as exc:
        return Response({'error': ' '.join(exc.messages)}, status=400)
    user.set_password(password)
    user.save(update_fields=['password'])
    return Response({'message': 'Password updated. Please sign in.'})

