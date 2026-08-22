from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    student_prn = models.CharField(max_length=50, unique=True, blank=True, null=True)
    department = models.CharField(max_length=200, default='School of Computer Science & Applications')
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=50, default='student') # 'student', 'coordinator', 'admin'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.student_prn or 'No PRN'})"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Notice(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notices')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='General')
    file = models.FileField(upload_to='notices/', blank=True, null=True)
    file_type = models.CharField(max_length=50, default='PDF Document')
    file_name = models.CharField(max_length=255, blank=True, null=True)
    source_institution = models.CharField(max_length=255, default='MIT World Peace University')
    notes = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_by_user = models.BooleanField(default=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title


class OCRText(models.Model):
    notice = models.OneToOneField(Notice, on_delete=models.CASCADE, related_name='ocr_data')
    extracted_text = models.TextField()
    extraction_method = models.CharField(max_length=50, default='PyTesseract OCR')
    extracted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OCR for {self.notice.title[:30]}"


class AIExtraction(models.Model):
    notice = models.OneToOneField(Notice, on_delete=models.CASCADE, related_name='ai_extraction')
    extracted_action = models.TextField()
    extracted_deadline = models.DateField(null=True, blank=True)
    extracted_due_time = models.CharField(max_length=20, default='17:00')
    extracted_priority = models.CharField(max_length=20, default='Medium') # High, Medium, Low
    extracted_eligibility = models.TextField(blank=True, null=True)
    confidence_score = models.FloatField(default=95.0)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Extracted Action for {self.notice.title[:30]}"


class Deadline(models.Model):
    STATUS_CHOICES = [
        ('Upcoming', 'Upcoming'),
        ('Completed', 'Completed'),
        ('Missed', 'Missed'),
    ]
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name='deadlines', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deadlines')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='General')
    action_required = models.TextField()
    due_date = models.DateField()
    due_time = models.CharField(max_length=20, default='17:00')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    eligibility = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Upcoming')
    reminder_set = models.BooleanField(default=False)
    file_type = models.CharField(max_length=50, default='PDF Document')
    file_name = models.CharField(max_length=255, blank=True, null=True)
    raw_text = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    source_institution = models.CharField(max_length=255, default='MIT World Peace University')
    extracted_confidence = models.FloatField(default=95.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date', '-priority']

    def __str__(self):
        return f"{self.title} (Due: {self.due_date})"


class Reminder(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Dispatched', 'Dispatched'),
        ('Cancelled', 'Cancelled'),
    ]

    deadline = models.ForeignKey(Deadline, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reminders')
    title = models.CharField(max_length=255)
    channel = models.CharField(max_length=100, default='Email & WhatsApp')
    trigger_date = models.CharField(max_length=100)
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=20, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    offset = models.CharField(max_length=50, default='2 days before')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Reminder: {self.title} via {self.channel}"


class AuditLog(models.Model):
    action = models.CharField(max_length=100)
    notice_title = models.CharField(max_length=255)
    confidence = models.CharField(max_length=50, default='N/A')
    status = models.CharField(max_length=50, default='Success')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} - {self.notice_title}"
