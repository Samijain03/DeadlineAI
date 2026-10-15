from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import native_auth
from . import integration_views as integrations
from .views import (
    AdminUserViewSet, admin_summary, AuthViewSet, CategoryViewSet, NoticeViewSet,
    DeadlineViewSet, ReminderViewSet, AuditLogViewSet,
    conflict_radar_view, analytics_summary_view, health_view
)

router = DefaultRouter()
router.register(r'admin-users', AdminUserViewSet, basename='admin-users')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'notices', NoticeViewSet, basename='notices')
router.register(r'deadlines', DeadlineViewSet, basename='deadlines')
router.register(r'reminders', ReminderViewSet, basename='reminders')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')

urlpatterns = [
    path('integrations/calendar/', integrations.calendar_status),
    path('integrations/google/connect/', integrations.calendar_connect),
    path('integrations/google/callback/', integrations.google_callback),
    path('integrations/google/complete/', integrations.google_complete),
    path('integrations/google/disconnect/', integrations.calendar_disconnect),
    path('integrations/calendar/tasks/<int:deadline_id>/sync/', integrations.calendar_share),
    path('integrations/calendar/links/<int:link_id>/', integrations.calendar_link),
    path('integrations/email/preview/', integrations.email_preview),
    path('integrations/email/analyze/', integrations.email_analyze),
    path('account/register/', native_auth.register),
    path('account/login/', native_auth.login),
    path('account/refresh/', native_auth.refresh),
    path('account/logout/', native_auth.logout),
    path('account/me/', native_auth.me),
    path('account/forgot-password/', native_auth.forgot_password),
    path('account/reset-password/', native_auth.reset_password),
    path('admin-summary/', admin_summary),
    path('health/', health_view, name='health'),
    path('', include(router.urls)),
    path('conflicts/', conflict_radar_view, name='conflict-radar'),
    path('analytics/summary/', analytics_summary_view, name='analytics-summary'),
]
