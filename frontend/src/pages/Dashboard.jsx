import React, { useState } from 'react';

export default function Dashboard({ 
  notices, 
  reminders, 
  categoryList, 
  onToggleDone, 
  onToggleReminder, 
  onNavigateUpload,
  isAuthenticated,
  onPromptAuth
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  const filteredNotices = notices.filter(item => {
    const matchesCat = selectedCat === "All" || item.category === selectedCat;
    const matchesPri = selectedPriority === "All" || item.priority === selectedPriority;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.actionRequired.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesPri && matchesSearch;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Logged Out Guest Banner */}
      {!isAuthenticated && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-amber-400 font-bold text-lg">🔒</span>
            <p className="text-xs text-amber-200">
              You are currently viewing in <strong className="font-extrabold text-amber-400">Guest Mode</strong>. Sign in to sync notices across devices and save reminders.
            </p>
          </div>
          <button 
            onClick={onPromptAuth}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-xl transition uppercase tracking-wider shrink-0"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* USP: Smart Deadline Conflict Warning Banner */}
      <div className="border border-red-600/50 bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-900 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(220,38,38,0.15)] relative overflow-hidden">
        <div className="w-1 h-full bg-red-600 absolute left-0 top-0"></div>
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-red-600/20 rounded-xl border border-red-500/40 text-red-400 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-wider">
              Smart Conflict Warning Engine
            </h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              You have <span className="text-amber-400 font-bold">2 High-Urgency tasks</span> due simultaneously on <span className="text-white font-mono font-bold">28 Aug 2026</span> (Exam Form & Mini-Project).
            </p>
          </div>
        </div>
        <button 
          onClick={onNavigateUpload}
          className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 uppercase tracking-wider"
        >
          + Ingest Notice
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-amber-500 absolute left-0 top-0"></div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Active Deadlines</p>
          <p className="text-3xl font-black text-zinc-100 mt-1.5 font-mono">{notices.filter(d => d.status === 'Upcoming').length}</p>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-red-600 absolute left-0 top-0"></div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">High Priority</p>
          <p className="text-3xl font-black text-red-400 mt-1.5 font-mono">{notices.filter(d => d.priority === 'High' && d.status === 'Upcoming').length}</p>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-emerald-500 absolute left-0 top-0"></div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Completed Tasks</p>
          <p className="text-3xl font-black text-emerald-400 mt-1.5 font-mono">{notices.filter(d => d.status === 'Completed').length}</p>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-yellow-600 absolute left-0 top-0"></div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Scheduled Alerts</p>
          <p className="text-3xl font-black text-amber-400 mt-1.5 font-mono">{reminders.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text"
              placeholder="Search notices or actionable tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-xl pl-10 pr-4 py-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">Urgency:</span>
            {["All", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPriority === p 
                    ? p === 'High' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {["All", ...categoryList].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCat === c 
                  ? 'bg-zinc-100 text-black shadow-[0_0_12px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notice List Stream */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Parsed Notice Stream ({filteredNotices.length})
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {filteredNotices.map((notice) => (
            <div 
              key={notice.id}
              className={`border rounded-2xl p-6 bg-zinc-900/80 transition-all duration-300 relative ${
                notice.status === 'Completed' 
                  ? 'opacity-50 border-zinc-800 bg-zinc-950' 
                  : notice.priority === 'High' 
                  ? 'border-red-900/60 shadow-[0_0_20px_rgba(185,28,28,0.08)]' 
                  : 'border-zinc-800 hover:border-amber-500/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      notice.priority === 'High' 
                        ? 'bg-red-950 text-red-400 border border-red-800/80' 
                        : 'bg-amber-950 text-amber-400 border border-amber-800/80'
                    }`}>
                      {notice.priority} Urgency
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 uppercase">
                      {notice.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Source: {notice.fileType}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold ${notice.status === 'Completed' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {notice.title}
                  </h3>

                  {/* USP: AI Action Extraction Box */}
                  <div className="bg-black/90 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center space-x-1">
                      <span>⚡ What You Need To Do:</span>
                    </p>
                    <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                      {notice.actionRequired}
                    </p>
                  </div>

                  {notice.eligibility && (
                    <p className="text-xs text-zinc-400">
                      <span className="text-zinc-500 font-bold">Eligibility Constraint:</span> {notice.eligibility}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 border-zinc-800/80 pt-4 lg:pt-0">
                  <div className="lg:text-right">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Deadline</p>
                    <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
                      {notice.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onToggleReminder(notice)}
                      className={`px-3 py-2 rounded-xl border transition-all text-xs font-bold flex items-center space-x-1.5 ${
                        notice.reminderSet 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
                          : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>{notice.reminderSet ? 'Alert On' : 'Set Alert'}</span>
                    </button>

                    <button 
                      onClick={() => onToggleDone(notice.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        notice.status === 'Completed'
                          ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      {notice.status === 'Completed' ? 'Pending' : 'Done ✓'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}