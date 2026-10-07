from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from django.db import migrations


def initialize(apps, schema_editor):
    Category = apps.get_model('api', 'Category')
    Deadline = apps.get_model('api', 'Deadline')
    Reminder = apps.get_model('api', 'Reminder')
    for name in ['Examination', 'Assignment', 'Fees', 'Events', 'Scholarship', 'Registration', 'Placement', 'General']:
        Category.objects.get_or_create(name=name)
    for deadline in Deadline.objects.filter(reminder_set=True, user__isnull=False).exclude(status='Completed').iterator():
        trigger = datetime.combine(deadline.due_date - timedelta(days=1), time(9), ZoneInfo('Asia/Kolkata')).isoformat()
        if not Reminder.objects.filter(deadline=deadline, user_id=deadline.user_id).exists():
            Reminder.objects.create(deadline=deadline, user_id=deadline.user_id, title=deadline.title,
                                    channel='In-app', trigger_date=trigger, due_date=deadline.due_date,
                                    priority=deadline.priority, offset='1 day before', status='Active')


class Migration(migrations.Migration):
    dependencies = [('api', '0003_alter_deadline_due_time')]
    operations = [migrations.RunPython(initialize, migrations.RunPython.noop)]
