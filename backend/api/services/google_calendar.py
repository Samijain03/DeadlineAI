"""One-way sync into an app-created calendar; OAuth tokens never reach the browser."""
import hashlib
import json
import secrets
import time
from datetime import datetime, timedelta
from urllib.parse import quote, urlparse
from zoneinfo import ZoneInfo
import requests
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from google_auth_oauthlib.flow import Flow
from requests_oauthlib import OAuth2Session
from api.models import CalendarEventLink, GoogleCalendarConnection, GoogleOAuthAttempt

CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.app.created'
SCOPES = ['openid', 'https://www.googleapis.com/auth/userinfo.email', CALENDAR_SCOPE]
TOKEN_URI = 'https://oauth2.googleapis.com/token'
API_ROOT = 'https://www.googleapis.com/calendar/v3'


class GoogleIntegrationError(Exception):
    pass


def configured():
    if not all([settings.GOOGLE_CLIENT_ID, settings.GOOGLE_CLIENT_SECRET,
                settings.GOOGLE_REDIRECT_URI, settings.GOOGLE_TOKEN_ENCRYPTION_KEY]):
        return False
    try:
        Fernet(settings.GOOGLE_TOKEN_ENCRYPTION_KEY.encode())
        return settings.GOOGLE_REDIRECT_URI.startswith(('https://', 'http://localhost:', 'http://127.0.0.1:'))
    except (ValueError, TypeError):
        return False


def encrypt(value):
    return Fernet(settings.GOOGLE_TOKEN_ENCRYPTION_KEY.encode()).encrypt(json.dumps(value).encode()).decode()


def decrypt(value):
    try:
        return json.loads(Fernet(settings.GOOGLE_TOKEN_ENCRYPTION_KEY.encode()).decrypt(value.encode()))
    except (InvalidToken, ValueError, TypeError, AttributeError) as exc:
        raise GoogleIntegrationError('Calendar credentials could not be read. Reconnect Google Calendar.') from exc


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def oauth_flow(state, verifier):
    return Flow.from_client_config({'web': {'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET, 'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
        'token_uri': TOKEN_URI, 'redirect_uris': [settings.GOOGLE_REDIRECT_URI]}},
        scopes=SCOPES, state=state, redirect_uri=settings.GOOGLE_REDIRECT_URI,
        code_verifier=verifier, autogenerate_code_verifier=False)


def begin_connection(user):
    if not configured():
        raise GoogleIntegrationError('Google Calendar connection is not configured by the administrator yet.')
    GoogleOAuthAttempt.objects.filter(expires_at__lt=timezone.now()).delete()
    state, verifier = secrets.token_urlsafe(32), secrets.token_urlsafe(64)
    url, _ = oauth_flow(state, verifier).authorization_url(access_type='offline', prompt='consent')
    GoogleOAuthAttempt.objects.create(user=user, state_hash=digest(state), verifier_encrypted=encrypt(verifier),
                                     expires_at=timezone.now() + timedelta(minutes=10))
    return url


def receive_callback(state, code):
    """Stage the grant. Activation requires the initiating DeadlineAI user's JWT."""
    with transaction.atomic():
        attempt = GoogleOAuthAttempt.objects.select_for_update().filter(state_hash=digest(state),
            completion_hash__isnull=True, expires_at__gt=timezone.now(), user__is_active=True).first()
        if not attempt:
            raise GoogleIntegrationError('This connection request is invalid or expired. Try connecting again.')
        try:
            flow = oauth_flow(state, decrypt(attempt.verifier_encrypted))
            flow.fetch_token(code=code, timeout=10)
            tokens = flow.oauth2session.token
            granted = tokens.get('scope', [])
            granted = granted.split() if isinstance(granted, str) else granted
            if CALENDAR_SCOPE not in granted:
                raise GoogleIntegrationError('Calendar permission was not granted.')
            response = requests.get('https://openidconnect.googleapis.com/v1/userinfo',
                headers={'Authorization': f"Bearer {tokens['access_token']}"}, timeout=8)
            if not response.ok:
                raise GoogleIntegrationError('Google account details could not be verified.')
            profile = response.json()
            if not profile.get('sub') or not profile.get('email') or profile.get('email_verified') is not True:
                raise GoogleIntegrationError('Choose a Google account with a verified email address.')
        except GoogleIntegrationError:
            raise
        except Exception as exc:
            raise GoogleIntegrationError('Google could not finish connecting. Please try again.') from exc
        ticket = secrets.token_urlsafe(32)
        attempt.completion_hash = digest(ticket)
        attempt.result_encrypted = encrypt({'tokens': tokens, 'subject': profile['sub'], 'email': profile['email']})
        attempt.verifier_encrypted = ''
        attempt.expires_at = timezone.now() + timedelta(minutes=5)
        attempt.save()
        return ticket


def finish_connection(user, ticket):
    with transaction.atomic():
        attempt = GoogleOAuthAttempt.objects.select_for_update().filter(user=user, completion_hash=digest(ticket),
            expires_at__gt=timezone.now()).first()
        if not attempt:
            raise GoogleIntegrationError('Sign in to the DeadlineAI account that started this connection and try again.')
        result = decrypt(attempt.result_encrypted)
        connection = GoogleCalendarConnection.objects.select_for_update().filter(user=user).first()
        same_account = connection and connection.google_subject == result['subject']
        tokens = result['tokens']
        if not tokens.get('refresh_token') and same_account:
            tokens['refresh_token'] = decrypt(connection.tokens_encrypted).get('refresh_token')
        if not tokens.get('refresh_token'):
            raise GoogleIntegrationError('Google did not grant offline access. Reconnect and approve access again.')
        if connection and not same_account:
            # Previously created events stay in the previous account, as on disconnect.
            connection.links.all().delete()
            connection.calendar_id = ''
        connection = connection or GoogleCalendarConnection(user=user)
        connection.google_subject, connection.account_email = result['subject'], result['email']
        connection.tokens_encrypted, connection.last_error = encrypt(tokens), ''
        connection.save()
        attempt.delete()
        return connection


def access_token(connection):
    tokens = decrypt(connection.tokens_encrypted)
    if tokens.get('access_token') and float(tokens.get('expires_at', 0)) > time.time() + 60:
        return tokens['access_token']
    try:
        oauth = OAuth2Session(settings.GOOGLE_CLIENT_ID, token=tokens)
        refreshed = oauth.refresh_token(TOKEN_URI, refresh_token=tokens['refresh_token'],
            client_id=settings.GOOGLE_CLIENT_ID, client_secret=settings.GOOGLE_CLIENT_SECRET, timeout=8)
        refreshed.setdefault('refresh_token', tokens['refresh_token'])
        connection.tokens_encrypted = encrypt(refreshed)
        connection.save(update_fields=['tokens_encrypted'])
        return refreshed['access_token']
    except Exception as exc:
        raise GoogleIntegrationError('Google access expired or was revoked. Reconnect Google Calendar.') from exc


def google_request(connection, method, path, payload=None):
    try:
        response = requests.request(method, API_ROOT + path,
            headers={'Authorization': f'Bearer {access_token(connection)}'}, json=payload, timeout=8)
        if response.status_code in {401, 403}:
            raise GoogleIntegrationError('Calendar access was denied. Check that the API is enabled and reconnect.')
        return response
    except requests.RequestException as exc:
        raise GoogleIntegrationError('Google Calendar is temporarily unavailable. Your task is saved; retry sync later.') from exc


def event_body(deadline):
    prefix = '[Completed] ' if deadline.status == 'Completed' else 'Deadline: '
    body = {'summary': (prefix + deadline.title)[:1000],
        'description': f'{deadline.action_required}\n\nDeadlineAI priority: {deadline.priority}\nThe deadline is at the start of this event.\n{settings.FRONTEND_URL}/app',
        'transparency': 'transparent',
        'reminders': {'useDefault': False, 'overrides': [{'method': 'popup', 'minutes': 1440}] if deadline.reminder_set and deadline.status != 'Completed' else []}}
    if deadline.due_time:
        start = datetime.fromisoformat(f'{deadline.due_date}T{deadline.due_time}').replace(tzinfo=ZoneInfo('Asia/Kolkata'))
        body['start'] = {'dateTime': start.isoformat(), 'timeZone': 'Asia/Kolkata'}
        body['end'] = {'dateTime': (start + timedelta(minutes=15)).isoformat(), 'timeZone': 'Asia/Kolkata'}
    else:
        body['start'] = {'date': deadline.due_date.isoformat()}
        body['end'] = {'date': (deadline.due_date + timedelta(days=1)).isoformat()}
    return body


def _sync_locked(link, connection):
    if link.pending_delete or not link.deadline_id:
        if link.calendar_id:
            response = google_request(connection, 'DELETE', f'/calendars/{quote(link.calendar_id, safe="")}/events/{quote(link.event_id, safe="")}')
            if not response.ok and response.status_code not in {404, 410}:
                raise GoogleIntegrationError('Google could not remove the event. Retry removal later.')
        link.delete()
        return
    if not connection.calendar_id:
        response = google_request(connection, 'POST', '/calendars', {'summary': 'DeadlineAI', 'timeZone': 'Asia/Kolkata'})
        if not response.ok:
            raise GoogleIntegrationError('Google could not create the DeadlineAI calendar. Retry sync later.')
        connection.calendar_id = response.json()['id']
        connection.save(update_fields=['calendar_id'])
    calendar = connection.calendar_id
    path = f'/calendars/{quote(calendar, safe="")}/events'
    link.calendar_id = calendar
    link.save(update_fields=['calendar_id'])
    payload = event_body(link.deadline)
    response = google_request(connection, 'PUT', path + '/' + link.event_id, payload)
    if response.status_code == 410:
        # Google has a tombstone for this ID. Persist a new ID before recreating it.
        link.event_id = hashlib.sha256((link.event_id + secrets.token_hex(16)).encode()).hexdigest()
        link.save(update_fields=['event_id'])
        response = google_request(connection, 'POST', path, {**payload, 'id': link.event_id})
    if response.status_code == 404:
        response = google_request(connection, 'POST', path, {**payload, 'id': link.event_id})
        if response.status_code == 409:
            response = google_request(connection, 'PUT', path + '/' + link.event_id, payload)
    if response.status_code == 404:
        connection.calendar_id = ''
        connection.save(update_fields=['calendar_id'])
    if not response.ok:
        raise GoogleIntegrationError('Google could not update this event. Your task is saved; retry sync later.')
    url = str(response.json().get('htmlLink', ''))
    parsed = urlparse(url)
    link.event_url = url if parsed.scheme == 'https' and parsed.hostname in {'www.google.com', 'calendar.google.com'} else ''
    link.calendar_id, link.last_synced, link.last_error = calendar, timezone.now(), ''
    link.save()
    if connection.last_error:
        connection.last_error = ''
        connection.save(update_fields=['last_error'])


def sync_link(link_id):
    """Keep failed writes retryable without rolling back a saved task."""
    try:
        with transaction.atomic():
            link = CalendarEventLink.objects.select_for_update(of=('self',)).select_related('deadline').filter(pk=link_id).first()
            if not link:
                return
            connection = GoogleCalendarConnection.objects.select_for_update().get(pk=link.connection_id)
            try:
                _sync_locked(link, connection)
            except GoogleIntegrationError as exc:
                link.last_error = str(exc)[:255]
                link.save(update_fields=['last_error'])
    except Exception:
        CalendarEventLink.objects.filter(pk=link_id).update(last_error='Calendar sync could not finish. Your task is saved; retry later.')


def sync_deadline(deadline_id):
    link = CalendarEventLink.objects.filter(deadline_id=deadline_id, pending_delete=False).first()
    if link:
        transaction.on_commit(lambda: sync_link(link.pk))


def remove_deadline(deadline_id):
    link = CalendarEventLink.objects.filter(deadline_id=deadline_id).first()
    if link:
        link.pending_delete = True
        link.save(update_fields=['pending_delete'])
        transaction.on_commit(lambda: sync_link(link.pk))
