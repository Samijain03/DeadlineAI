import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Bell, ArrowRight, Eye } from 'lucide-react';

export default function KanbanView({ notices, onToggleDone, onToggleReminder, onSelectNotice }) {
  const columns = [
    {
      id: 'high_priority',
      title: '🚨 High Urgency & Conflict',
      subtitle: 'Critical academic tasks needing immediate action',
      items: notices.filter(n => n.priority === 'High' && n.status !== 'Completed'),
      color: 'border-red-500/40 bg-red-950/20 text-red-400'
    },
    {
      id: 'upcoming',
      title: '⏳ Upcoming & Active',
      subtitle: 'Regular scheduled submissions and applications',
      items: notices.filter(n => n.priority !== 'High' && n.status !== 'Completed'),
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-400'
    },
    {
      id: 'completed',
      title: '✅ Completed / Submitted',
      subtitle: 'Finished tasks and submitted forms',
      items: notices.filter(n => n.status === 'Completed'),
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col space-y-4 bg-zinc-950/60 border border-zinc-800/80 rounded-3xl p-4 sm:p-5">
          
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-100 flex items-center space-x-2">
                <span>{col.title}</span>
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">{col.subtitle}</p>
            </div>
            <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${col.color}`}>
              {col.items.length}
            </span>
          </div>

          {/* Cards in Column */}
          <div className="space-y-3.5 flex-1 min-h-[300px]">
            {col.items.length === 0 ? (
              <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800/80 rounded-2xl">
                <p className="text-xs text-zinc-500">No deadlines in this column</p>
              </div>
            ) : (
              col.items.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl space-y-3 transition-all duration-200 hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg">
                      {notice.category}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{notice.dueDate}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-100 leading-snug line-clamp-2">
                    {notice.title}
                  </h4>

                  <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-amber-400 mb-0.5">
                      ⚡ Action Required:
                    </p>
                    <p className="text-[11px] text-zinc-300 font-medium line-clamp-2">
                      {notice.actionRequired}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => onSelectNotice(notice)}
                      className="text-zinc-400 hover:text-amber-400 flex items-center space-x-1 text-[11px] font-bold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onToggleReminder(notice)}
                        className={`p-1.5 rounded-lg border transition ${
                          notice.reminderSet
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                        }`}
                        title="Toggle Reminder"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleDone(notice.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition ${
                          notice.status === 'Completed'
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {notice.status === 'Completed' ? 'Reopen' : 'Done ✓'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
