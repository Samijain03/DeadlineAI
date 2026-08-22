import React, { useState } from 'react';
import { Settings2, Plus, Tag, ShieldCheck, Database, Cpu, Activity, Trash2 } from 'lucide-react';
import { AUDIT_LOGS } from '../services/mockData';

export default function AdminPortal({ categoryList, onAddCategory, onNotify }) {
  const [newCatInput, setNewCatInput] = useState("");
  const [logs, setLogs] = useState(AUDIT_LOGS);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      onAddCategory(newCatInput.trim());
      if (onNotify) onNotify("Category Added", `"${newCatInput.trim()}" added to global notice taxonomy.`, "success");
      setNewCatInput("");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold mb-1">
          <Settings2 className="w-4 h-4" />
          <span>SYSTEM ADMINISTRATION CONSOLE</span>
        </div>
        <h1 className="text-2xl font-black text-zinc-100 uppercase tracking-wide">
          Administrator & Taxonomy Portal
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          University department taxonomy management, AI extraction accuracy metrics, and ingestion audit log.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Registered Students</p>
          <p className="text-3xl font-black text-zinc-100 font-mono mt-1">1,248</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-1">● 94 active today</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Notices OCR Processed</p>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">4,892</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">PDF & Image files</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Extraction Accuracy</p>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">98.4%</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">Gemini AI Engine</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Celery Task Queue</p>
          <p className="text-3xl font-black text-cyan-400 font-mono mt-1">0 Lag</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-1">Redis Broker Healthy</p>
        </div>
      </div>

      {/* Taxonomy Manager */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="border-b border-zinc-800/80 pb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-100 flex items-center space-x-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Notice Taxonomy & Category Manager</span>
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Configure global category tags used for automatic notice classification across all departments.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 max-w-lg">
          <input 
            type="text"
            placeholder="Enter new notice category (e.g. Sports, Hostels, Library)..."
            value={newCatInput}
            onChange={e => setNewCatInput(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-100 flex-1 focus:outline-none focus:border-amber-500"
            required
          />
          <button 
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-md shrink-0 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tag</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {categoryList.map(cat => (
            <span 
              key={cat} 
              className="bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs text-zinc-300 font-bold flex items-center space-x-2"
            >
              <span>{cat}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-100">
              System Ingestion & OCR Audit Log
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time processing audit records</p>
          </div>
          <Activity className="w-4 h-4 text-zinc-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/40 text-[10px] font-black uppercase text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Notice Document Title</th>
                <th className="p-4">AI Confidence</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 text-zinc-500 text-[11px]">{log.timestamp}</td>
                  <td className="p-4 font-bold text-zinc-200">{log.action}</td>
                  <td className="p-4 text-zinc-300">{log.noticeTitle}</td>
                  <td className="p-4 text-emerald-400">{log.confidence}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.status === 'Success' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : log.status === 'Warning'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}