# Google Calendar and email imports

## Free first version

- Email ingestion imports saved `.eml` files. Users preview the message, choose its
  body or one PDF/PNG/JPG attachment, then review extracted fields before saving.
  No mailbox OAuth permission, receiving domain, paid email plan or polling worker is
  required. Gmail's message menu has **Download message**. Outlook `.msg` is not supported.
- Google Calendar uses an OAuth connection and a separate app-created **DeadlineAI**
  calendar. Nothing is copied on connection. Users explicitly share individual tasks.
  Shared tasks update after edits, completion, reminder changes or deletion in DeadlineAI.
  It is one-way sync; changes in Google do not update DeadlineAI.

## Google Cloud setup for the owner

1. Create or select a Google Cloud project under your account.
2. Enable **Google Calendar API** in APIs & Services → Library.
3. Configure Google Auth Platform / OAuth consent: application name **DeadlineAI**,
   your support/developer email, External audience when appropriate, and **Testing**.
   Add your Google account to **Test users**. Public rollout may require Google's
   OAuth verification. Testing grants may expire and require reconnecting.
4. Add scopes `openid`, `https://www.googleapis.com/auth/userinfo.email`, and
   `https://www.googleapis.com/auth/calendar.app.created`. Do not request Gmail or
   full-calendar access. Privacy information is at
   `https://deadlineai-frontend.onrender.com/privacy`.
5. Create an OAuth client of type **Web application**. Add this exact authorized
   redirect URI (including the trailing slash):
   `https://deadlineai-backend-ktuw.onrender.com/api/integrations/google/callback/`.
6. Save the client ID as `GOOGLE_CLIENT_ID` and secret as `GOOGLE_CLIENT_SECRET` in
   the existing Render **backend** environment. Never use VITE_ variables, commit
   downloaded credentials, or paste the secret into chat.
   Google only reveals the full secret when it is created. If you saved the JSON,
   use its `web.client_secret`; otherwise create a new secret in the OAuth client's
   details and copy it immediately into Render.
7. The backend also needs `GOOGLE_REDIRECT_URI` with the URI above and
   `GOOGLE_TOKEN_ENCRYPTION_KEY`, a stable Fernet key. Generate the latter once with
   `Fernet.generate_key()` and save it privately in Render. Do not regenerate on deploy:
   changing it makes existing connections unreadable and requires reconnecting.
8. Deploy, open **Integrations** in DeadlineAI, and click **Connect Google Calendar**.
   Complete Google consent yourself. The callback must finish in the same DeadlineAI
   account that started it. Connecting does not log you into DeadlineAI.
9. Open a synthetic task, click **Sync to Google Calendar**, and inspect the dedicated
   calendar. Verify edit/complete/delete behavior and remove the synthetic task afterward.

For local development, use your local frontend origin for FRONTEND_URL and register
`http://localhost:8000/api/integrations/google/callback/` as a separate redirect URI.

## Data and reliability

- Google tokens are encrypted server-side. OAuth uses PKCE, expiring one-use state,
  and an expiring completion ticket bound to the initiating DeadlineAI user. The
  completion ticket travels in a URL fragment and is removed before API finalization.
- The app reads the Google account identifier/email to label the connection and only
  accesses app-created calendars. It does not read a user's existing primary calendar.
- Shared fields are title, action, priority, deadline and task completion/reminder state.
  Raw notices, original files and eligibility details are not copied to Calendar.
- Timed deadlines are 15-minute events starting at the stated deadline in Asia/Kolkata.
  A missing time produces an all-day event, with Google's exclusive end date handled.
  If reminders are enabled, a popup is set one day before the event; the existing 9 AM
  in-app reminder remains independent.
- Stable event IDs prevent repeat sync from creating duplicate events. Provider failures
  leave retryable records without undoing task saves. Failed deletions remain visible
  in Integrations even after the local task is deleted. No paid worker is needed.
- Disconnecting purges the local connection and tokens; existing Google events remain.
  Users can revoke app permissions separately in Google Account settings. Reconnecting
  a different Google account starts a separate calendar without deleting previous events.
- Email preview does not call AI or store notices. Only the selected content is analyzed.
  HTML is converted to text without executing scripts or fetching remote images. The
  original selected source is stored privately once analyzed. Per-user email fingerprints
  prevent duplicate imports of the same body/attachment. Saving is still a human decision.
- Email limits: 10 MB including MIME encoding, 20 attachments, 100 MIME parts, English
  OCR and the existing five-page PDF limit. Private staged notices remain if review is
  abandoned; an administrator can remove them through the existing Django notice admin.

## Verification

`python manage.py test api --noinput` includes email-body/attachment imports, private
sources, deduplication, cross-account denial, OAuth owner binding/replay/expiry, encrypted
credentials, Calendar retry idempotency, deletion tombstones and all-day/timed events.
The unit suite mocks Google; it does not create live events or read real mail.
Real Google consent and event sync are not verified until the owner's OAuth client is configured.
