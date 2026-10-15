import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/apiClient';
import { CalendarDays, Mail, LoaderCircle } from 'lucide-react';
import './integrations.css';

const completions = new Map();
function completeConnection(ticket) {
  if (!completions.has(ticket)) completions.set(ticket,
    apiFetch('/integrations/google/complete/', { method: 'POST', body: JSON.stringify({ ticket }) }));
  return completions.get(ticket);
}

export default function Integrations({ onReview }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [callback] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const ticket = callback.get('google_oauth');
        if (ticket || callback.has('google_error')) window.history.replaceState({}, '', window.location.pathname + window.location.search);
        if (ticket) {
          try {
            await completeConnection(ticket);
            if (active && version === 0) setMessage('Google Calendar connected. Choose a task to share; nothing is copied automatically.');
          } catch (err) { if (active) setError(err.message); }
        } else if (callback.has('google_error') && active) setError('Google connection was not completed. You can try again.');
        const result = await apiFetch('/integrations/calendar/');
        if (active) setStatus(result);
      } catch (err) { if (active) setError(err.message); }
    };
    load();
    return () => { active = false; };
  }, [callback, version]);
  const mutate = async (path, method = 'POST') => {
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await apiFetch(path, { method });
      if (result?.authorization_url) { window.location.assign(result.authorization_url); return; }
      setVersion(value => value + 1);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <section className="integrations-page"><div className="page-heading"><div><p className="eyebrow">A CONNECTED WORKSPACE</p><h1>Bring your deadlines together.</h1><p>Choose what to import and what to share.</p></div></div>
    {error && <p className="error-banner" role="alert">{error}</p>}{message && <p role="status" className="info-banner">{message}</p>}
    <section className="detail-card integration-card"><CalendarDays size={27} /><h2>Google Calendar</h2>
      <p>Share selected tasks to a separate DeadlineAI calendar. Shared tasks update when you edit or complete them; deleting a shared task removes its event. Changes made in Google do not change DeadlineAI.</p>
      {!status ? <button className="text-button" onClick={() => setVersion(value => value + 1)}>Retry loading Calendar status</button> : <>
        {status.connected ? <><p><strong>Connected:</strong> {status.account_email}</p><p className="integration-note">Disconnecting stops sync and removes saved credentials here. Events already in Google remain. You can also remove access in your Google Account settings.</p><button className="button secondary" disabled={busy || !status.configured} onClick={() => mutate('/integrations/google/connect/')}>Reconnect Calendar</button><button className="button secondary" disabled={busy} onClick={() => { if (window.confirm('Disconnect Google Calendar? Existing Google events will remain.')) mutate('/integrations/google/disconnect/'); }}>Disconnect Calendar</button></> : <>
          <p className="integration-note">Only the app-created calendar is accessible. Connecting does not copy any existing tasks.</p>
          <button className="button" disabled={busy || !status.configured} onClick={() => mutate('/integrations/google/connect/')}>{busy ? 'Connecting…' : 'Connect Google Calendar'}</button>
          {!status.configured && <p role="status">Calendar connection is being configured by the administrator. Email imports already work below.</p>}
        </>}
        {!!status.links.length && <div className="integration-links"><h3>Shared tasks</h3>{status.links.map(link => <div className="integration-link" key={link.id}><div><strong>{link.title}</strong><p>{link.state === 'synced' ? 'Synced' : link.state === 'removal_pending' ? 'Removal pending' : 'Sync needs attention'}</p>{link.last_error && <small>{link.last_error}</small>}</div>{link.state !== 'synced' && <button className="button secondary" disabled={busy} onClick={() => mutate(`/integrations/calendar/links/${link.id}/`)}>Retry</button>}{link.event_url && <a href={link.event_url} target="_blank" rel="noreferrer">View event</a>}</div>)}</div>}
      </>}
    </section>
    <EmailImport onReview={onReview} />
  </section>;
}

function EmailImport({ onReview }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [part, setPart] = useState('body');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);
  const choose = async value => {
    if (!value) return;
    setError(''); setPreview(null); setFile(null);
    if (!value.name.toLowerCase().endsWith('.eml') || value.size > 10 * 1024 * 1024) { setError('Choose an .eml email file of up to 10 MB.'); return; }
    setBusy(true);
    try {
      const payload = new FormData(); payload.append('file', value);
      const result = await apiFetch('/integrations/email/preview/', { method: 'POST', body: payload });
      setFile(value); setPreview(result);
      setPart(result.body_available ? 'body' : String(result.attachments.find(item => item.supported)?.index ?? 'body'));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const analyze = async () => {
    setBusy(true); setError('');
    try {
      const payload = new FormData(); payload.append('file', file); payload.append('part', part);
      const result = await apiFetch('/integrations/email/analyze/', { method: 'POST', body: payload });
      await onReview(result);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <section className="detail-card integration-card"><Mail size={27} /><h2>Import an email</h2>
    <p>Save an email as an <strong>.eml</strong> file, then choose its body or one attachment. Gmail: open the email, use the message’s three-dot menu, then “Download message”. No mailbox connection is needed.</p>
    <p className="integration-note">Previewing does not create a task. Only the content you select is sent for analysis, and you review it before saving. This does not monitor incoming mail.</p>
    <input ref={input} type="file" accept=".eml,message/rfc822" disabled={busy} hidden onChange={event => { choose(event.target.files?.[0]); event.target.value = ''; }} />
    <button className="button secondary" disabled={busy} onClick={() => input.current?.click()}>{busy ? <><LoaderCircle className="spin" size={17} /> Reading email…</> : file ? 'Choose another email' : 'Choose email file'}</button>
    {error && <p className="error-banner" role="alert">{error}</p>}
    {preview && <div className="email-preview"><h3>{preview.subject}</h3><p>From: {preview.sender || 'Not specified'}<br />{preview.date}</p>
      {preview.body_excerpt && <details><summary>Preview email text</summary><pre>{preview.body_excerpt}</pre></details>}
      <fieldset disabled={busy}><legend>What should we analyze?</legend>{preview.body_available && <label><input type="radio" name="email-part" value="body" checked={part === 'body'} onChange={() => setPart('body')} /> Email body</label>}
        {preview.attachments.map(item => <label key={item.index}><input type="radio" name="email-part" checked={part === String(item.index)} disabled={!item.supported} onChange={() => setPart(String(item.index))} /> {item.filename} · {Math.ceil(item.size / 1024)} KB{!item.supported && ' · unsupported format'}</label>)}
      </fieldset><button className="button" disabled={busy || (!preview.body_available && !preview.attachments.some(item => item.supported))} onClick={analyze}>{busy ? 'Finding the important details…' : 'Analyze & review'}</button>
    </div>}
  </section>;
}

export function CalendarTaskSync({ task, onConnect }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    apiFetch('/integrations/calendar/').then(result => { if (active) setStatus(result); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [task, version]);
  const link = status?.links.find(item => String(item.deadline_id) === task.id);
  const share = async remove => {
    setBusy(true); setError('');
    try {
      await apiFetch(remove ? `/integrations/calendar/links/${link.id}/` : `/integrations/calendar/tasks/${task.id}/sync/`, { method: remove ? 'DELETE' : 'POST' });
      setVersion(value => value + 1);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <section className="calendar-share"><h3>Google Calendar</h3>
    <p>Share this title, action and deadline to your DeadlineAI calendar. Timed deadlines appear as 15-minute events starting at the due time; dates without a time are all-day events.</p>
    {error && <p role="alert">{error}</p>}
    {!status ? <button className="text-button" onClick={() => setVersion(value => value + 1)}>Load Calendar status</button> : !status.connected ? <button className="button secondary" onClick={onConnect}>Set up Google Calendar</button> : <>
      {link && <p role="status">{link.state === 'synced' ? 'Synced to Google Calendar.' : link.last_error || 'Sync pending. Retry to finish.'}</p>}
      <div className="integration-actions"><button className="button secondary" disabled={busy} onClick={() => share(link?.state === 'removal_pending')}>{busy ? 'Syncing…' : link?.state === 'removal_pending' ? 'Retry removal' : link ? 'Sync latest details' : 'Sync to Google Calendar'}</button>
      {link && <button className="text-button" disabled={busy} onClick={() => { if (window.confirm('Remove this event from Google Calendar? Your DeadlineAI task stays here.')) share(true); }}>Remove from Google Calendar</button>}
      {link?.event_url && <a href={link.event_url} target="_blank" rel="noreferrer">View in Google Calendar</a>}</div>
      <button className="text-button" onClick={onConnect}>Manage Calendar connection</button><small>Shared tasks update automatically when edited here. A Google popup reminder is set one day before the event when this task’s reminder is enabled.</small>
    </>}
  </section>;
}
