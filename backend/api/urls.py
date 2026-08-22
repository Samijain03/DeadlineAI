from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, CategoryViewSet, NoticeViewSet,
    DeadlineViewSet, ReminderViewSet, AuditLogViewSet,
    conflict_radar_view, analytics_summary_view
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'notices', NoticeViewSet, basename='notices')
router.register(r'deadlines', DeadlineViewSet, basename='deadlines')
router.register(r'reminders', ReminderViewSet, basename='reminders')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')

urlpatterns = [
    path('', include(router.urls)),
    path('conflicts/', conflict_radar_view, name='conflict-radar'),
    path('analytics/summary/', analytics_summary_view, name='analytics-summary'),
]
