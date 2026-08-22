import os
import sys
import django

# Set UTF-8 stdout encoding if possible
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deadline_ai.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Category, Notice, OCRText, AIExtraction, Deadline, Reminder, AuditLog

def seed_database():
    print("[*] Seeding DeadlineAI database...")

    # 1. Create Default Categories
    categories = [
        "Examination", "Assignment", "Fees", "Events",
        "Scholarship", "Registration", "Placement", "General"
    ]
    for cat_name in categories:
        Category.objects.get_or_create(name=cat_name, defaults={"description": f"Academic notices relating to {cat_name}"})
    print(f"[OK] Seeded {len(categories)} categories")

    # 2. Create Student User & Profile
    user, created = User.objects.get_or_create(
        username='samay_jain',
        defaults={
            'email': 'samay.jain@mitwpu.edu.in',
            'first_name': 'Samay',
            'last_name': 'Jain'
        }
    )
    if created:
        user.set_password('password123')
        user.save()
        UserProfile.objects.create(
            user=user,
            student_prn='1272251075',
            department='School of Computer Science & Applications',
            phone='+91 98234-56789',
            role='student'
        )
    print("[OK] Seeded Student User: Samay Jain (PRN: 1272251075)")

    # 3. Create Sample Deadlines
    sample_deadlines = [
        {
            "title": "Semester End Examination Registration & Form Submission",
            "category": "Examination",
            "action_required": "Fill online exam form on portal (ERP) and submit signed receipt copy to CSE Department Office Counter #2.",
            "due_date": "2026-08-28",
            "due_time": "17:00",
            "priority": "High",
            "eligibility": "Minimum 75% overall academic attendance and cleared all lab backlog dues.",
            "status": "Upcoming",
            "reminder_set": True,
            "file_type": "PDF Document",
            "file_name": "MITWPU_Exam_Circular_Aug2026.pdf",
            "extracted_confidence": 98.4,
            "source_institution": "MIT World Peace University - Exam Cell",
            "notes": "Requires physical printout signed by mentor before submitting to Counter #2."
        },
        {
            "title": "Mini-Project Final Synopsis & GitHub Code Repository Submission",
            "category": "Assignment",
            "action_required": "Commit finalized codebase to GitHub, generate project documentation PDF, and upload submission link on Google Classroom.",
            "due_date": "2026-08-28",
            "due_time": "23:59",
            "priority": "High",
            "eligibility": "All 3rd Year B.Tech / MCA Computer Science students registered for Mini-Project Capstone course.",
            "status": "Upcoming",
            "reminder_set": False,
            "file_type": "PNG Image",
            "file_name": "MiniProject_Notice_DeptCS.png",
            "extracted_confidence": 96.8,
            "source_institution": "School of Computer Science & Applications",
            "notes": "Ensure repository has MIT license and all group members (Samay, Shaurya, Mrunal) are listed."
        },
        {
            "title": "MahaDBT State Merit Scholarship Renewal & Verification",
            "category": "Scholarship",
            "action_required": "Upload previous semester marksheets, verified family income certificate (Tehsildar signed), and submit biometric attendance at Scholarship Desk.",
            "due_date": "2026-09-05",
            "due_time": "16:00",
            "priority": "Medium",
            "eligibility": "GPA > 8.0 in previous academic year & family annual income under INR 8 Lakhs.",
            "status": "Upcoming",
            "reminder_set": True,
            "file_type": "JPG Document",
            "file_name": "MahaDBT_Scholarship_Notice.jpg",
            "extracted_confidence": 94.2,
            "source_institution": "Social Welfare & Student Aid Cell",
            "notes": "Income certificate must be dated after April 2026."
        },
        {
            "title": "Tata Consultancy Services (TCS) National Qualifier Placement Drive",
            "category": "Placement",
            "action_required": "Register on TCS NextStep portal, enter CT/DT reference ID in university placement ERP, and select campus interview slot.",
            "due_date": "2026-08-25",
            "due_time": "18:00",
            "priority": "High",
            "eligibility": "B.Tech/MCA CSE/IT students with aggregate >= 65% or 6.5 CGPA with no active backlogs.",
            "status": "Upcoming",
            "reminder_set": True,
            "file_type": "PDF Document",
            "file_name": "TCS_Campus_Placement_2026.pdf",
            "extracted_confidence": 99.1,
            "source_institution": "Training & Placement Cell, MIT-WPU",
            "notes": "Mandatory dress code for online test: Formal college attire with identity card."
        },
        {
            "title": "Annual University Cultural & Tech Fest Committee Nominations",
            "category": "Events",
            "action_required": "Submit statement of purpose and portfolio link for student coordinator position via Google Form.",
            "due_date": "2026-09-12",
            "due_time": "20:00",
            "priority": "Low",
            "eligibility": "Open to all enrolled undergraduate and postgraduate students with no disciplinary penalties.",
            "status": "Upcoming",
            "reminder_set": False,
            "file_type": "PDF Document",
            "file_name": "Aarohan_Fest_Committee_Circular.pdf",
            "extracted_confidence": 92.5,
            "source_institution": "Student Affairs Council",
            "notes": "Great opportunity for leadership credits and resume building."
        },
        {
            "title": "Even Semester Tuition Fee Balance Installment Clearance",
            "category": "Fees",
            "action_required": "Pay remaining tuition fee balance via Net Banking/UPI on fees portal and email transaction UTR number to accounts@mitwpu.edu.in.",
            "due_date": "2026-08-30",
            "due_time": "17:00",
            "priority": "Medium",
            "eligibility": "All students with pending balance dues for the current academic session.",
            "status": "Completed",
            "reminder_set": False,
            "file_type": "PDF Document",
            "file_name": "Tuition_Fee_Clearance_Notice.pdf",
            "extracted_confidence": 97.2,
            "source_institution": "Accounts & Finance Section",
            "notes": "Paid via UPI on Aug 20. Receipt saved."
        }
    ]

    for item in sample_deadlines:
        Deadline.objects.get_or_create(
            title=item["title"],
            defaults={
                "user": user,
                "category": item["category"],
                "action_required": item["action_required"],
                "due_date": item["due_date"],
                "due_time": item["due_time"],
                "priority": item["priority"],
                "eligibility": item["eligibility"],
                "status": item["status"],
                "reminder_set": item["reminder_set"],
                "file_type": item["file_type"],
                "file_name": item["file_name"],
                "extracted_confidence": item["extracted_confidence"],
                "source_institution": item["source_institution"],
                "notes": item["notes"]
            }
        )
    print(f"[OK] Seeded {len(sample_deadlines)} initial academic deadlines")

    # 4. Create Initial Reminders
    exam_d = Deadline.objects.filter(title__contains="Examination").first()
    if exam_d:
        Reminder.objects.get_or_create(
            deadline=exam_d,
            defaults={
                "user": user,
                "title": exam_d.title,
                "channel": "Email & WhatsApp",
                "trigger_date": "2026-08-26 • 09:00 AM",
                "due_date": exam_d.due_date,
                "priority": "High",
                "status": "Active",
                "offset": "2 days before"
            }
        )

    tcs_d = Deadline.objects.filter(title__contains="TCS").first()
    if tcs_d:
        Reminder.objects.get_or_create(
            deadline=tcs_d,
            defaults={
                "user": user,
                "title": tcs_d.title,
                "channel": "Push & Email",
                "trigger_date": "2026-08-24 • 12:00 PM",
                "due_date": tcs_d.due_date,
                "priority": "High",
                "status": "Active",
                "offset": "1 day before"
            }
        )
    print("[OK] Seeded scheduled reminders")

    # 5. Audit Logs
    AuditLog.objects.get_or_create(
        action="Document Ingested",
        notice_title="TCS NQT Placement Drive",
        defaults={"confidence": "99.1%", "status": "Success"}
    )
    AuditLog.objects.get_or_create(
        action="Conflict Detected",
        notice_title="Exam Form vs Mini-Project",
        defaults={"confidence": "100%", "status": "Warning"}
    )
    print("[OK] Seeded audit logs")
    print("[SUCCESS] Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
