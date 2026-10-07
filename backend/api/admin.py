from django.contrib import admin
from .models import UserProfile, Category, Notice, OCRText, AIExtraction, Deadline, Reminder, AuditLog

admin.site.site_header = 'DeadlineAI administration'
admin.site.site_title = 'DeadlineAI'

@admin.register(Deadline)
class DeadlineAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'due_date', 'priority', 'status']
    list_filter = ['status', 'priority', 'category', 'due_date']
    search_fields = ['title', 'user__email', 'action_required']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'notice_title', 'status', 'timestamp']
    list_filter = ['status', 'timestamp']
    readonly_fields = ['action', 'notice_title', 'confidence', 'status', 'timestamp']

admin.site.register([UserProfile, Category, Notice, OCRText, AIExtraction, Reminder])
