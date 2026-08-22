from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Category, Notice, OCRText, AIExtraction, Deadline, Reminder, AuditLog

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['student_prn', 'department', 'phone', 'role', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']


class OCRTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRText
        fields = ['id', 'extracted_text', 'extraction_method', 'extracted_at']


class AIExtractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIExtraction
        fields = ['id', 'extracted_action', 'extracted_deadline', 'extracted_due_time', 'extracted_priority', 'extracted_eligibility', 'confidence_score', 'analyzed_at']


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'deadline', 'user', 'title', 'channel', 'trigger_date', 'due_date', 'priority', 'status', 'offset', 'created_at']


class DeadlineSerializer(serializers.ModelSerializer):
    reminders = ReminderSerializer(many=True, read_only=True)

    class Meta:
        model = Deadline
        fields = [
            'id', 'notice', 'user', 'title', 'category', 'action_required', 
            'due_date', 'due_time', 'priority', 'eligibility', 'status', 
            'reminder_set', 'file_type', 'file_name', 'raw_text', 'notes', 
            'source_institution', 'extracted_confidence', 'created_at', 'updated_at',
            'reminders'
        ]


class NoticeSerializer(serializers.ModelSerializer):
    ocr_data = OCRTextSerializer(read_only=True)
    ai_extraction = AIExtractionSerializer(read_only=True)
    deadlines = DeadlineSerializer(many=True, read_only=True)

    class Meta:
        model = Notice
        fields = [
            'id', 'user', 'title', 'category', 'file', 'file_type', 'file_name', 
            'source_institution', 'notes', 'uploaded_at', 'verified_by_user',
            'ocr_data', 'ai_extraction', 'deadlines'
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'notice_title', 'confidence', 'status', 'timestamp']
