# Synopsis completion audit

Source: DeadlineAI_Synopsis.pdf (14 pages), reviewed 7 October 2026.

## Implemented required web application

- [x] Account registration, login, refresh, logout and user record isolation.
- [x] PDF/image validation, real OCR and private original-document storage.
- [x] Extraction of dates, action, category, eligibility and priority; no invented fallback content.
- [x] Human review before saving; persist notice, extraction and deadline together.
- [x] Edit/delete deadlines; Upcoming, Completed and Missed states.
- [x] Search and category/date/priority/status filters.
- [x] Calendar, deadline conflicts and priority visibility.
- [x] Reminder scheduling and in-app delivery.
- [x] Administrator user/category/activity/statistics management.
- [x] Regression tests and production frontend build.
- [ ] Configure production password-reset email delivery (reset token workflow is tested).
- [x] Live registration, OCR upload, task save/reload/edit/delete, private download, logout and revoked refresh checks.

## Deployment and data

Neon PostgreSQL replaces the paused Supabase database. Django replaces Supabase Auth.
Both Render services deployed commit 363ff7d successfully. Production account registration
and authenticated profile retrieval passed. The first live image upload hit the previous
OCR limit; commit f8c3f7c raises the bounded processing allowance for shared CPUs.
The same full synthetic notice then passed live OCR, extraction and task persistence.
The test task and original were deleted after verification. Synthetic test accounts
remain isolated from real users and do not send email.

The new database starts fresh. Old Supabase accounts and records remain untouched in the
paused project; migration requires access to that project or a backup. Existing users
must register again. No unrelated Supabase projects were paused.

## Explicit future scope

WhatsApp/email/college-portal ingestion, Google Calendar synchronization, multilingual
notices, native mobile app, voice assistant, classroom boards, duplicate/update detection
and personalized eligibility remain expansion items. Existing Q&A only looks up relevant
source sentences and does not invent answers.

## Practical limits

Uploads: 10 MB, five PDF pages, English OCR. Reminders arrive while the app is open or
on the next visit; external email/WhatsApp/push reminders are not enabled. Original files
are private database bytes, so storage usage grows with uploads. Authentication tests cover
registration validation, duplicate PRNs, token rotation, logout, disabled accounts and
single-use password resets; production reset email still requires a configured sender.

