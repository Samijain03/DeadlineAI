import os
from unittest.mock import Mock, patch

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework import status
from .models import Category, Deadline, Reminder, UserProfile
from django.contrib.auth.models import User
from .authentication import SupabaseAuthentication
from .services.ai_service import extract_with_gemini, normalize_extraction
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Notice, OCRText, AIExtraction
from .services.ai_service import extract_with_heuristic_nlp
from datetime import timedelta
from django.utils import timezone

class CompletionRegressionTests(TestCase):
    def test_fallback_selects_deadline_not_issue_date(self):
        from .services.deadline_parser import extract_deadline
        self.assertEqual(extract_deadline('Issued: 1 October 2026 at 09:00\nSubmit by 21 Oct 2026 at 5:30 PM.'), ('2026-10-21', '17:30'))
        self.assertEqual(extract_deadline('Notice issued on 1 October 2026')[0], '')
        self.assertEqual(extract_deadline('Deadline: 21 October 2026\nDeadline: 22 October 2026')[0], '')
        self.assertEqual(extract_deadline('Submit by 31 February 2026')[0], '')
        self.assertEqual(extract_deadline('Submit by 21/10/2026 at 17:00'), ('2026-10-21', '17:00'))

    def test_resend_delivery_and_sanitized_failure(self):
        from django.test import override_settings
        from django.core.mail import send_mail
        with override_settings(EMAIL_BACKEND='api.email_backend.ResendEmailBackend', RESEND_API_KEY='test-key', DEFAULT_FROM_EMAIL='notices@example.com'):
            with patch('api.email_backend.requests.post') as post:
                post.return_value.ok = True
                self.assertEqual(send_mail('Reset', 'Synthetic body', None, ['student@example.com']), 1)
                self.assertEqual(post.call_args.args[0], 'https://api.resend.com/emails')
                self.assertEqual(post.call_args.kwargs['timeout'], 10)
                post.return_value.ok = False
                with self.assertRaisesRegex(RuntimeError, '^Email delivery is temporarily unavailable.$'):
                    send_mail('Reset', 'Synthetic body', None, ['student@example.com'])

    def test_missing_sender_reports_unavailable_without_sending(self):
        from django.test import override_settings
        from django.core.cache import cache
        cache.clear()
        with override_settings(EMAIL_BACKEND='api.email_backend.ResendEmailBackend', RESEND_API_KEY=''):
            with patch('api.email_backend.requests.post') as post:
                response = APIClient().post('/api/account/forgot-password/', {'email':'completion@example.com'}, format='json')
                self.assertEqual(response.status_code, 503)
                post.assert_not_called()

    def test_past_status_and_rescheduling_and_admin_categories(self):
        from .models import AuditLog
        user = User.objects.create_user(username='completion', password='UniquePassword43!')
        client = APIClient()
        client.force_authenticate(user)
        task = client.post('/api/deadlines/', {'title':'Submission', 'action_required':'Submit assignment', 'due_date':(timezone.localdate() - timedelta(days=1)).isoformat()}, format='json')
        self.assertEqual(task.status_code, 201)
        self.assertEqual(task.data['status'], 'Missed')
        path = f"/api/deadlines/{task.data['id']}/"
        client.patch(path + 'toggle-status/', {}, format='json')
        self.assertEqual(client.patch(path + 'toggle-status/', {}, format='json').data['status'], 'Missed')
        changed = client.patch(path, {'due_date':(timezone.localdate() + timedelta(days=3)).isoformat()}, format='json')
        self.assertEqual(changed.data['status'], 'Upcoming')
        self.assertTrue(AuditLog.objects.filter(action='Task updated').exists())
        self.assertEqual(client.post('/api/categories/', {'name':'Research'}, format='json').status_code, 403)
        user.is_staff = True
        user.save()
        self.assertEqual(client.post('/api/categories/', {'name':'Research'}, format='json').status_code, 201)
        self.assertTrue(AuditLog.objects.filter(action='Category created', notice_title='Research').exists())


class DeadlineAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test_student',
            email='test@mitwpu.edu.in',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        self.category, _ = Category.objects.get_or_create(name='Examination')
        self.deadline = Deadline.objects.create(
            user=self.user,
            title='Sample Midterm Exam Registration',
            category='Examination',
            action_required='Fill online exam form on portal',
            due_date='2026-08-28',
            priority='High',
            status='Upcoming'
        )

    def test_get_deadlines(self):
        response = self.client.get('/api/deadlines/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Sample Midterm Exam Registration')

    def test_toggle_deadline_status(self):
        response = self.client.patch(f'/api/deadlines/{self.deadline.id}/toggle-status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deadline.refresh_from_db()
        self.assertEqual(self.deadline.status, 'Completed')

    def test_conflict_radar_endpoint(self):
        # Create second deadline on same date to simulate conflict
        Deadline.objects.create(
            user=self.user,
            title='Capstone Project Submission',
            category='Assignment',
            action_required='Push code to GitHub',
            due_date='2026-08-28',
            priority='High',
            status='Upcoming'
        )
        response = self.client.get('/api/conflicts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['conflict_clusters_count'], 1)
        self.assertEqual(response.data['conflicts'][0]['date'], '2026-08-28')

    def test_analytics_summary_endpoint(self):
        response = self.client.get('/api/analytics/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_notices', response.data)
        self.assertIn('category_distribution', response.data)

    def test_parse_document_endpoint(self):
        payload = {
            "raw_text": "MIT WORLD PEACE UNIVERSITY CIRCULAR: SEMESTER-END EXAMINATION REGISTRATION. Students must submit online form before 28th August 2026. Minimum 75% attendance required."
        }
        response = self.client.post('/api/notices/parse-document/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('extracted_data', response.data)
        self.assertEqual(response.data['extracted_data']['category'], 'Examination')
        self.assertEqual(response.data['extracted_data']['due_date'], '2026-08-28')

    def test_deadlines_are_private_to_the_authenticated_user(self):
        other = User.objects.create_user(username='other_student', email='other@example.com')
        Deadline.objects.create(
            user=other,
            title='Private deadline',
            action_required='Do not expose this row',
            due_date='2026-10-01',
        )
        response = self.client.get('/api/deadlines/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['title'] for item in response.data], ['Sample Midterm Exam Registration'])

    def test_anonymous_requests_are_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/deadlines/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SupabaseAuthenticationTestCase(TestCase):
    @patch.dict(os.environ, {
        'SUPABASE_URL': 'https://project.supabase.co',
        'SUPABASE_PUBLISHABLE_KEY': 'publishable-key',
    })
    @patch('api.authentication.requests.get')
    def test_matching_prn_cannot_take_over_another_identity(self, mocked_get):
        seeded_user = User.objects.create_user(username='seeded-student', email='seeded@example.com')
        UserProfile.objects.create(user=seeded_user, student_prn='PRN-100')
        orphan_user = User.objects.create_user(username='supabase-user-id')
        mocked_get.return_value = Mock(
            status_code=200,
            json=lambda: {
                'id': 'supabase-user-id',
                'email': 'student@example.com',
                'user_metadata': {
                    'full_name': 'Student Name',
                    'student_prn': 'PRN-100',
                    'role': 'admin',
                },
                'app_metadata': {},
            },
        )
        request = APIRequestFactory().get('/', HTTP_AUTHORIZATION='Bearer valid-token')

        authenticated_user, _ = SupabaseAuthentication().authenticate(request)

        seeded_user.refresh_from_db()
        self.assertEqual(authenticated_user.pk, orphan_user.pk)
        self.assertEqual(seeded_user.username, 'seeded-student')
        self.assertFalse(seeded_user.is_staff)
        self.assertFalse(authenticated_user.is_staff)
        self.assertIsNone(authenticated_user.profile.student_prn)


class AIExtractionNormalizationTestCase(TestCase):
    def test_missing_deadline_is_not_invented(self):
        result = extract_with_heuristic_nlp('Students must submit the project. Date to be announced.')
        self.assertEqual(result['due_date'], '')
        self.assertEqual(result['due_time'], '')

    def test_numeric_date_is_extracted(self):
        result = extract_with_heuristic_nlp('Submit by 21/10/2026.')
        self.assertEqual(result['due_date'], '2026-10-21')
    def test_na_date_and_time_are_cleared_for_human_review(self):
        result = normalize_extraction({'due_date': 'N/A', 'due_time': 'N/A'})

        self.assertEqual(result['due_date'], '')
        self.assertEqual(result['due_time'], '')

    def test_valid_date_and_time_are_preserved(self):
        result = normalize_extraction({'due_date': '2026-09-30', 'due_time': '17:30:00'})

        self.assertEqual(result['due_date'], '2026-09-30')
        self.assertEqual(result['due_time'], '17:30')

    @patch('google.genai.Client')
    def test_gemini_request_has_a_bounded_timeout(self, mocked_client):
        mocked_client.return_value.models.generate_content.return_value.text = '''{
            "title": "Exam notice",
            "category": "Examination",
            "action_required": "Submit the exam form",
            "due_date": "2026-09-30",
            "due_time": "17:00",
            "priority": "High",
            "eligibility": "All students",
            "confidence": 95
        }'''

        result = extract_with_gemini('Exam registration notice', 'test-key')

        self.assertEqual(result['due_date'], '2026-09-30')
        http_options = mocked_client.call_args.kwargs['http_options']
        self.assertEqual(http_options.timeout, 8000)


class CompleteWorkflowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='student')
        self.other = User.objects.create_user(username='other')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def payload(self):
        return {'title':'Submit assignment', 'action_required':'Upload the report',
                'due_date':str(timezone.localdate() + timedelta(days=1)), 'due_time':'', 'reminder_set':True}

    def test_confirm_edit_remind_complete_and_delete(self):
        response = self.client.post('/api/deadlines/', self.payload(), format='json')
        self.assertEqual(response.status_code, 201, response.data)
        deadline = Deadline.objects.get(pk=response.data['id'])
        self.assertTrue(deadline.notice.verified_by_user)
        self.assertTrue(OCRText.objects.filter(notice=deadline.notice).exists())
        self.assertTrue(AIExtraction.objects.filter(notice=deadline.notice).exists())
        self.assertEqual(Reminder.objects.get(deadline=deadline).channel, 'In-app')
        response = self.client.patch(f'/api/deadlines/{deadline.pk}/', {'title':'Updated title'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Reminder.objects.get(deadline=deadline).title, 'Updated title')
        self.client.patch(f'/api/deadlines/{deadline.pk}/toggle-status/')
        self.assertEqual(Reminder.objects.get(deadline=deadline).status, 'Cancelled')
        response = self.client.delete(f'/api/deadlines/{deadline.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Notice.objects.count(), 0)
        self.assertEqual(Reminder.objects.count(), 0)

    def test_notice_relationship_cannot_cross_accounts(self):
        notice = Notice.objects.create(user=self.other, title='Private')
        response = self.client.post('/api/deadlines/', {**self.payload(), 'notice':notice.pk}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Deadline.objects.count(), 0)

    def test_private_original_document_download(self):
        notice = Notice.objects.create(user=self.user, title='Private', document_bytes=b'private data', file_name='notice.pdf', content_type='application/pdf')
        response = self.client.get(f'/api/notices/{notice.pk}/document/')
        self.assertEqual(response.content, b'private data')
        self.assertEqual(response['Cache-Control'], 'private, no-store')
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f'/api/notices/{notice.pk}/document/').status_code, 404)

    def test_invalid_upload_does_not_create_fabricated_notice(self):
        response = self.client.post('/api/notices/parse-document/', {'file':SimpleUploadedFile('invalid.pdf',b'not a pdf')})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(Notice.objects.count(), 0)

    def test_empty_input_rejected(self):
        self.assertEqual(self.client.post('/api/notices/parse-document/', {}, format='json').status_code,400)

    def test_students_cannot_access_administration(self):
        for endpoint in ['/api/admin-users/', '/api/admin-summary/', '/api/audit-logs/']:
            self.assertEqual(self.client.get(endpoint).status_code,403)

    def test_invalid_time_rejected(self):
        response = self.client.post('/api/deadlines/', {**self.payload(), 'due_time':'N/A'}, format='json')
        self.assertEqual(response.status_code,400)

    def test_due_reminder_is_private_and_acknowledged_once(self):
        from .services.reminders import sync_reminder
        deadline = Deadline.objects.create(user=self.user,title='Due today',action_required='Submit',due_date=timezone.localdate(),reminder_set=True)
        sync_reminder(deadline)
        due = self.client.get('/api/reminders/due/')
        self.assertEqual(len(due.data),1)
        self.client.post(f"/api/reminders/{due.data[0]['id']}/acknowledge/")
        self.assertEqual(self.client.get('/api/reminders/due/').data,[])
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get('/api/reminders/').data,[])

    @patch('api.views.analyze_notice_text', return_value={'title':'Actual notice','due_date':'2026-10-21','confidence':80})
    @patch('api.views.process_document_ocr', return_value={'text':'Submit by 21 October 2026','method':'Tesseract OCR'})
    def test_upload_stages_private_notice_until_confirmation(self, ocr, ai):
        response = self.client.post('/api/notices/parse-document/', {'file':SimpleUploadedFile('notice.png',b'image bytes')})
        self.assertEqual(response.status_code,200)
        notice = Notice.objects.get(pk=response.data['notice_id'])
        self.assertFalse(notice.verified_by_user)
        self.assertEqual(bytes(notice.document_bytes),b'image bytes')
        self.assertEqual(Deadline.objects.count(),0)

class NativeAuthenticationTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()
        self.details = {'email': 'native@example.com', 'password': 'UniqueLongPassword!42',
                        'name': 'Test Student', 'studentPrn': 'NATIVE001', 'department': 'Computing'}

    def test_registration_rotation_logout_and_disabled_account(self):
        response = self.client.post('/api/account/register/', self.details, format='json')
        self.assertEqual(response.status_code, 201)
        session = response.data['session']
        self.assertEqual(session['user']['app_metadata']['role'], 'student')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + session['access_token'])
        self.assertEqual(self.client.get('/api/account/me/').status_code, 200)
        rotated = self.client.post('/api/account/refresh/', {'refresh_token': session['refresh_token']}, format='json')
        self.assertEqual(rotated.status_code, 200)
        self.assertEqual(self.client.post('/api/account/refresh/', {'refresh_token': session['refresh_token']}, format='json').status_code, 401)
        new_refresh = rotated.data['refresh_token']
        self.assertEqual(self.client.post('/api/account/logout/', {'refresh_token': new_refresh}, format='json').status_code, 204)
        self.assertEqual(self.client.post('/api/account/refresh/', {'refresh_token': new_refresh}, format='json').status_code, 401)
        login = self.client.post('/api/account/login/', {'email': self.details['email'], 'password': self.details['password']}, format='json')
        self.assertEqual(login.status_code, 200)
        User.objects.filter(email=self.details['email']).update(is_active=False)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + login.data['session']['access_token'])
        self.assertEqual(self.client.get('/api/account/me/').status_code, 401)

    def test_validation_and_duplicate_prn_are_atomic(self):
        weak = {**self.details, 'password': 'short'}
        self.assertEqual(self.client.post('/api/account/register/', weak, format='json').status_code, 400)
        self.assertEqual(User.objects.count(), 0)
        self.client.post('/api/account/register/', self.details, format='json')
        duplicate = {**self.details, 'email': 'other@example.com'}
        self.assertEqual(self.client.post('/api/account/register/', duplicate, format='json').status_code, 400)
        self.assertEqual(User.objects.count(), 1)

    def test_reset_is_single_use_and_revokes_old_access(self):
        from django.test import override_settings
        from django.core import mail
        from urllib.parse import urlparse, parse_qs
        registered = self.client.post('/api/account/register/', self.details, format='json').data['session']
        with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post('/api/account/forgot-password/', {'email': self.details['email']}, format='json')
            self.assertEqual(response.status_code, 200)
            link = next(line for line in mail.outbox[0].body.splitlines() if line.startswith('http'))
            query = parse_qs(urlparse(link).query)
            payload = {'uid': query['uid'][0], 'token': query['token'][0], 'password': 'NewUniquePassword!55'}
            self.assertEqual(self.client.post('/api/account/reset-password/', payload, format='json').status_code, 200)
            self.assertEqual(self.client.post('/api/account/reset-password/', payload, format='json').status_code, 400)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + registered['access_token'])
        self.assertEqual(self.client.get('/api/account/me/').status_code, 401)
