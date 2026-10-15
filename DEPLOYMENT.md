# Running DeadlineAI

## Production

Frontend: https://deadlineai-frontend.onrender.com
API: https://deadlineai-backend-ktuw.onrender.com/api

The public homepage is `/`. Registration is `/signup`, sign-in is `/login`, and the
private workspace is `/app`. Signed-out workspace visits lead to sign-in; signing in
opens the workspace. The logo and “Meet DeadlineAI” return to the public homepage.
Password-reset links take precedence over the homepage, and the completed reset
returns to sign-in. The build emits matching directory entry pages for these routes,
so direct visits and refreshes work even without a dashboard SPA rewrite. The Blueprint
also declares the usual index.html rewrite for future routes.

The backend Dockerfile installs Tesseract and its English model. Render must use the
Docker runtime, root directory `backend`, Dockerfile `./Dockerfile`, and the image's
default start command. It applies Django migrations at startup and starts Gunicorn.
Set DATABASE_URL to the private Neon PostgreSQL connection string with SSL required.
Keep SECRET_KEY, GEMINI_API_KEY, CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS.
Set FRONTEND_URL to the deployed frontend origin. Supabase is no longer required.
The free instance may sleep; the app reports connection errors with a retry option.

Original uploads (maximum 10 MB, 5 PDF pages) are stored privately in PostgreSQL;
only the owning user can download them through Django. This intentionally avoids
ephemeral Render media storage. For larger usage, migrate binary storage to a private
object-storage bucket. Uploaded documents are staged until the user confirms a task.

Reminders are **in-app**: one day before the deadline at 09:00 Asia/Kolkata. The app
checks each minute while open and on the next visit. Completed tasks pause reminders.
Email, WhatsApp, background push and ingestion integrations are not enabled.

## Administrator access

An operator grants Django `is_staff` through trusted server administration.
Registration always creates a student; client metadata cannot grant permissions.
The administration page manages categories, user access, activity and statistics.
Disabling a user in Django prevents subsequent authenticated API requests, even if
the browser still holds an access token. Django's `/admin/` additionally supports
full operator management; create a superuser through `manage.py createsuperuser`.
Production builds no longer seed sample users or known passwords.

## Authentication and migration

Django owns registration, login, password hashing and account permissions. Access
tokens last 15 minutes; refresh tokens rotate and are revoked on logout. Password
changes invalidate old access tokens. Browser credentials use a new storage namespace;
old Supabase sessions are not treated as native accounts.

This is a fresh Neon database. Old Supabase users and records remain in the paused
project and cannot be migrated until it or a backup becomes accessible. Existing
users must register again in the new database.

Password-reset tokens expire after one hour and are single-use. Configure a working
email backend and sender before claiming reset emails are operational. The API returns
an explicit unavailable error when no SMTP sender is configured. Render may restrict
outbound SMTP on free services; use a production HTTP email backend or an eligible
service plan. Never use the console email backend in production (it logs reset links).

### Resend sender setup on the existing Render backend

1. Sign up at https://resend.com/signup and verify your account email.
2. Add a domain you own at https://resend.com/domains and publish the DNS records
   Resend provides. Wait until the sender domain is verified. A subdomain dedicated
   to app email is suitable; the application itself can stay on onrender.com.
3. Create a sending-only API key scoped to that domain. Save it directly in Render's
   backend environment as `RESEND_API_KEY`; never put it in chat, Git or frontend env.
4. Set `EMAIL_BACKEND=api.email_backend.ResendEmailBackend` and
   `DEFAULT_FROM_EMAIL=DeadlineAI <notices@YOUR_VERIFIED_DOMAIN>`.
   `FRONTEND_URL` must remain the deployed frontend origin.
5. Redeploy, request a reset for your own DeadlineAI account, open the email while
   signed out, choose a new password, then verify sign-in and reset-link single use.

Without an owned domain, `onboarding@resend.dev` is limited to tests addressed to the
Resend account owner's email. It is not a production sender for arbitrary students.
The owner confirmed a successful reset using this test sender on 15 October 2026.
The Render-provided onrender.com domain cannot be verified because its DNS is not yours.
No real email is sent by the automated regression suite.

## Local development and checks

Install Python requirements in a virtual environment and install Tesseract on PATH.
Run `python manage.py migrate`, then `python manage.py runserver` inside backend.
Run `npm ci` and `npm run dev` inside frontend. Set local environment variables using
the `.env.example` files; never commit secrets. `DATABASE_URL` can be omitted for SQLite.

Backend checks: `python manage.py test api --noinput`.
Authentication screen regressions: `npm run test:auth` inside frontend.
Frontend: `npm run build`; lint the active `src/redesign`, `src/auth`, `src/services`
modules. The old frontend files remain in the repository but are not shipped by main.jsx.

## Acceptance workflow

Sign in, upload a clear synthetic PNG or text/scanned PDF, compare extracted fields,
correct the deadline, save with reminder, reload, download the original, edit the task,
filter it by category/date/priority, complete/reopen it, then delete the test task.
Verify a second user cannot read the task or original file. Password reset must be
completed by the account owner using the email link.

## Google Calendar and email imports

See GOOGLE_INTEGRATIONS.md for the free email-import workflow, Google OAuth setup,
server-only environment variables, privacy information and live acceptance steps.
The OAuth client must enable Google Calendar API and use the exact backend callback URL.
