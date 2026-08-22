import React, { useState } from 'react';
import { 
  LayoutGrid, Kanban, Calendar, Table, Search, Plus, 
  AlertTriangle, Clock, CheckCircle, Bell, Eye, Download, 
  Sparkles, ShieldCheck, ChevronRight, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import KanbanView from '../components/KanbanView';
import CalendarView from '../components/CalendarView';
import TableView from '../components/TableView';

export default function Dashboard({ 
  notices, 
  reminders, 
  categoryList, 
  onToggleDone, 
  onToggleReminder, 
  onNavigateUpload,
  onNavigateConflicts,
  isAuthenticated,
  onPromptAuth,
  onSelectNotice,
  onNotify,
  searchQuery,
  setSearchQuery
}) {
  const [viewMode, setViewMode] = useState('stream'); // 'stream', 'kanban', 'calendar', 'table'
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Upcoming", "Completed", "Missed"

  // Filter notices
  const filteredNotices = notices.filter(item => {
    const matchesCat = selectedCat === "All" || item.category === selectedCat;
    const matchesPri = selectedPriority === "All" || item.priority === selectedPriority;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(query) || 
      item.actionRequired.toLowerCase().includes(query) ||
      (item.eligibility && item.eligibility.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query);

    return matchesCat && matchesPri && matchesStatus && matchesSearch;
  });

  const highUrgencyCount = notices.filter(d => d.priority === 'High' && d.status !== 'Completed').length;
  const activeCount = notices.filter(d => d.status === 'Upcoming').length;
  const completedCount = notices.filter(d => d.status === 'Completed').length;
  const missedCount = notices.filter(d => d.status === 'Missed').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner for Guests */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/40 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-2xl text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-200 font-medium">
                Viewing in <strong className="font-extrabold text-amber-400">Student Preview Mode</strong>.
              </p>
              <p className="text-[11px] text-zinc-400">
                Sign in to save your personal notices and activate WhatsApp alerts.
              </p>
            </div>
          </div>
          <button 
            onClick={onPromptAuth}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-5 py-2.5 rounded-xl transition uppercase tracking-wider shrink-0 shadow-md"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* USP: Smart Deadline Conflict Warning Banner */}
      {highUrgencyCount > 1 && (
        <div className="border border-red-600/40 bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-950 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
          <div className="w-1.5 h-full bg-red-600 absolute left-0 top-0"></div>
          
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-600/20 rounded-2xl border border-red-500/40 text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">
                  Smart Conflict Radar Warning
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-800 uppercase">
                  Clash Detected
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                You have <strong className="text-amber-400">{highUrgencyCount} High-Urgency deadlines</strong> scheduled simultaneously on <span className="text-white font-mono font-bold">28 August 2026</span> (Exam Form & Mini-Project).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button 
              onClick={onNavigateConflicts}
              className="bg-red-950/80 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
            >
              <span>Analyze Conflicts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={onNavigateUpload}
              className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2.5 rounded-xl transition shadow-md uppercase tracking-wider flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Notice</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-amber-500 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <span>Upcoming</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-zinc-100 mt-1 font-mono">{activeCount}</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-red-600 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <span>High Urgency</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-400 mt-1 font-mono">{highUrgencyCount}</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-emerald-500 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <span>Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{completedCount}</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="w-1 h-full bg-cyan-500 absolute left-0 top-0"></div>
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <span>Scheduled Alerts</span>
            <Bell className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{reminders.length}</p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
        
        {/* Search, View Modes & Ingest CTA */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search by title, action required, or eligibility keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-2xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-xs text-zinc-500 hover:text-zinc-300 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-start lg:self-auto">
            <button
              onClick={() => setViewMode('stream')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'stream'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Stream</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'kanban'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'calendar'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>
          </div>

          <button
            onClick={onNavigateUpload}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-3 rounded-2xl transition shadow-md flex items-center justify-center space-x-1.5 uppercase tracking-wider shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Document</span>
          </button>
        </div>

        {/* Filters: 4-Way Status Tabs from PDF (All, Upcoming, Completed, Missed) + Urgency */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
          
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">Status:</span>
            {["All", "Upcoming", "Completed", "Missed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-zinc-100 text-black font-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {st}
              </button>
            ))}

            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-3 mr-1">Urgency:</span>
            {["All", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedPriority === p
                    ? p === 'High' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500 font-mono">
            Showing <strong className="text-zinc-200">{filteredNotices.length}</strong> of {notices.length} notices
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categoryList].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCat === c
                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' && (
        <KanbanView 
          notices={filteredNotices}
          onToggleDone={onToggleDone}
          onToggleReminder={onToggleReminder}
          onSelectNotice={onSelectNotice}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView 
          notices={filteredNotices}
          onSelectNotice={onSelectNotice}
        />
      )}

      {viewMode === 'table' && (
        <TableView 
          notices={filteredNotices}
          onToggleDone={onToggleDone}
          onToggleReminder={onToggleReminder}
          onSelectNotice={onSelectNotice}
          onNotify={onNotify}
        />
      )}

      {viewMode === 'stream' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Parsed Academic Notice Stream ({filteredNotices.length})
            </h2>
          </div>

          {filteredNotices.length === 0 ? (
            <div className="bg-zinc-950/60 border border-dashed border-zinc-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-500 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-300">No matching notices found</h4>
                <p className="text-xs text-zinc-500 mt-1">Try relaxing your search terms or category filters.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCat("All");
                  setSelectedPriority("All");
                  setStatusFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredNotices.map((notice) => {
                const isCompleted = notice.status === 'Completed';
                const isMissed = notice.status === 'Missed';
                const isHigh = notice.priority === 'High';

                return (
                  <div 
                    key={notice.id}
                    className={`border rounded-3xl p-6 sm:p-7 bg-zinc-950/80 transition-all duration-300 relative group overflow-hidden ${
                      isCompleted 
                        ? 'opacity-55 border-zinc-800/80 bg-zinc-950' 
                        : isMissed
                        ? 'border-red-950 bg-zinc-950 opacity-70'
                        : isHigh 
                        ? 'border-red-900/60 shadow-[0_0_25px_rgba(185,28,28,0.09)] hover:border-red-600/70' 
                        : 'border-zinc-800 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      
                      {/* Left: Content & Action Box */}
                      <div className="space-y-4 flex-1">
                        
                        {/* Meta Tags */}
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isHigh 
                              ? 'bg-red-950 text-red-400 border border-red-800/80' 
                              : notice.priority === 'Medium'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                              : 'bg-blue-950 text-blue-400 border border-blue-800/80'
                          }`}>
                            {notice.priority} Urgency
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 uppercase border border-zinc-700">
                            {notice.category}
                          </span>

                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            Source: {notice.fileType}
                          </span>

                          {notice.extractedConfidence && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                              AI: {notice.extractedConfidence}%
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-base sm:text-lg font-bold leading-snug cursor-pointer hover:text-amber-400 transition ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                        onClick={() => onSelectNotice(notice)}
                        >
                          {notice.title}
                        </h3>

                        {/* USP: AI Action Extraction Callout Box */}
                        <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/35 rounded-2xl p-4 space-y-1 relative overflow-hidden shadow-inner">
                          <div className="w-1 h-full bg-amber-500 absolute left-0 top-0"></div>
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
                            <span>⚡ What You Need To Do:</span>
                          </p>
                          <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                            {notice.actionRequired}
                          </p>
                        </div>

                        {/* Eligibility & Prerequisites */}
                        {notice.eligibility && (
                          <div className="flex items-center space-x-2 text-xs text-zinc-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <p className="truncate font-mono">
                              <span className="text-zinc-500 font-bold">Eligibility Constraint:</span> {notice.eligibility}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Deadline & Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 border-zinc-800/80 pt-4 lg:pt-0 shrink-0">
                        
                        <div className="lg:text-right">
                          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Deadline</p>
                          <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
                            {notice.dueDate}
                          </p>
                          {notice.dueTime && (
                            <p className="text-[10px] font-mono text-zinc-500">{notice.dueTime} HRS</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                          <button
                            onClick={() => onSelectNotice(notice)}
                            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-bold flex items-center space-x-1.5 transition"
                            title="Inspect full details & OCR text"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          <button 
                            onClick={() => onToggleReminder(notice)}
                            className={`px-3 py-2 rounded-xl border transition-all text-xs font-bold flex items-center space-x-1.5 ${
                              notice.reminderSet 
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>{notice.reminderSet ? 'Alert On' : 'Set Alert'}</span>
                          </button>

                          <button 
                            onClick={() => onToggleDone(notice.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                              isCompleted
                                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isCompleted ? 'Completed ✓' : 'Done ✓'}</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}