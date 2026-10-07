import { useState } from 'react';
import { useAuth } from './authContext';

export default function ResetPassword() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      const result = await auth.updatePassword(password);
      if (result.error) throw result.error;
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="auth-shell"><section className="auth-card"><h1>Choose a new password.</h1><p>Use at least 8 characters.</p><form className="auth-form" onSubmit={submit}><label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error && <p role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button></form></section></main>;
}
