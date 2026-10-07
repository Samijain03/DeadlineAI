from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from django.db.models import Count, Q
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from .services.reminders import sync_reminder, due_reminders

from .models import UserProfile, Category, Notice, OCRText, AIExtraction, Deadline, Reminder, AuditLog
from .serializers import (
    UserSerializer, CategorySerializer, NoticeSerializer,
    OCRTextSerializer, AIExtractionSerializer, DeadlineSerializer,
    ReminderSerializer, AuditLogSerializer
)
from .services.ocr_service import process_document_ocr
from .services.ai_service import analyze_notice_text
from .permissions import IsAdminOrReadOnly


@api_view(['GET'])
@permission_classes([AllowAny])
def health_view(request):
    return Response({'status': 'ok'})


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def current_user(self, request):
        return Response(UserSerializer(request.user).data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notice.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='parse-document')
    def parse_document(self, request):
        """
        All-in-one OCR + AI Action Extraction pipeline for uploaded files or text.
        """
        uploaded_file = request.FILES.get('file')
        raw_text_input = request.data.get('raw_text', '')
        filename = uploaded_file.name if uploaded_file else request.data.get('file_name', 'Notice_Document.pdf')

        # 1. OCR Extraction Step
        ocr_result = {"text": "", "method": "Direct Input"}
        if uploaded_file:
            try:
                ocr_result = process_document_ocr(uploaded_file, filename)
            except ValueError as exc:
                return Response({'error': str(exc)}, status=422)
            except ImportError:
                return Response({'error': 'Image reading is temporarily unavailable. Try a text PDF or enter details manually.'}, status=503)
            extracted_text = ocr_result.get("text", "")
        else:
            extracted_text = str(raw_text_input).strip()
            if not extracted_text or len(extracted_text) > 50000:
                return Response({'error': 'Provide a document or between 1 and 50,000 characters of notice text.'}, status=400)

        # 2. AI Entity & Action Extraction Step
        ai_extracted = analyze_notice_text(extracted_text)

        notice = None
        if uploaded_file:
            uploaded_file.seek(0)
            notice = Notice.objects.create(
                user=request.user, title=str(ai_extracted.get('title') or filename)[:255],
                file_name=filename[:255], document_bytes=uploaded_file.read(),
                content_type='application/pdf' if filename.lower().endswith('.pdf') else 'application/octet-stream',
                verified_by_user=False,
            )
            OCRText.objects.create(notice=notice, extracted_text=extracted_text,
                                   extraction_method=ocr_result['method'][:50])

        # 3. Log event
        AuditLog.objects.create(
            action="Document Parsed & Extracted",
            notice_title=ai_extracted.get("title", filename)[:200],
            confidence=f"{ai_extracted.get('confidence', 96.0)}%",
            status="Success"
        )

        return Response({
            "success": True,
            "notice_id": notice.pk if notice else None,
            "filename": filename,
            "file_type": "PDF Document" if filename.lower().endswith('.pdf') else "Image Notice",
            "ocr_text": extracted_text,
            "ocr_method": ocr_result.get("method", "PyTesseract / PyPDF"),
            "extracted_data": ai_extracted
        })

    @action(detail=True, methods=['get'])
    def document(self, request, pk=None):
        notice = self.get_object()
        if not notice.document_bytes:
            return Response({'error': 'Original document is not available for this notice.'}, status=404)
        response = HttpResponse(bytes(notice.document_bytes), content_type=notice.content_type)
        from django.utils.http import content_disposition_header
        response['Content-Disposition'] = content_disposition_header(True, notice.file_name or 'notice')
        response['X-Content-Type-Options'] = 'nosniff'
        response['Cache-Control'] = 'private, no-store'
        return response

    @action(detail=False, methods=['post'], url_path='ask-question')
    def ask_question(self, request):
        question = str(request.data.get('question', '')).strip()
        text = str(request.data.get('notice_text', '')).strip()
        if not question or not text:
            return Response({'error': 'Provide a question and source notice text.'}, status=400)
        import re
        words = set(re.findall(r'[a-z]{4,}', question.lower())) - {'what', 'when', 'this', 'that', 'does', 'have', 'need'}
        lines = re.split(r'(?<=[.!?])\s+|\n', text)
        matches = sorted(lines, key=lambda line: len(words & set(re.findall(r'[a-z]{4,}', line.lower()))), reverse=True)
        matches = [line for line in matches if words & set(re.findall(r'[a-z]{4,}', line.lower()))]
        answer = 'Relevant source text: ' + ' '.join(matches[:3]) if matches else 'I could not find an answer in this notice. Check the original document or contact its issuer.'
        return Response({'answer': answer, 'method': 'Source text lookup'})


class DeadlineViewSet(viewsets.ModelViewSet):
    queryset = Deadline.objects.all()
    serializer_class = DeadlineSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        deadline = serializer.save(user=self.request.user)
        self.save_notice_details(deadline)
        sync_reminder(deadline)

    @transaction.atomic
    def perform_update(self, serializer):
        deadline = serializer.save()
        self.save_notice_details(deadline)
        sync_reminder(deadline)

    def save_notice_details(self, deadline):
        if deadline.notice_id is None:
            deadline.notice = Notice.objects.create(user=deadline.user, title=deadline.title, file_name=deadline.file_name)
            deadline.save(update_fields=['notice'])
        notice = deadline.notice
        notice.title = deadline.title
        notice.category = deadline.category
        notice.verified_by_user = True
        notice.save(update_fields=['title', 'category', 'verified_by_user'])
        OCRText.objects.update_or_create(notice=notice, defaults={'extracted_text': deadline.raw_text or '', 'extraction_method': 'Reviewed source'})
        AIExtraction.objects.update_or_create(notice=notice, defaults={
            'extracted_action': deadline.action_required, 'extracted_deadline': deadline.due_date,
            'extracted_due_time': deadline.due_time, 'extracted_priority': deadline.priority,
            'extracted_eligibility': deadline.eligibility or '', 'confidence_score': deadline.extracted_confidence,
        })

    def get_queryset(self):
        qs = Deadline.objects.filter(user=self.request.user)
        qs.filter(status='Upcoming', due_date__lt=timezone.localdate()).update(status='Missed')
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if category and category != 'All':
            qs = qs.filter(category=category)
        if priority and priority != 'All':
            qs = qs.filter(priority=priority)
        if status_param and status_param != 'All':
            qs = qs.filter(status=status_param)
        for parameter, lookup in [('date_from', 'due_date__gte'), ('date_to', 'due_date__lte')]:
            value = self.request.query_params.get(parameter)
            if value:
                from datetime import date
                from rest_framework.exceptions import ValidationError
                try:
                    date.fromisoformat(value)
                except ValueError:
                    raise ValidationError({parameter: 'Use YYYY-MM-DD.'})
                qs = qs.filter(**{lookup: value})
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(action_required__icontains=search) |
                Q(eligibility__icontains=search)
            )
        return qs

    @transaction.atomic
    def perform_destroy(self, instance):
        notice = instance.notice
        instance.delete()
        if notice and not notice.deadlines.exists():
            notice.delete()

    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        deadline = self.get_object()
        deadline.status = 'Upcoming' if deadline.status == 'Completed' else 'Completed'
        deadline.save()
        sync_reminder(deadline)
        return Response(DeadlineSerializer(deadline).data)

    @action(detail=True, methods=['post'], url_path='toggle-reminder')
    def toggle_reminder(self, request, pk=None):
        deadline = self.get_object()
        deadline.reminder_set = not deadline.reminder_set
        deadline.save(update_fields=['reminder_set'])
        sync_reminder(deadline)
        return Response({'reminder_set': deadline.reminder_set})


class ReminderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def due(self, request):
        return Response(ReminderSerializer(due_reminders(request.user), many=True).data)

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        reminder = self.get_object()
        reminder.status = 'Dispatched'
        reminder.save(update_fields=['status'])
        return Response({'status': 'Dispatched'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conflict_radar_view(request):
    """
    Smart Deadline Conflict Detection Engine endpoint.
    Finds dates with multiple high/medium deadlines and generates workload stress insights.
    """
    active_deadlines = Deadline.objects.filter(user=request.user).exclude(status='Completed')
    
    # Group by due_date
    date_map = {}
    for d in active_deadlines:
        date_str = str(d.due_date)
        if date_str not in date_map:
            date_map[date_str] = []
        date_map[date_str].append(DeadlineSerializer(d).data)

    conflicts = []
    for date_str, items in date_map.items():
        if len(items) > 1:
            conflicts.append({
                "date": date_str,
                "count": len(items),
                "has_high_urgency": any(i['priority'] == 'High' for i in items),
                "tasks": items,
                "ai_recommendation": f"Multiple tasks due simultaneously on {date_str}. Complete {items[0]['category']} submission 48 hours in advance to eliminate rush."
            })

    return Response({
        "conflict_clusters_count": len(conflicts),
        "conflicts": conflicts
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_summary_view(request):
    """
    Analytics KPI summary endpoint.
    """
    deadlines = Deadline.objects.filter(user=request.user)
    total = deadlines.count()
    completed = deadlines.filter(status='Completed').count()
    upcoming = deadlines.filter(status='Upcoming').count()
    high_priority = deadlines.filter(priority='High', status='Upcoming').count()
    reminders_count = Reminder.objects.filter(user=request.user, status='Active').count()

    categories = deadlines.values('category').annotate(count=Count('id'))
    cat_breakdown = {c['category']: c['count'] for c in categories}

    completion_rate = round((completed / total) * 100) if total > 0 else 0

    return Response({
        "total_notices": total,
        "active_deadlines": upcoming,
        "critical_urgency": high_priority,
        "completed_count": completed,
        "completion_rate": completion_rate,
        "active_reminders": reminders_count,
        "category_distribution": cat_breakdown,
        "system_status": "Operational",
        "ocr_engine": "PyTesseract & Gemini LLM Active"
    })


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    from django.contrib.auth.models import User
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'], url_path='set-active')
    def set_active(self, request, pk=None):
        user = self.get_object()
        if user.pk == request.user.pk or user.is_superuser or user.is_staff:
            return Response({'error': 'Administrator accounts cannot be disabled here.'}, status=400)
        active = request.data.get('is_active')
        if not isinstance(active, bool):
            return Response({'error': 'is_active must be true or false.'}, status=400)
        user.is_active = active
        user.save(update_fields=['is_active'])
        return Response(UserSerializer(user).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_summary(request):
    from django.contrib.auth.models import User
    return Response({'users': User.objects.count(), 'notices': Notice.objects.count(),
                     'deadlines': Deadline.objects.count(), 'completed': Deadline.objects.filter(status='Completed').count(),
                     'reminders': Reminder.objects.filter(status='Active').count()})
