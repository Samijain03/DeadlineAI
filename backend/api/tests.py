import os
from unittest.mock import Mock, patch

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework import status
from .models import Category, Deadline, Reminder, UserProfile
from django.contrib.auth.models import User
from .authentication import SupabaseAuthentication

class DeadlineAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test_student',
            email='test@mitwpu.edu.in',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name='Examination')
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
    def test_existing_prn_profile_is_adopted_by_supabase_identity(self, mocked_get):
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
        self.assertEqual(authenticated_user.pk, seeded_user.pk)
        self.assertEqual(seeded_user.username, 'supabase-user-id')
        self.assertFalse(seeded_user.is_staff)
        self.assertFalse(User.objects.filter(pk=orphan_user.pk).exists())
