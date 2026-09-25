# DeadlineAI Supabase setup

## 1. Create the project

Create a Supabase project, then copy its project URL and publishable key from the Connect/API settings. Never place the service-role key in the frontend.

## 2. Configure authentication

In Supabase Auth, enable Email and Password. Set the Site URL to the deployed frontend URL and add these redirect URLs for development:

- `http://localhost:5173/**`
- `http://127.0.0.1:5173/**`

Email confirmation can remain enabled. The implemented flow handles confirmation, persistent sessions, refresh tokens, sign-out, and password-reset emails.

## 3. Configure Django and PostgreSQL

Copy `backend/.env.example` to `backend/.env`. Use the Supabase Postgres connection string as `DATABASE_URL`. A persistent Django server can use the direct connection when IPv6 is available; otherwise use the session pooler. Keep `sslmode=require`.

Run:

```powershell
cd backend
python manage.py migrate
python manage.py runserver
```

Django owns the application tables and validates every Supabase access token. Every notice, deadline, reminder, conflict result, and analytics result is filtered by the authenticated Django user mapped from the Supabase user ID.

## 4. Configure React

Copy `frontend/.env.example` to `frontend/.env`, fill in the project URL and publishable key, and restart Vite:

```powershell
cd frontend
npm run dev
```

## 5. Production checks

- Replace the Django secret key.
- Set `DEBUG=False`.
- Set the exact production frontend in `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.
- Keep the Supabase service-role key only in the backend deployment environment.
- Run migrations against the Supabase database before starting the production server.
