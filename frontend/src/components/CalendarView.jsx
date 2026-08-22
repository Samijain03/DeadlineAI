import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle, Sparkles } from 'lucide-react';

export default function CalendarView({ notices, onSelectNotice }) {
  // Focus around August/September 2026 based on project context
  const [currentMonth, setCurrentMonth] = useState(7); // 7: August (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState("2026-08-28");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const padZero = (n) => (n < 10 ? `0${n}` : `${n}`);

  // Group notices by date string YYYY-MM-DD
  const noticesByDate = notices.reduce((acc, notice) => {
    if (!acc[notice.dueDate]) acc[notice.dueDate] = [];
    acc[notice.dueDate].push(notice);
    return acc;
  }, {});

  const selectedDateNotices = selectedDate ? (noticesByDate[selectedDate] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        
        {/* Month Selector Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-100">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <p className="text-[10px] text-zinc-500">Academic Deadline Schedule</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-zinc-300">
              {monthNames[currentMonth].substring(0, 3)}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-zinc-500 tracking-wider">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-zinc-900/20 border border-transparent"></div>
          ))}

          {/* Actual day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(dayNum)}`;
            const dayNotices = noticesByDate[dateStr] || [];
            const isSelected = selectedDate === dateStr;
            const hasHighUrgency = dayNotices.some(n => n.priority === 'High');
            const hasConflict = dayNotices.length > 1;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-16 sm:h-20 rounded-2xl p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : dayNotices.length > 0
                    ? hasHighUrgency
                      ? 'border-red-800/80 bg-red-950/20 hover:border-red-500'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    : 'border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${
                    isSelected ? 'text-amber-400' : 'text-zinc-300'
                  }`}>
                    {dayNum}
                  </span>
                  {hasConflict && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Deadline Conflict!"></span>
                  )}
                </div>

                {/* Badges preview */}
                <div className="flex flex-wrap gap-1">
                  {dayNotices.map((n, idx) => (
                    <span
                      key={idx}
                      className={`w-full text-[8px] font-bold truncate px-1 py-0.5 rounded ${
                        n.priority === 'High'
                          ? 'bg-red-900/80 text-red-200'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {n.category.substring(0, 4)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Date Inspector Sidebar */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 space-y-5 flex flex-col">
        <div className="border-b border-zinc-800 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Selected Date Inspector</p>
          <h4 className="text-base font-black text-amber-400 font-mono mt-1">
            {selectedDate || "Choose a date"}
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            {selectedDateNotices.length} deadline(s) scheduled for this day
          </p>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {selectedDateNotices.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800 rounded-2xl">
              <Clock className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-500">No deadlines scheduled on this date.</p>
              <p className="text-[10px] text-zinc-600 mt-1">Select an indicated day with notice markers</p>
            </div>
          ) : (
            selectedDateNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => onSelectNotice(notice)}
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-2xl space-y-2.5 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    notice.priority === 'High'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {notice.priority} Urgency
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">{notice.category}</span>
                </div>

                <h5 className="text-xs font-bold text-zinc-100">{notice.title}</h5>

                <div className="bg-black/60 p-2.5 rounded-xl text-[11px] text-zinc-300">
                  <span className="text-amber-400 font-bold">Action: </span>
                  {notice.actionRequired}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
