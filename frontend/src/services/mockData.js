export const INITIAL_CATEGORIES = [
  "Examination",
  "Assignment",
  "Fees",
  "Events",
  "Scholarship",
  "Registration",
  "Placement",
  "General"
];

export const SAMPLE_NOTICES = [
  {
    id: "not-001",
    title: "Semester End Examination Registration & Form Submission",
    category: "Examination",
    actionRequired: "Fill online exam form on portal (ERP) and submit signed receipt copy to CSE Department Office Counter #2.",
    dueDate: "2026-08-28",
    dueTime: "17:00",
    priority: "High",
    eligibility: "Minimum 75% overall academic attendance and cleared all lab backlog dues.",
    status: "Upcoming",
    reminderSet: true,
    fileType: "PDF Document",
    fileName: "MITWPU_Exam_Circular_Aug2026.pdf",
    extractedConfidence: 98.4,
    sourceInstitution: "MIT World Peace University - Exam Cell",
    rawText: `MIT WORLD PEACE UNIVERSITY, PUNE
DEPARTMENT OF EXAMINATIONS & EVALUATION
REF: WPU/EXAM/2026/08-112

CIRCULAR: SEMESTER-END EXAMINATION REGISTRATION
It is hereby informed to all enrolled B.Tech and MCA Computer Science students that the examination registration portal for the End-Semester Examination 2025-2026 is now live.

KEY INSTRUCTIONS:
1. Students must log in to the ERP Portal (erp.mitwpu.edu.in) using their Student PRN.
2. Verify all enrolled course codes before final submission.
3. The deadline for online submission and payment of examination fees is strictly 28th August 2026 before 5:00 PM.
4. Hard copy of the computer-generated form along with fee receipt must be deposited at Counter #2.

ELIGIBILITY: Students having less than 75% attendance shall not be permitted for hall ticket generation.
Controller of Examinations`,
    notes: "Requires physical printout signed by mentor before submitting to Counter #2."
  },
  {
    id: "not-002",
    title: "Mini-Project Final Synopsis & GitHub Code Repository Submission",
    category: "Assignment",
    actionRequired: "Commit finalized codebase to GitHub, generate project documentation PDF, and upload submission link on Google Classroom.",
    dueDate: "2026-08-28",
    dueTime: "23:59",
    priority: "High",
    eligibility: "All 3rd Year B.Tech / MCA Computer Science students registered for Mini-Project Capstone course.",
    status: "Upcoming",
    reminderSet: false,
    fileType: "PNG Image",
    fileName: "MiniProject_Notice_DeptCS.png",
    extractedConfidence: 96.8,
    sourceInstitution: "School of Computer Science & Applications",
    rawText: `SCHOOL OF COMPUTER SCIENCE & APPLICATIONS
MINI-PROJECT 2025-2026 SUBMISSION DEADLINE NOTICE

All project groups are instructed to complete the following deliverables on or before 28th August 2026, 11:59 PM:
1. Functional Prototype hosted or locally verifiable.
2. Complete GitHub repository containing clean README.md, system architecture diagrams, and requirements.txt.
3. Mini-Project Synopsis and Final Report in prescribed university format.
Late submissions will attract a deduction of 10% marks per day.
Project Coordinator: Prof. S. Kulkarni`,
    notes: "Ensure repository has MIT license and all group members (Samay, Shaurya, Mrunal) are listed."
  },
  {
    id: "not-003",
    title: "MahaDBT State Merit Scholarship Renewal & Verification",
    category: "Scholarship",
    actionRequired: "Upload previous semester marksheets, verified family income certificate (Tehsildar signed), and submit biometric attendance at Scholarship Desk.",
    dueDate: "2026-09-05",
    dueTime: "16:00",
    priority: "Medium",
    eligibility: "GPA > 8.0 in previous academic year & family annual income under INR 8 Lakhs.",
    status: "Upcoming",
    reminderSet: true,
    fileType: "JPG Document",
    fileName: "MahaDBT_Scholarship_Notice.jpg",
    extractedConfidence: 94.2,
    sourceInstitution: "Social Welfare & Student Aid Cell",
    rawText: `GOVERNMENT OF MAHARASHTRA / MIT-WPU STUDENT AID CELL
MAHADBT SCHOLARSHIP SCHEME 2026

Attention Eligible Students:
Renewal applications for the State Merit & Post-Matric Scholarship Scheme for Academic Year 2025-2026 are now open.
Last Date for Document Verification on Campus: 5th September 2026.

MANDATORY DOCUMENTS REQUIRED:
- Domicile Certificate
- Previous Semester All Clear Marksheets (Original + 2 copies)
- Income Certificate issued by competent Tehsildar authority
Contact: Student Welfare Office, Ground Floor.`,
    notes: "Income certificate must be dated after April 2026."
  },
  {
    id: "not-004",
    title: "Tata Consultancy Services (TCS) National Qualifier Placement Drive",
    category: "Placement",
    actionRequired: "Register on TCS NextStep portal, enter CT/DT reference ID in university placement ERP, and select campus interview slot.",
    dueDate: "2026-08-25",
    dueTime: "18:00",
    priority: "High",
    eligibility: "B.Tech/MCA CSE/IT students with aggregate >= 65% or 6.5 CGPA with no active backlogs.",
    status: "Upcoming",
    reminderSet: true,
    fileType: "PDF Document",
    fileName: "TCS_Campus_Placement_2026.pdf",
    extractedConfidence: 99.1,
    sourceInstitution: "Training & Placement Cell, MIT-WPU",
    rawText: `MIT-WPU TRAINING & PLACEMENT CELL
CAMPUS RECRUITMENT NOTICE - TATA CONSULTANCY SERVICES (TCS NQT 2026)

Eligibility Criteria:
- B.Tech CSE / IT / AI / DS (Graduating Class 2026)
- Minimum 65% aggregate throughout 10th, 12th, and Degree semesters.
- Max 1 year academic gap allowed.

Registration Steps:
1. Register on TCS NextStep Portal and generate your DT ID.
2. Complete test slot booking on university T&P portal by 25 August 2026, 6:00 PM.
T&P Officer: Dr. V. Deshpande`,
    notes: "Mandatory dress code for online test: Formal college attire with identity card."
  },
  {
    id: "not-005",
    title: "Annual University Cultural & Tech Fest Committee Nominations",
    category: "Events",
    actionRequired: "Submit statement of purpose and portfolio link for student coordinator position via Google Form.",
    dueDate: "2026-09-12",
    dueTime: "20:00",
    priority: "Low",
    eligibility: "Open to all enrolled undergraduate and postgraduate students with no disciplinary penalties.",
    status: "Upcoming",
    reminderSet: false,
    fileType: "PDF Document",
    fileName: "Aarohan_Fest_Committee_Circular.pdf",
    extractedConfidence: 92.5,
    sourceInstitution: "Student Affairs Council",
    rawText: `MIT-WPU STUDENT AFFAIRS & CULTURAL COUNCIL
CALL FOR STUDENT COORDINATORS - AAROHAN TECH & CULTURAL FEST 2026

Positions open for:
- Technical Hackathon Lead
- Web & App Development Coordinator
- Sponsorship & PR Manager
- Logistics & Stage Operations

Application form closes on 12th September 2026 at 8:00 PM. Shortlisted candidates will be invited for interview round on 15th September.`,
    notes: "Great opportunity for leadership credits and resume building."
  },
  {
    id: "not-006",
    title: "Even Semester Tuition Fee Balance Installment Clearance",
    category: "Fees",
    actionRequired: "Pay remaining tuition fee balance via Net Banking/UPI on fees portal and email transaction UTR number to accounts@mitwpu.edu.in.",
    dueDate: "2026-08-30",
    dueTime: "17:00",
    priority: "Medium",
    eligibility: "All students with pending balance dues for the current academic session.",
    status: "Completed",
    reminderSet: false,
    fileType: "PDF Document",
    fileName: "Tuition_Fee_Clearance_Notice.pdf",
    extractedConfidence: 97.2,
    sourceInstitution: "Accounts & Finance Section",
    rawText: `ACCOUNTS & FINANCE DEPARTMENT
CIRCULAR: TUITION FEE PAYMENT BALANCE DEADLINE

All students are requested to clear their pending second installment tuition and laboratory fees on or before 30th August 2026.
Failure to clear fees will result in temporary suspension of ERP access and library card privileges.
Online Portal: fee.mitwpu.edu.in`,
    notes: "Paid via UPI on Aug 20. Receipt saved."
  }
];

export const DEMO_PRESET_NOTICES = [
  {
    presetKey: "exam_form",
    label: "📄 Semester Exam Circular (High Urgency)",
    fileName: "Exam_Notice_Fall2026.pdf",
    fileType: "PDF Document",
    data: {
      title: "Semester End Theory & Practical Exam Registration Form",
      category: "Examination",
      actionRequired: "Fill online exam form on portal (ERP) and submit signed receipt copy to CSE Department Office Counter #2.",
      dueDate: "2026-08-28",
      dueTime: "17:00",
      priority: "High",
      eligibility: "Minimum 75% overall academic attendance and cleared all lab backlog dues.",
      notes: "Requires physical printout signed by mentor before submitting."
    },
    rawOcrText: `MIT WORLD PEACE UNIVERSITY, PUNE
DEPARTMENT OF EXAMINATIONS & EVALUATION
REF: WPU/EXAM/2026/08-112

CIRCULAR: SEMESTER-END EXAMINATION REGISTRATION
It is hereby informed to all enrolled B.Tech and MCA Computer Science students that the examination registration portal for the End-Semester Examination 2025-2026 is now live.

KEY INSTRUCTIONS:
1. Students must log in to the ERP Portal (erp.mitwpu.edu.in) using their Student PRN.
2. Verify all enrolled course codes before final submission.
3. The deadline for online submission and payment of examination fees is strictly 28th August 2026 before 5:00 PM.
4. Hard copy of the computer-generated form along with fee receipt must be deposited at Counter #2.

ELIGIBILITY: Students having less than 75% attendance shall not be permitted for hall ticket generation.
Controller of Examinations`
  },
  {
    presetKey: "project_submission",
    label: "💻 Capstone Mini-Project Submission",
    fileName: "MiniProject_Notice.png",
    fileType: "PNG Image",
    data: {
      title: "Mini-Project Final Synopsis & Code Repository Submission",
      category: "Assignment",
      actionRequired: "Commit finalized codebase to GitHub, generate project documentation PDF, and upload submission link on Google Classroom.",
      dueDate: "2026-08-28",
      dueTime: "23:59",
      priority: "High",
      eligibility: "All 3rd Year B.Tech / MCA Computer Science students registered for Mini-Project Capstone course.",
      notes: "Ensure repository has MIT license and all group members are listed."
    },
    rawOcrText: `SCHOOL OF COMPUTER SCIENCE & APPLICATIONS
MINI-PROJECT 2025-2026 SUBMISSION DEADLINE NOTICE

All project groups are instructed to complete the following deliverables on or before 28th August 2026, 11:59 PM:
1. Functional Prototype hosted or locally verifiable.
2. Complete GitHub repository containing clean README.md, system architecture diagrams, and requirements.txt.
3. Mini-Project Synopsis and Final Report in prescribed university format.
Late submissions will attract a deduction of 10% marks per day.
Project Coordinator: Prof. S. Kulkarni`
  },
  {
    presetKey: "scholarship_app",
    label: "🎓 MahaDBT Government Scholarship",
    fileName: "MahaDBT_Renewal.jpg",
    fileType: "JPG Document",
    data: {
      title: "MahaDBT State Merit Scholarship Renewal & Verification",
      category: "Scholarship",
      actionRequired: "Upload previous semester marksheets, verified family income certificate (Tehsildar signed), and submit biometric attendance at Scholarship Desk.",
      dueDate: "2026-09-05",
      dueTime: "16:00",
      priority: "Medium",
      eligibility: "GPA > 8.0 in previous academic year & family annual income under INR 8 Lakhs.",
      notes: "Income certificate must be dated after April 2026."
    },
    rawOcrText: `GOVERNMENT OF MAHARASHTRA / MIT-WPU STUDENT AID CELL
MAHADBT SCHOLARSHIP SCHEME 2026

Attention Eligible Students:
Renewal applications for the State Merit & Post-Matric Scholarship Scheme for Academic Year 2025-2026 are now open.
Last Date for Document Verification on Campus: 5th September 2026.

MANDATORY DOCUMENTS REQUIRED:
- Domicile Certificate
- Previous Semester All Clear Marksheets (Original + 2 copies)
- Income Certificate issued by competent Tehsildar authority
Contact: Student Welfare Office, Ground Floor.`
  },
  {
    presetKey: "placement_drive",
    label: "🏢 TCS Campus Placement Drive",
    fileName: "TCS_Campus_Drive.pdf",
    fileType: "PDF Document",
    data: {
      title: "Tata Consultancy Services (TCS) National Qualifier Placement Drive",
      category: "Placement",
      actionRequired: "Register on TCS NextStep portal, enter CT/DT reference ID in university placement ERP, and select campus interview slot.",
      dueDate: "2026-08-25",
      dueTime: "18:00",
      priority: "High",
      eligibility: "B.Tech/MCA CSE/IT students with aggregate >= 65% or 6.5 CGPA with no active backlogs.",
      notes: "Mandatory dress code for online test: Formal college attire with identity card."
    },
    rawOcrText: `MIT-WPU TRAINING & PLACEMENT CELL
CAMPUS RECRUITMENT NOTICE - TATA CONSULTANCY SERVICES (TCS NQT 2026)

Eligibility Criteria:
- B.Tech CSE / IT / AI / DS (Graduating Class 2026)
- Minimum 65% aggregate throughout 10th, 12th, and Degree semesters.
- Max 1 year academic gap allowed.

Registration Steps:
1. Register on TCS NextStep Portal and generate your DT ID.
2. Complete test slot booking on university T&P portal by 25 August 2026, 6:00 PM.
T&P Officer: Dr. V. Deshpande`
  }
];

export const INITIAL_REMINDERS = [
  {
    id: "rem-101",
    noticeId: "not-001",
    title: "Semester End Exam Registration & Form Submission",
    channel: "Email & WhatsApp",
    triggerDate: "2026-08-26 • 09:00 AM",
    dueDate: "2026-08-28",
    priority: "High",
    status: "Active",
    offset: "2 days before"
  },
  {
    id: "rem-102",
    noticeId: "not-003",
    title: "MahaDBT State Merit Scholarship Renewal",
    channel: "Email Only",
    triggerDate: "2026-09-03 • 10:00 AM",
    dueDate: "2026-09-05",
    priority: "Medium",
    status: "Active",
    offset: "2 days before"
  },
  {
    id: "rem-103",
    noticeId: "not-004",
    title: "TCS National Qualifier Placement Drive Registration",
    channel: "Push & Email",
    triggerDate: "2026-08-24 • 12:00 PM",
    dueDate: "2026-08-25",
    priority: "High",
    status: "Active",
    offset: "1 day before"
  }
];

export const AUDIT_LOGS = [
  { id: "log-1", timestamp: "2026-08-22 14:32", action: "Notice Ingested", noticeTitle: "TCS NQT Placement Drive", status: "Success", confidence: "99.1%" },
  { id: "log-2", timestamp: "2026-08-22 11:15", action: "Conflict Detected", noticeTitle: "Exam Form vs Mini-Project", status: "Warning", confidence: "100%" },
  { id: "log-3", timestamp: "2026-08-21 16:40", action: "OCR Extracted", noticeTitle: "MahaDBT Scholarship Notice", status: "Success", confidence: "94.2%" },
  { id: "log-4", timestamp: "2026-08-20 18:20", action: "Deadline Completed", noticeTitle: "Tuition Fee Balance", status: "Completed", confidence: "N/A" }
];
