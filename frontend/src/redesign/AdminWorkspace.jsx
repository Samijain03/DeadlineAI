import { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';

export default function AdminWorkspace() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const load = async () => {
    try {
      const [summary, users, categories, logs] = await Promise.all(['/admin-summary/', '/admin-users/', '/categories/', '/audit-logs/'].map(path=>apiFetch(path)));
      setData({summary,users,categories,logs});
    } catch (err) { setError(err.message); }
  };
  useEffect(()=>{
    let active = true;
    Promise.all(['/admin-summary/', '/admin-users/', '/categories/', '/audit-logs/'].map(path=>apiFetch(path))).then(([summary,users,categories,logs])=>{if(active)setData({summary,users,categories,logs});}).catch(err=>{if(active)setError(err.message);});
    return ()=>{active=false;};
  },[]);
  const change = async (path, options) => {setError('');try{await apiFetch(path,options);await load();}catch(err){setError(err.message);}};
  return <section><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Keep the workspace running.</h1></div></div>{error && <p role="alert" className="error-banner">{error}</p>}{!data ? <p>Loading administration…</p> : <><div className="admin-summary">{Object.entries(data.summary).map(([key,value])=><article className="detail-card" key={key}><strong>{value}</strong><p>{key}</p></article>)}</div><section className="detail-card"><h2>Users</h2>{data.users.map(user=><div className="admin-row" key={user.id}><span><strong>{user.first_name || user.username}</strong><br/>{user.email}</span><button className="button secondary" onClick={()=>change(`/admin-users/${user.id}/set-active/`,{method:'POST',body:JSON.stringify({is_active:!user.is_active})})}>{user.is_active?'Disable access':'Restore access'}</button></div>)}</section><section className="detail-card"><h2>Notice categories</h2><form onSubmit={async e=>{e.preventDefault();await change('/categories/',{method:'POST',body:JSON.stringify({name:name.trim()})});setName('');}}><label>New category<input required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label><button className="button">Add category</button></form>{data.categories.map(category=><div className="admin-row" key={category.id}><span>{category.name}</span><button className="text-button" onClick={()=>{if(window.confirm(`Delete category “${category.name}”? Existing tasks keep their category.`))change(`/categories/${category.id}/`,{method:'DELETE'});}}>Delete category</button></div>)}</section><section className="detail-card"><h2>Recent activity</h2>{data.logs.slice(0,50).map(log=><p key={log.id}>{new Date(log.timestamp).toLocaleString()} · {log.action} · {log.notice_title} · {log.status}</p>)}{!data.logs.length && <p>No activity recorded yet.</p>}</section></>}</section>;
}
