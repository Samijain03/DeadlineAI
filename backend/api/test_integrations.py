import io
import time
from datetime import date, timedelta
from email.message import EmailMessage
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlparse
from cryptography.fernet import Fernet
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from api.models import (CalendarEventLink, Deadline, EmailIngestion, GoogleCalendarConnection,
                        GoogleOAuthAttempt, Notice)
from api.services import google_calendar as google
from api.services.email_import import parse_email

KEY = Fernet.generate_key().decode()
CONFIG = dict(GOOGLE_CLIENT_ID='test.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET='test-secret',
              GOOGLE_REDIRECT_URI='https://backend.example.com/api/integrations/google/callback/',
              GOOGLE_TOKEN_ENCRYPTION_KEY=KEY)


class EmailIngestionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='email-test', password='StrongPassword234!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        message = EmailMessage()
        message['Subject'] = 'Assignment notice'
        message['From'] = 'College <college@example.com>'
        message.set_content('Submit the assignment by 21 October 2026 at 17:00.\nEligibility: all students.')
        message.add_attachment(b'not a real pdf', maintype='application', subtype='pdf', filename='notice.pdf')
        self.raw = message.as_bytes()
        self.extraction = {'title':'Submit assignment', 'category':'Assignment', 'due_date':'2026-10-21',
            'due_time':'17:00', 'action_required':'Submit assignment', 'priority':'Medium', 'eligibility':'All students', 'confidence':90}

    def upload(self):
        return SimpleUploadedFile('notice.eml', self.raw, content_type='message/rfc822')

    @patch('api.integration_views.analyze_notice_text')
    def test_preview_is_local_and_does_not_create_task_or_notice(self, analyze):
        response = self.client.post('/api/integrations/email/preview/', {'file':self.upload()}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['attachments'][0]['filename'], 'notice.pdf')
        self.assertNotIn('data', response.data['attachments'][0])
        self.assertEqual(Notice.objects.count(), 0)
        self.assertEqual(Deadline.objects.count(), 0)
        analyze.assert_not_called()

    @patch('api.integration_views.analyze_notice_text')
    def test_body_stages_then_confirms_and_reimport_does_not_duplicate(self, analyze):
        analyze.return_value = self.extraction
        response = self.client.post('/api/integrations/email/analyze/', {'file':self.upload(), 'part':'body'}, format='multipart')
        self.assertEqual(response.status_code, 200)
        notice = Notice.objects.get(pk=response.data['notice_id'])
        self.assertFalse(notice.verified_by_user)
        self.assertEqual(bytes(notice.document_bytes), self.raw)
        self.assertEqual(Deadline.objects.count(), 0)
        payload = {**self.extraction, 'notice': notice.pk}
        saved = self.client.post('/api/deadlines/', payload, format='json')
        self.assertEqual(saved.status_code, 201)
        again = self.client.post('/api/integrations/email/analyze/', {'file':self.upload()}, format='multipart')
        self.assertEqual(again.data['existing_deadline_id'], saved.data['id'])
        self.assertEqual(analyze.call_count, 1)
        self.assertEqual(EmailIngestion.objects.count(), 1)
        stranger = User.objects.create_user(username='email-other')
        self.client.force_authenticate(stranger)
        self.assertEqual(self.client.get(f'/api/notices/{notice.pk}/document/').status_code, 404)
        own = self.client.post('/api/integrations/email/analyze/', {'file':self.upload()}, format='multipart')
        self.assertNotEqual(own.data['notice_id'], notice.pk)

    @patch('api.integration_views.process_document_ocr')
    @patch('api.integration_views.analyze_notice_text')
    def test_selected_attachment_only_uses_ocr(self, analyze, ocr):
        analyze.return_value = self.extraction
        ocr.return_value = {'text':'Submit assignment by 21 October 2026.', 'method':'PDF text extraction'}
        response = self.client.post('/api/integrations/email/analyze/', {'file':self.upload(), 'part':'0'}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['filename'], 'notice.pdf')
        self.assertEqual(bytes(Notice.objects.get(pk=response.data['notice_id']).document_bytes), b'not a real pdf')
        self.assertEqual(ocr.call_args.args[1], 'notice.pdf')
        bad = self.client.post('/api/integrations/email/analyze/', {'file':self.upload(), 'part':'-1'}, format='multipart')
        self.assertEqual(bad.status_code, 422)

    def test_html_email_strips_active_content_and_bad_files_are_rejected(self):
        message = EmailMessage()
        message['Subject'] = 'Deadline'
        message.set_content('<html><head><style>bad-css</style></head><body><script>bad-script</script><p>Submit by 21 October 2026.</p><img src="https://tracking.example.com/x" /></body></html>', subtype='html')
        with patch('requests.get') as get:
            parsed = parse_email(SimpleUploadedFile('html.eml', message.as_bytes()))
            self.assertIn('Submit by', parsed['body'])
            self.assertNotIn('bad-script', parsed['body'])
            self.assertNotIn('bad-css', parsed['body'])
            get.assert_not_called()
        response = self.client.post('/api/integrations/email/preview/', {'file':SimpleUploadedFile('bad.eml', b'not an email')}, format='multipart')
        self.assertEqual(response.status_code, 422)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post('/api/integrations/email/preview/', {}, format='multipart').status_code, 401)


@override_settings(**CONFIG)
class GoogleCalendarTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.user = User.objects.create_user(username='google-test', password='StrongPassword234!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.tokens = {'access_token':'test-access', 'refresh_token':'test-refresh',
                       'expires_at':time.time()+3600, 'scope':google.SCOPES, 'token_type':'Bearer'}

    def connection(self):
        return GoogleCalendarConnection.objects.create(user=self.user, google_subject='google-subject',
            account_email='student@example.com', tokens_encrypted=google.encrypt(self.tokens))

    def task(self):
        return Deadline.objects.create(user=self.user, title='Submit assignment', action_required='Upload report',
            due_date=date(2026,10,21), due_time='17:00', reminder_set=True)

    def test_oauth_uses_pkce_and_single_use_owner_bound_completion(self):
        response = self.client.post('/api/integrations/google/connect/')
        self.assertEqual(response.status_code, 200)
        query = parse_qs(urlparse(response.data['authorization_url']).query)
        self.assertEqual(query['code_challenge_method'], ['S256'])
        self.assertIn(google.CALENDAR_SCOPE, query['scope'][0])
        self.assertNotIn('gmail', query['scope'][0])
        state = query['state'][0]
        attempt = GoogleOAuthAttempt.objects.get()
        self.assertNotEqual(attempt.state_hash, state)
        fake_flow = Mock()
        fake_flow.oauth2session.token = self.tokens
        with patch('api.services.google_calendar.oauth_flow', return_value=fake_flow), patch('api.services.google_calendar.requests.get') as get:
            get.return_value.ok = True
            get.return_value.json.return_value = {'sub':'google-subject','email':'student@example.com','email_verified':True}
            ticket = google.receive_callback(state, 'test-code')
        self.assertFalse(GoogleCalendarConnection.objects.exists())
        other = User.objects.create_user(username='google-other')
        self.client.force_authenticate(other)
        self.assertEqual(self.client.post('/api/integrations/google/complete/', {'ticket':ticket}, format='json').status_code, 400)
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.post('/api/integrations/google/complete/', {'ticket':ticket}, format='json').status_code, 200)
        connection = GoogleCalendarConnection.objects.get()
        self.assertNotIn('test-refresh', connection.tokens_encrypted)
        self.assertEqual(self.client.post('/api/integrations/google/complete/', {'ticket':ticket}, format='json').status_code, 400)
        self.assertFalse(GoogleOAuthAttempt.objects.exists())

    def test_callback_rejects_expired_state_and_never_puts_tokens_in_query(self):
        GoogleOAuthAttempt.objects.create(user=self.user, state_hash=google.digest('expired'),
            verifier_encrypted=google.encrypt('test'), expires_at=timezone.now()-timedelta(minutes=1))
        with self.assertRaises(google.GoogleIntegrationError):
            google.receive_callback('expired','code')
        with patch('api.integration_views.google.receive_callback', return_value='one-use-ticket'):
            response = self.client.get('/api/integrations/google/callback/?state=valid&code=code')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(urlparse(response['Location']).query, '')
        self.assertEqual(urlparse(response['Location']).fragment, 'google_oauth=one-use-ticket')
        self.assertEqual(response['Referrer-Policy'], 'no-referrer')

    def test_sync_retries_stable_event_id_without_duplicate_calendars(self):
        connection = self.connection()
        task = self.task()
        with patch('api.services.google_calendar.google_request') as request:
            request.side_effect = [Mock(ok=True,json=lambda:{'id':'private-calendar'}), Mock(ok=False,status_code=503)]
            response = self.client.post(f'/api/integrations/calendar/tasks/{task.pk}/sync/')
        self.assertEqual(response.status_code, 202)
        link = CalendarEventLink.objects.get()
        event_id = link.event_id
        connection.refresh_from_db()
        self.assertEqual(connection.calendar_id, 'private-calendar')
        self.assertEqual(link.calendar_id, 'private-calendar')
        with patch('api.services.google_calendar.google_request') as request:
            request.return_value = Mock(ok=True,status_code=200,json=lambda:{'htmlLink':'https://calendar.google.com/event?test=1'})
            self.assertEqual(self.client.post(f'/api/integrations/calendar/tasks/{task.pk}/sync/').status_code, 200)
            self.assertEqual(request.call_count, 1)
        link.refresh_from_db()
        self.assertEqual(link.event_id, event_id)
        self.assertFalse(link.last_error)
        self.assertIsNotNone(link.last_synced)

    def test_changes_sync_after_commit_and_failed_deletions_are_retryable(self):
        connection = self.connection()
        task = self.task()
        link = CalendarEventLink.objects.create(connection=connection, deadline=task, event_id='a123', calendar_id='private-calendar')
        with patch('api.services.google_calendar.sync_link') as sync:
            with self.captureOnCommitCallbacks(execute=True):
                response = self.client.patch(f'/api/deadlines/{task.pk}/', {'title':'Updated'}, format='json')
            self.assertEqual(response.status_code, 200)
            sync.assert_called_once_with(link.pk)
        with patch('api.services.google_calendar.google_request', return_value=Mock(ok=False,status_code=503)):
            with self.captureOnCommitCallbacks(execute=True):
                response = self.client.delete(f'/api/deadlines/{task.pk}/')
        self.assertEqual(response.status_code, 204)
        link.refresh_from_db()
        self.assertTrue(link.pending_delete)
        self.assertIsNone(link.deadline_id)
        self.assertTrue(link.last_error)
        with patch('api.services.google_calendar.google_request', return_value=Mock(ok=False,status_code=404)):
            self.assertEqual(self.client.post(f'/api/integrations/calendar/links/{link.pk}/').status_code, 204)
        self.assertFalse(CalendarEventLink.objects.exists())

    def test_calendar_scope_ownership_event_times_and_disconnect(self):
        connection = self.connection()
        task = self.task()
        payload = google.event_body(task)
        self.assertEqual(payload['start']['dateTime'], '2026-10-21T17:00:00+05:30')
        self.assertEqual(payload['end']['dateTime'], '2026-10-21T17:15:00+05:30')
        task.due_time = ''
        payload = google.event_body(task)
        self.assertEqual(payload['start'], {'date':'2026-10-21'})
        self.assertEqual(payload['end'], {'date':'2026-10-22'})
        stranger = User.objects.create_user(username='calendar-other')
        self.client.force_authenticate(stranger)
        self.assertEqual(self.client.post(f'/api/integrations/calendar/tasks/{task.pk}/sync/').status_code,404)
        self.client.force_authenticate(self.user)
        with patch('api.services.google_calendar.google_request') as request:
            self.assertEqual(self.client.post('/api/integrations/google/disconnect/').status_code,200)
            request.assert_not_called()
        self.assertFalse(GoogleCalendarConnection.objects.filter(pk=connection.pk).exists())

    def test_expired_access_token_refreshes_without_losing_offline_token(self):
        connection = self.connection()
        connection.tokens_encrypted = google.encrypt({**self.tokens, 'expires_at':time.time()-10})
        connection.save()
        with patch('api.services.google_calendar.OAuth2Session') as oauth:
            oauth.return_value.refresh_token.return_value = {'access_token':'new-access', 'expires_at':time.time()+3600}
            self.assertEqual(google.access_token(connection), 'new-access')
            self.assertEqual(oauth.return_value.refresh_token.call_args.kwargs['timeout'], 8)
        connection.refresh_from_db()
        self.assertEqual(google.decrypt(connection.tokens_encrypted)['refresh_token'], 'test-refresh')
        self.assertNotIn('new-access', connection.tokens_encrypted)

    def test_google_deleted_event_gets_new_retryable_identifier(self):
        connection = self.connection()
        connection.calendar_id = 'private-calendar'
        connection.save()
        task = self.task()
        link = CalendarEventLink.objects.create(connection=connection, deadline=task, event_id='a123', calendar_id='private-calendar')
        with patch('api.services.google_calendar.google_request') as request:
            request.side_effect = [Mock(ok=False,status_code=410), Mock(ok=True,status_code=200,json=lambda:{})]
            google.sync_link(link.pk)
        link.refresh_from_db()
        self.assertNotEqual(link.event_id, 'a123')
        self.assertFalse(link.last_error)
        self.assertIsNotNone(link.last_synced)

    @override_settings(GOOGLE_CLIENT_SECRET='')
    def test_missing_configuration_is_reported_without_connecting(self):
        self.assertFalse(self.client.get('/api/integrations/calendar/').data['configured'])
        self.assertEqual(self.client.post('/api/integrations/google/connect/').status_code,503)
