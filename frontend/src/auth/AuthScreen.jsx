import { useState } from 'react';
import { ArrowRight, Check, KeyRound, Leaf, LoaderCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from './authContext';

const departments = [
  'School of Computer Science & Applications',
  'Department of AI & Data Science',
  'Department of Electronics Engineering',
  'Other',
];

export default function AuthScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '', name: '', studentPrn: '', department: departments[0] });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (field, value) => setForm(current => ({ ...current, [field]: value }));
  const switchMode = next => { setMode(next); setError(''); setMessage(''); };

  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'forgot') {
        const { error: requestError } = await auth.resetPassword(form.email);
        if (requestError) throw requestError;
        setMessage('Check your email for a secure password-reset link.');
      } else if (mode === 'signup') {
        const { data, error: requestError } = await auth.signUp(form);
        if (requestError) throw requestError;
        if (!data.session) setMessage('Account created. Check your inbox to confirm your email, then sign in.');
      } else {
        const { error: requestError } = await auth.signIn(form.email, form.password);
        if (requestError) throw requestError;
      }
    } catch (requestError) {
      setError(requestError.message || 'We could not complete that request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!auth.configured) return <main className="auth-shell"><section className="auth-card auth-setup"><span className="auth-mark"><Leaf /></span><p className="eyebrow">SUPABASE SETUP NEEDED</p><h1>Connect your workspace.</h1><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to <code>frontend/.env</code>, then restart the frontend.</p><div className="auth-note"><Lock size={17} /><span>Use the publishable key in the browser. Keep the service-role key on the Django server.</span></div></section></main>;

  return <main className="auth-shell"><section className="auth-card"><div className="auth-brand"><span className="auth-mark"><Leaf size={24} /></span><strong>Deadline<span>AI</span></strong></div><p className="eyebrow">A LITTLE MORE HEADSPACE</p><h1>{mode === 'signup' ? 'Create your student workspace.' : mode === 'forgot' ? 'Reset your password.' : 'Welcome back.'}</h1><p className="auth-intro">{mode === 'signup' ? 'Keep every notice, deadline and reminder in one private place.' : mode === 'forgot' ? 'We’ll send a secure reset link to your email.' : 'Sign in to see what needs your attention.'}</p><form onSubmit={submit} className="auth-form">{mode === 'signup' && <><label>Full name<input value={form.name} onChange={e => update('name', e.target.value)} autoComplete="name" required /></label><div className="auth-field-row"><label>Student PRN<input value={form.studentPrn} onChange={e => update('studentPrn', e.target.value)} required /></label><label>Department<select value={form.department} onChange={e => update('department', e.target.value)}>{departments.map(item => <option key={item}>{item}</option>)}</select></label></div></>}<label>Email address<span className="auth-input"><Mail size={17} /><input type="email" value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" required /></span></label>{mode !== 'forgot' && <label>Password<span className="auth-input"><KeyRound size={17} /><input type="password" value={form.password} onChange={e => update('password', e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required /></span></label>}{error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="auth-success" role="status"><Check size={17} />{message}</div>}<button className="button auth-submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Please wait…</> : <>{mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'} <ArrowRight size={17} /></>}</button></form><div className="auth-links">{mode === 'signin' && <><button onClick={() => switchMode('forgot')}>Forgot password?</button><span /> <button onClick={() => switchMode('signup')}>Create an account</button></>}{mode !== 'signin' && <button onClick={() => switchMode('signin')}>Back to sign in</button>}</div><div className="auth-note"><Lock size={16} /><span>Your account and session are protected by Supabase Auth.</span></div></section></main>;
}
