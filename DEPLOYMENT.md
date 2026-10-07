# Running DeadlineAI

## Production

Frontend: https://deadlineai-frontend.onrender.com
API: https://deadlineai-backend-ktuw.onrender.com/api

The backend Dockerfile installs Tesseract and its English model. Render must use the
Docker runtime, root directory `backend`, Dockerfile `./Dockerfile`, and the image's
default start command. It applies Django migrations at startup and starts Gunicorn.
Keep the existing DATABASE_URL, SECRET_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY,
GEMINI_API_KEY, CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS environment variables.
The free instance may sleep; the app reports connection errors with a retry option.

Original uploads (maximum 10 MB, 5 PDF pages) are stored privately in PostgreSQL;
only the owning user can download them through Django. This intentionally avoids
ephemeral Render media storage. For larger usage, migrate binary storage to a private
object-storage bucket. Uploaded documents are staged until the user confirms a task.

Reminders are **in-app**: one day before the deadline at 09:00 Asia/Kolkata. The app
checks each minute while open and on the next visit. Completed tasks pause reminders.
Email, WhatsApp, background push and ingestion integrations are not enabled.

## Administrator access

An operator assigns `app_metadata.role = admin` (or coordinator) through trusted
Supabase administration. Never use user-editable metadata to assign permissions.
The administration page manages categories, user access, activity and statistics.
Disabling a user in Django prevents subsequent authenticated API requests, even if
the browser still holds a Supabase session. Django's `/admin/` additionally supports
full operator management; create a superuser through `manage.py createsuperuser`.
Production builds no longer seed sample users or known passwords.

## Local development and checks

Install Python requirements in a virtual environment and install Tesseract on PATH.
Run `python manage.py migrate`, then `python manage.py runserver` inside backend.
Run `npm ci` and `npm run dev` inside frontend. Set local environment variables using
the `.env.example` files; never commit secrets. `DATABASE_URL` can be omitted for SQLite.

Backend checks: `python manage.py test api --noinput`.
Frontend: `npm run build`; lint the active `src/redesign`, `src/auth`, `src/services`
modules. The old frontend files remain in the repository but are not shipped by main.jsx.

## Acceptance workflow

Sign in, upload a clear synthetic PNG or text/scanned PDF, compare extracted fields,
correct the deadline, save with reminder, reload, download the original, edit the task,
filter it by category/date/priority, complete/reopen it, then delete the test task.
Verify a second user cannot read the task or original file. Password reset must be
completed by the account owner using the email link.
