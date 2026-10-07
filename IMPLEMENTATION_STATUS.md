# Synopsis completion audit

Source: DeadlineAI_Synopsis.pdf (14 pages), reviewed 7 October 2026.

## Required web application

- [ ] Secure authentication and password recovery; isolate each user's records.
- [ ] PDF and image upload validation, real OCR, private original-document storage.
- [ ] Grounded extraction: dates, action, category, eligibility, priority; no fabricated fallback content.
- [ ] Human review before saving; persist notice, extraction and deadline together.
- [ ] Edit/delete deadlines; Upcoming, Completed and Missed states.
- [ ] Search and category/date/priority/status filters.
- [ ] Calendar and deadline conflicts; priority visibility.
- [ ] Reminder scheduling and in-app delivery; external delivery configuration documented.
- [ ] Administrator user/category/activity/statistics management.
- [ ] Automated regression tests, production build and deployment verification.

## Explicit future scope in the synopsis

WhatsApp/email/college-portal ingestion, Google Calendar synchronization, multilingual notices,
native mobile app, voice assistant, classroom boards, duplicate/update detection, personalized
eligibility and source-grounded Q&A. These are expansion items, not promises of existing functionality.

## Audit findings

Existing code invented document text after OCR failure, used a fixed fallback deadline, had no
image OCR runtime, claimed reminder scheduling without delivery, hid API failures as empty lists,
and linked accounts using user-editable PRNs. The redesigned UI omitted several existing API features.
The previous timeout fix was deployed but authenticated upload was not verified end to end.
