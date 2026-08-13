import React from 'react';

export default function Reminders({ reminders, onCancelReminder }) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-black text-zinc-100 uppercase tracking-wide">Automated Reminders Schedule</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage scheduled notifications dispatched automatically prior to task expiration.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Scheduled Trigger Queue ({reminders.length})</h3>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {reminders.map((rem) => (
            <div key={rem.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-900/50 transition">
              <div>
                <h4 className="text-sm font-bold text-zinc-100">{rem.title}</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Delivery Channel: <span className="text-amber-400 font-bold">{rem.channel}</span></p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs font-mono text-zinc-300 bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-lg">
                  🕒 Trigger: {rem.triggerDate}
                </span>
                <button 
                  onClick={() => onCancelReminder(rem.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}