import React, { useState } from 'react';
import { 
  Bell, Mail, MessageSquare, Smartphone, Clock, 
  Trash2, Plus, CheckCircle2, ShieldCheck, AlertCircle 
} from 'lucide-react';

export default function Reminders({ 
  reminders, 
  onCancelReminder, 
  onAddCustomReminder, 
  notices, 
  onNotify 
}) {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(notices[0]?.id || "");
  const [offsetDays, setOffsetDays] = useState("2");
  const [triggerChannel, setTriggerChannel] = useState("Email & WhatsApp");

  const handleCreateReminder = (e) => {
    e.preventDefault();
    const notice = notices.find(n => n.id === selectedNoticeId);
    if (!notice) return;

    const newReminder = {
      id: `rem-${Date.now()}`,
      noticeId: notice.id,
      title: notice.title,
      channel: triggerChannel,
      triggerDate: `${notice.dueDate} • 09:00 AM`,
      dueDate: notice.dueDate,
      priority: notice.priority,
      status: "Active",
      offset: `${offsetDays} days before`
    };

    onAddCustomReminder(newReminder);
    setShowAddModal(false);
    if (onNotify) onNotify("Alert Scheduled", `Reminder configured for "${notice.title.substring(0, 25)}..."`, "success");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold mb-1">
            <Bell className="w-4 h-4" />
            <span>NOTIFICATION DISPATCH CENTER</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 uppercase tracking-wide">
            Automated Alerts & Reminders Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure multi-channel reminders dispatched automatically before submission cutoff deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2.5 rounded-2xl transition shadow-[0_0_15px_rgba(245,158,11,0.25)] uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Alert</span>
        </button>
      </div>

      {/* Channel Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-zinc-950/70 border border-zinc-800/80 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-2xl">
              <Mail className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailEnabled} 
                onChange={() => setEmailEnabled(!emailEnabled)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100">University Email Channel</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">student@mitwpu.edu.in</p>
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800/80 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={whatsappEnabled} 
                onChange={() => setWhatsappEnabled(!whatsappEnabled)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100">WhatsApp Push Channel</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">+91 98234-XXXXX (Verified)</p>
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800/80 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-2xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={pushEnabled} 
                onChange={() => setPushEnabled(!pushEnabled)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100">Browser & Mobile App Push</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Instant popup notifications</p>
          </div>
        </div>

      </div>

      {/* Active Trigger Queue List */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 bg-zinc-900/60 border-b border-zinc-800/80 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-100">
              Scheduled Trigger Queue ({reminders.length})
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Automated cron job executions dispatched to celery worker queue</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
            Daemon Active
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {reminders.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <p>No active scheduled reminders.</p>
              <p className="text-[10px] text-zinc-600">Turn on alerts on any notice card from the Dashboard.</p>
            </div>
          ) : (
            reminders.map((rem) => (
              <div 
                key={rem.id} 
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800/60">
                      Channel: {rem.channel}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Due: {rem.dueDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-100 leading-snug">
                    {rem.title}
                  </h4>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-xl block">
                      🕒 Trigger: {rem.triggerDate}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      onCancelReminder(rem.id);
                      if (onNotify) onNotify("Alert Cancelled", "Reminder removed from schedule queue.", "info");
                    }}
                    className="text-zinc-500 hover:text-red-400 p-2 rounded-xl border border-zinc-800 bg-zinc-900 transition"
                    title="Cancel Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-100 uppercase tracking-wide">Schedule Custom Reminder</h3>
            
            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Select Notice / Deadline</label>
                <select 
                  value={selectedNoticeId} 
                  onChange={e => setSelectedNoticeId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  {notices.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Trigger Offset</label>
                <select 
                  value={offsetDays} 
                  onChange={e => setOffsetDays(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="1">1 Day Prior to Deadline (09:00 AM)</option>
                  <option value="2">2 Days Prior to Deadline (09:00 AM)</option>
                  <option value="3">3 Days Prior to Deadline (09:00 AM)</option>
                  <option value="0">On Due Date Morning (08:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Dispatch Channels</label>
                <select 
                  value={triggerChannel} 
                  onChange={e => setTriggerChannel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Email & WhatsApp">Email & WhatsApp</option>
                  <option value="Email Only">Email Only</option>
                  <option value="WhatsApp Only">WhatsApp Only</option>
                  <option value="Push Notification">Push Notification</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-black hover:bg-amber-400 transition"
                >
                  Schedule Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}