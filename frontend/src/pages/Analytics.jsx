import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle, ShieldCheck, PieChart, Award } from 'lucide-react';

export default function Analytics({ notices, reminders }) {
  const total = notices.length;
  const completed = notices.filter(n => n.status === 'Completed').length;
  const upcoming = notices.filter(n => n.status !== 'Completed').length;
  const highPriority = notices.filter(n => n.priority === 'High' && n.status !== 'Completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Category counts
  const categoryCounts = notices.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>EXECUTIVE DEADLINE INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 uppercase tracking-wide">
            Workload & Analytics Insights
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time analytics on academic submissions, urgency distribution, and task turnaround velocity.
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center space-x-3">
          <Award className="w-6 h-6 text-amber-400" />
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Completion Velocity</p>
            <p className="text-lg font-black text-zinc-100 font-mono">{completionRate}% Done</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-amber-500 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-xs font-black uppercase tracking-wider mb-2">
            <span>Total Tracked</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-zinc-100 font-mono">{total}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Academic Notices Parsed</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-red-600 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-xs font-black uppercase tracking-wider mb-2">
            <span>Critical Urgency</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-400 font-mono">{highPriority}</p>
          <p className="text-[10px] text-zinc-500 mt-1">High Stress Points</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-emerald-500 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-xs font-black uppercase tracking-wider mb-2">
            <span>Finished</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">{completed}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Submitted On Time</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-cyan-500 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-xs font-black uppercase tracking-wider mb-2">
            <span>Active Alerts</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 font-mono">{reminders.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Multi-channel Triggers</p>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-100">Notice Volume by Category</h3>
              <p className="text-[10px] text-zinc-500">Distribution across university departments</p>
            </div>
            <PieChart className="w-4 h-4 text-zinc-500" />
          </div>

          <div className="space-y-3.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200">{cat}</span>
                    <span className="font-mono text-zinc-400">{count} notice(s) ({pct}%)</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Workload Insights */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-zinc-800/80 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-100">AI Predictive Risk Rating</h3>
            <p className="text-[10px] text-zinc-500">Automated evaluation of upcoming week's deadline load</p>
          </div>

          <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Workload Congestion Index:</span>
              <span className="text-xs font-black text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full font-mono">
                MODERATE - HIGH (68/100)
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              With 2 simultaneous submissions due on <strong className="text-white">28 Aug 2026</strong> (Semester Exam Registration and Mini-Project Capstone), your immediate submission risk is elevated.
            </p>

            <div className="pt-2">
              <div className="bg-black/80 border border-zinc-800 p-3 rounded-xl flex items-center space-x-3 text-xs">
                <span className="text-lg">💡</span>
                <p className="text-zinc-300 text-[11px]">
                  <strong>Recommended Action:</strong> Clear exam fee payments 48 hours prior to prevent server load issues.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-xs text-emerald-300">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <p>
              <strong>Status:</strong> {completed} of {total} academic items have already been completed and verified.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
