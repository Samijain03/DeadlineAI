import { navigateTo } from '../lib/navigation';

export default function PrivacyPage() {
  return <main className="auth-shell"><article className="auth-card" style={{ maxWidth: 760 }}><p className="eyebrow">YOUR DATA & CONNECTIONS</p><h1>What DeadlineAI uses.</h1>
    <h2>Your workspace</h2><p>DeadlineAI stores your account, uploaded notices, extracted text, reviewed tasks and reminders so you can access them across devices. Original files are available through authenticated, owner-scoped downloads. Administrators manage user access and can monitor system activity.</p>
    <h2>Email imports</h2><p>You choose an .eml file and select the email body or one attachment. Previewing does not create a task. Analysis sends the selected notice text to the configured AI provider, then asks you to review the result. DeadlineAI does not request Gmail mailbox access or monitor incoming email.</p>
    <h2>Google Calendar</h2><p>Connecting uses your verified Google account identifier and email to label the connection. Google access and refresh tokens are encrypted on the server and are not sent to the AI provider or browser. The requested Calendar permission is limited to calendars created by this app.</p>
    <p>Nothing is copied just by connecting. When you share a task, its title, action, priority and deadline are sent to a dedicated DeadlineAI calendar. Changes made here update shared events; changes made in Google do not update DeadlineAI. A failed update remains available to retry.</p>
    <h2>Removing data or access</h2><p>Deleting a task removes its local record, reminders and linked original when no other tasks use that original. For a shared task, DeadlineAI also attempts to remove the Google event; failed removals remain retryable in Integrations. Disconnecting Calendar deletes locally saved Google credentials and stops syncing, but leaves events already in Google. You can remove those events in Google Calendar and revoke the app in your Google Account permissions.</p>
    <p>Uploaded email content that has been analyzed but not yet saved remains a private staged notice. Contact the DeadlineAI administrator for account-level data removal or questions about the configured storage and AI provider.</p>
    <button className="button secondary" onClick={() => navigateTo('/')}>Back to home</button>
  </article></main>;
}
