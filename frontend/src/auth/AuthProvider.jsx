import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import { accessToken, accountRequest, getSession, saveSession } from './session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSession);
  const [loading, setLoading] = useState(!!getSession());
  const [recovering, setRecovering] = useState(new URLSearchParams(window.location.search).has('reset-password'));
  useEffect(() => {
    let mounted = true;
    const changed = () => setSession(getSession());
    window.addEventListener('deadlineai-session', changed);
    window.addEventListener('storage', changed);
    if (getSession()) accessToken().then(token => accountRequest('me', null, token)).then(user => {
      const current = getSession();
      if (mounted && current && current.user.id === user.id) saveSession({ ...current, user });
    }).catch(error => { if (error.status === 401) saveSession(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; window.removeEventListener('deadlineai-session', changed); window.removeEventListener('storage', changed); };
  }, []);
  const value = useMemo(() => {
    const attempt = async callback => { try { return { data: await callback(), error: null }; } catch (error) { return { data: null, error }; } };
    const authenticate = (path, details) => attempt(async () => {
      const data = await accountRequest(path, details);
      saveSession(data.session);
      return data;
    });
    return {
      configured: true, loading, recovering, session, user: session?.user || null,
      signIn: (email, password) => authenticate('login', { email, password }),
      signUp: details => authenticate('register', details),
      signOut: async () => { const current = getSession(); saveSession(null); if (current) await accountRequest('logout', { refresh_token: current.refresh_token }).catch(() => {}); },
      resetPassword: email => attempt(() => accountRequest('forgot-password', { email })),
      updatePassword: password => attempt(async () => {
        const query = new URLSearchParams(window.location.search);
        const data = await accountRequest('reset-password', { uid: query.get('uid'), token: query.get('token'), password });
        saveSession(null); setRecovering(false); window.history.replaceState({}, '', window.location.pathname);
        return data;
      }),
    };
  }, [loading, session, recovering]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
