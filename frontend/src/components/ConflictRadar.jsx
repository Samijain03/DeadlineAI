import React from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Calendar, Bell } from 'lucide-react';

export default function ConflictRadar({ notices, onToggleReminder, onSelectNotice }) {
  // Identify conflicts (notices due on same date or within 2 days of each other)
  const activeNotices = notices.filter(n => n.status !== 'Completed');

  const conflictsByDate = {};
  activeNotices.forEach((notice) => {
    if (!conflictsByDate[notice.dueDate]) {
      conflictsByDate[notice.dueDate] = [];
    }
    conflictsByDate[notice.dueDate].push(notice);
  });

  const conflictDates = Object.entries(conflictsByDate).filter(([date, list]) => list.length > 1);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-950 border border-red-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="w-1.5 h-full bg-red-600 absolute left-0 top-0"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-red-950/80 border border-red-800/80 px-3 py-1 rounded-full text-red-400 text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>SMART CONFLICT DETECTION ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100">
              Workload Congestion & Conflict Radar
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              DeadlineAI cross-references all ingested notices to identify simultaneous submissions and exam deadlines. It recommends proactive schedules to eliminate last-minute bottlenecks.
            </p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl text-center shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Conflict Clusters</p>
            <p className="text-3xl font-black text-red-400 font-mono mt-1">{conflictDates.length}</p>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">High Stress Points</p>
          </div>
        </div>
      </div>

      {/* Conflict Clusters List */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Detected Conflict Clusters ({conflictDates.length})
        </h3>

        {conflictDates.length === 0 ? (
          <div className="bg-zinc-950/60 border border-emerald-500/30 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-300">No Critical Deadline Clashes Detected</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Your academic deadlines are evenly distributed. No overlapping high-priority submissions on identical dates.
            </p>
          </div>
        ) : (
          conflictDates.map(([date, list]) => {
            const hasHighUrgency = list.some(n => n.priority === 'High');

            return (
              <div
                key={date}
                className="bg-zinc-950/70 border border-red-900/50 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden"
              >
                {/* Conflict Date Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-black text-zinc-100 font-mono">Date Clash: {date}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                          {list.length} Simultaneous Tasks
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Multiple items due on this same calendar date. Potential submission rush and portal downtime risk.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overlapping Tasks Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((notice) => (
                    <div
                      key={notice.id}
                      className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded ${
                          notice.priority === 'High'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {notice.priority} Urgency
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-800 px-2 py-0.5 rounded">
                          {notice.category}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-zinc-100">{notice.title}</h5>

                      <div className="bg-black/70 border border-zinc-800 rounded-xl p-3">
                        <p className="text-[10px] font-black uppercase text-amber-400 mb-0.5">Required Action:</p>
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">{notice.actionRequired}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onSelectNotice(notice)}
                          className="text-xs text-zinc-400 hover:text-amber-400 font-bold"
                        >
                          View Document Details →
                        </button>
                        <button
                          onClick={() => onToggleReminder(notice)}
                          className={`p-2 rounded-xl border text-xs font-bold transition ${
                            notice.reminderSet
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Conflict Resolution Suggestion */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-200">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                      AI Optimization Recommendation:
                    </p>
                    <p className="text-zinc-300 leading-relaxed">
                      To prevent server congestion on <strong className="text-white">{date}</strong>, submit the <strong className="text-amber-300">{list[0].category} ({list[0].title.substring(0, 30)}...)</strong> 2 days in advance (by 26 Aug) so you can focus entirely on completing the <strong className="text-amber-300">{list[1]?.title.substring(0, 30)}...</strong> deliverables.
                    </p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
