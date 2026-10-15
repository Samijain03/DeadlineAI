import hashlib
import io
from urllib.parse import quote
from django.conf import settings
from django.db import IntegrityError, transaction
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from .models import (CalendarEventLink, Deadline, EmailIngestion, GoogleCalendarConnection,
                     GoogleOAuthAttempt, Notice, OCRText)
from .services import google_calendar as google
from .services.email_import import parse_email
from .services.ocr_service import process_document_ocr
from .services.ai_service import analyze_notice_text


class ConnectThrottle(UserRateThrottle):
    scope = 'google-connect'
    rate = '10/hour'


def link_data(link):
    return {'id': link.pk, 'deadline_id': link.deadline_id,
            'title': link.deadline.title if link.deadline_id else 'Deleted task',
            'state': 'removal_pending' if link.pending_delete else 'pending' if link.last_error or not link.last_synced else 'synced',
            'last_error': link.last_error, 'last_synced': link.last_synced, 'event_url': link.event_url}


@api_view(['GET'])
def calendar_status(request):
    connection = GoogleCalendarConnection.objects.filter(user=request.user).first()
    return Response({'configured': google.configured(), 'connected': bool(connection),
        'account_email': connection.account_email if connection else '',
        'links': [link_data(link) for link in connection.links.select_related('deadline').order_by('-pk')] if connection else []})


@api_view(['POST'])
@throttle_classes([ConnectThrottle])
def calendar_connect(request):
    try:
        return Response({'authorization_url': google.begin_connection(request.user)})
    except google.GoogleIntegrationError as exc:
        return Response({'error': str(exc)}, status=503)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def google_callback(request):
    state = str(request.query_params.get('state', ''))[:200]
    try:
        if not state or request.query_params.get('error') or not request.query_params.get('code'):
            if state:
                GoogleOAuthAttempt.objects.filter(state_hash=google.digest(state)).delete()
            raise google.GoogleIntegrationError('Google connection was cancelled. You can try again.')
        ticket = google.receive_callback(state, request.query_params['code'])
        fragment = 'google_oauth=' + quote(ticket, safe='')
    except google.GoogleIntegrationError:
        fragment = 'google_error=connection_not_completed'
    # Fragments avoid placing the one-use ticket in frontend/CDN request logs.
    response = HttpResponseRedirect(settings.FRONTEND_URL + '/app#' + fragment)
    response['Cache-Control'] = 'no-store'
    response['Referrer-Policy'] = 'no-referrer'
    return response


@api_view(['POST'])
def google_complete(request):
    ticket = str(request.data.get('ticket', ''))
    if not ticket or len(ticket) > 200:
        return Response({'error': 'This connection request is invalid.'}, status=400)
    try:
        connection = google.finish_connection(request.user, ticket)
        return Response({'connected': True, 'account_email': connection.account_email})
    except google.GoogleIntegrationError as exc:
        return Response({'error': str(exc)}, status=400)


@api_view(['POST'])
def calendar_disconnect(request):
    # Keep already-created Google events. Never delete a user's calendar on disconnect.
    GoogleCalendarConnection.objects.filter(user=request.user).delete()
    GoogleOAuthAttempt.objects.filter(user=request.user).delete()
    return Response({'connected': False})


@api_view(['POST'])
def calendar_share(request, deadline_id):
    deadline = get_object_or_404(Deadline, pk=deadline_id, user=request.user)
    connection = GoogleCalendarConnection.objects.filter(user=request.user).first()
    if not connection:
        return Response({'error': 'Connect Google Calendar first.'}, status=400)
    identifier = hashlib.sha256(f'deadlineai:{connection.pk}:{deadline.pk}'.encode()).hexdigest()
    link, _ = CalendarEventLink.objects.get_or_create(deadline=deadline,
        defaults={'connection': connection, 'event_id': identifier})
    link.pending_delete, link.last_error = False, ''
    link.save(update_fields=['pending_delete', 'last_error'])
    google.sync_link(link.pk)
    link.refresh_from_db()
    return Response(link_data(link), status=202 if link.last_error else 200)


@api_view(['POST', 'DELETE'])
def calendar_link(request, link_id):
    link = get_object_or_404(CalendarEventLink.objects.select_related('deadline'), pk=link_id, connection__user=request.user)
    if request.method == 'DELETE':
        link.pending_delete = True
        link.save(update_fields=['pending_delete'])
    google.sync_link(link.pk)
    remaining = CalendarEventLink.objects.select_related('deadline').filter(pk=link.pk).first()
    return Response(link_data(remaining), status=202 if remaining.last_error else 200) if remaining else Response(status=204)


def uploaded_email(request):
    file = request.FILES.get('file')
    if not file:
        raise ValueError('Choose an .eml email file.')
    return parse_email(file)


@api_view(['POST'])
def email_preview(request):
    try:
        email = uploaded_email(request)
        return Response({'subject': email['subject'], 'sender': email['sender'], 'date': email['date'],
            'body_excerpt': email['body'][:5000], 'body_available': bool(email['body']),
            'attachments': [{key: value for key, value in part.items() if key != 'data'} for part in email['attachments']]})
    except ValueError as exc:
        return Response({'error': str(exc)}, status=422)


def email_result(ingestion):
    notice = ingestion.notice
    existing = notice.deadlines.first()
    return {'success': True, 'notice_id': notice.pk, 'filename': notice.file_name,
        'ocr_text': notice.ocr_data.extracted_text, 'extracted_data': ingestion.extracted_data,
        'existing_deadline_id': existing.pk if existing else None}


@api_view(['POST'])
def email_analyze(request):
    try:
        email = uploaded_email(request)
        part_key = str(request.data.get('part', 'body'))
        if part_key != 'body':
            try:
                index = int(part_key)
            except (ValueError, TypeError):
                raise ValueError('Choose the email body or a supported attachment.')
            if index < 0 or index >= len(email['attachments']):
                raise ValueError('This email attachment was not found.')
            part_key = str(index)
        existing = EmailIngestion.objects.select_related('notice').filter(user=request.user,
            fingerprint=email['fingerprint'], part_key=part_key).first()
        if existing:
            return Response(email_result(existing))
        if part_key == 'body':
            if not email['body']:
                raise ValueError('This email has no readable body. Choose an attachment instead.')
            text = f"{email['subject']}\n\n{email['body']}"[:50000]
            data, filename, content_type, method = email['raw'], email['filename'], 'message/rfc822', 'Email body'
        else:
            part = email['attachments'][int(part_key)]
            if not part['supported']:
                raise ValueError('Choose a PDF, PNG or JPG attachment.')
            result = process_document_ocr(io.BytesIO(part['data']), part['filename'])
            text, data, filename, method = result['text'], part['data'], part['filename'], result['method']
            content_type = 'application/pdf' if filename.lower().endswith('.pdf') else 'application/octet-stream'
        extracted = analyze_notice_text(text)
        try:
            with transaction.atomic():
                notice = Notice.objects.create(user=request.user, title=extracted.get('title') or email['subject'],
                    document_bytes=data, content_type=content_type, file_name=filename,
                    file_type='Email notice' if part_key == 'body' else 'Email attachment', verified_by_user=False)
                OCRText.objects.create(notice=notice, extracted_text=text, extraction_method=method[:50])
                ingestion = EmailIngestion.objects.create(user=request.user, fingerprint=email['fingerprint'],
                    part_key=part_key, notice=notice, extracted_data=extracted)
        except IntegrityError:
            ingestion = EmailIngestion.objects.select_related('notice').get(user=request.user,
                fingerprint=email['fingerprint'], part_key=part_key)
        return Response(email_result(ingestion))
    except ValueError as exc:
        return Response({'error': str(exc)}, status=422)
    except ImportError:
        return Response({'error': 'Image reading is unavailable. Import the email body instead.'}, status=503)
