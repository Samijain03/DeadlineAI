export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const KEY = 'deadlineai.session.v2';
export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
export function saveSession(session) {
  if (session) localStorage.setItem(KEY, JSON.stringify(session));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('deadlineai-session'));
}
export async function accountRequest(path, body, token) {
  const response = await fetch(`${API_BASE_URL}/account/${path}/`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || data.detail || Object.values(data).flat().join(' ') || 'Unable to complete this request.');
    error.status = response.status;
    throw error;
  }
  return data;
}
let refreshing;
export async function accessToken(forceRefresh = false) {
  const session = getSession();
  if (!session) throw new Error('Please sign in again.');
  let expires = 0;
  try { expires = JSON.parse(atob(session.access_token.split('.')[1])).exp * 1000; } catch { /* Refresh invalid or expired tokens. */ }
  if (!forceRefresh && expires > Date.now() + 30000) return session.access_token;
  if (!refreshing) refreshing = accountRequest('refresh', { refresh_token: session.refresh_token })
    .then(tokens => {
      if (getSession()?.refresh_token !== session.refresh_token) throw new Error('Session changed. Please sign in again.');
      saveSession({ ...session, ...tokens });
      return tokens.access_token;
    }).catch(error => { if ([400,401,403].includes(error.status) && getSession()?.refresh_token === session.refresh_token) saveSession(null); throw error; })
    .finally(() => { refreshing = null; });
  return refreshing;
}
