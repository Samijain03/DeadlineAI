import { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';

const paths = ['/admin-summary/', '/admin-users/', '/categories/', '/audit-logs/'];
const fetchWorkspace = async () => {
  const [summary, users, categories, logs] = await Promise.all(paths.map(path => apiFetch(path)));
  return { summary, users, categories, logs };
};

export default function AdminWorkspace({ onCategoriesChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    fetchWorkspace().then(result => { if (active) { setData(result); setError(''); } })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [retry]);
  const change = async (path, options) => {
    if (busy) return false;
    setBusy(true); setError('');
    try {
      await apiFetch(path, options);
      if (path.startsWith('/categories/')) onCategoriesChanged?.();
      setData(await fetchWorkspace());
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setBusy(false); }
  };
  return <section aria-busy={busy}>
    <div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Keep the workspace running.</h1></div></div>
    {error && <div role="alert" className="error-banner"><span>{error}</span><button className="text-button" onClick={() => setRetry(value => value + 1)}>Retry loading</button></div>}
    {!data ? <p>{error ? 'Administration could not be loaded.' : 'Loading administration…'}</p> : <>
      <div className="admin-summary">{Object.entries(data.summary).map(([key, value]) => <article className="detail-card" key={key}><strong>{value}</strong><p>{key}</p></article>)}</div>
      <section className="detail-card"><h2>Users</h2>{data.users.map(user => <div className="admin-row" key={user.id}>
        <span><strong>{user.first_name || user.username}</strong><br />{user.email}</span>
        {user.is_staff ? <span>Administrator</span> : <button className="button secondary" disabled={busy} onClick={() => change(`/admin-users/${user.id}/set-active/`, { method: 'POST', body: JSON.stringify({ is_active: !user.is_active }) })}>{user.is_active ? 'Disable access' : 'Restore access'}</button>}
      </div>)}</section>
      <section className="detail-card"><h2>Notice categories</h2><p>Available in student forms and filters. Existing tasks keep their category when a category is deleted.</p>
        <form onSubmit={async event => { event.preventDefault(); if (await change('/categories/', { method: 'POST', body: JSON.stringify({ name: name.trim() }) })) setName(''); }}>
          <label>New category<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label><button className="button" disabled={busy || !name.trim()}>Add category</button>
        </form>
        {data.categories.map(category => <div className="admin-row" key={category.id}><span>{category.name}</span><button className="text-button" disabled={busy} onClick={() => { if (window.confirm(`Delete category “${category.name}”? Existing tasks keep their category.`)) change(`/categories/${category.id}/`, { method: 'DELETE' }); }}>Delete category</button></div>)}
      </section>
      <section className="detail-card"><h2>Recent activity</h2>{data.logs.slice(0, 50).map(log => <p key={log.id}>{new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} · {log.action} · {log.notice_title} · {log.status}</p>)}{!data.logs.length && <p>No activity recorded yet.</p>}</section>
    </>}
  </section>;
}
