from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from django.utils import timezone
from api.models import Reminder


def sync_reminder(deadline):
    """One default in-app reminder, kept consistent with the deadline."""
    if not deadline.reminder_set or deadline.status == 'Completed':
        Reminder.objects.filter(deadline=deadline).update(status='Cancelled')
        return
    trigger = datetime.combine(deadline.due_date - timedelta(days=1), time(9), ZoneInfo('Asia/Kolkata'))
    reminder = Reminder.objects.filter(deadline=deadline, user=deadline.user).first()
    values = dict(title=deadline.title, channel='In-app', trigger_date=trigger.isoformat(),
                  due_date=deadline.due_date, priority=deadline.priority, offset='1 day before', status='Active')
    if reminder:
        unchanged = reminder.trigger_date == values['trigger_date'] and reminder.status == 'Dispatched'
        if unchanged:
            values['status'] = 'Dispatched'
        for name, value in values.items():
            setattr(reminder, name, value)
        reminder.save()
    else:
        Reminder.objects.create(deadline=deadline, user=deadline.user, **values)


def due_reminders(user):
    now = timezone.now()
    due = []
    for reminder in Reminder.objects.filter(user=user, status='Active', deadline__reminder_set=True).exclude(deadline__status='Completed'):
        try:
            trigger = datetime.fromisoformat(reminder.trigger_date)
            if trigger.tzinfo is None:
                trigger = trigger.replace(tzinfo=ZoneInfo('Asia/Kolkata'))
        except ValueError:
            sync_reminder(reminder.deadline)
            continue
        if trigger <= now:
            due.append(reminder)
    return due
