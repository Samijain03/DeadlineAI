import React, { useState } from 'react';
import { 
  X, Calendar, Clock, Bell, CheckCircle, FileText, 
  Sparkles, Download, ShieldCheck, Tag, Building2, 
  ExternalLink, Copy, Check
} from 'lucide-react';
import { noticeService } from '../services/noticeService';

export default function NoticeDetailModal({ 
  notice, 
  onClose, 
  onToggleReminder, 
  onToggleDone,
  onNotify
}) {
  const [activeTab, setActiveTab] = useState('action'); // 'action', 'ocr', 'metadata'
  const [copiedAction, setCopiedAction] = useState(false);

  if (!notice) return null;

  const handleCopyAction = () => {
    navigator.clipboard.writeText(notice.actionRequired);
    setCopiedAction(true);
    if (onNotify) onNotify("Copied to clipboard", "Action details copied successfully.", "success");
    setTimeout(() => setCopiedAction(false), 2000);
  };

  const handleExportCalendar = () => {
    noticeService.exportToICS(notice);
    if (onNotify) onNotify("Calendar Event Exported", `${notice.title.substring(0, 30)}... exported to .ics`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/60 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                notice.priority === 'High' 
                  ? 'bg-red-950/90 text-red-400 border border-red-800/80' 
                  : notice.priority === 'Medium'
                  ? 'bg-amber-950/90 text-amber-400 border border-amber-800/80'
                  : 'bg-blue-950/90 text-blue-400 border border-blue-800/80'
              }`}>
                {notice.priority} Urgency
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 uppercase border border-zinc-700">
                {notice.category}
              </span>

              {notice.extractedConfidence && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Confidence: {notice.extractedConfidence}%</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-zinc-100 leading-snug">
              {notice.title}
            </h2>

            <div className="flex items-center space-x-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due: {notice.dueDate} {notice.dueTime && `(${notice.dueTime})`}</span>
              </span>

              {notice.sourceInstitution && (
                <span className="flex items-center space-x-1 text-zinc-400">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{notice.sourceInstitution}</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 p-2 rounded-xl border border-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-black/40 px-6 pt-2 space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('action')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'action'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actionable Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'ocr'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw OCR Document Text</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'metadata'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Metadata & Audit</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-300 text-xs">
          
          {activeTab === 'action' && (
            <div className="space-y-5">
              {/* Primary Action Box */}
              <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-2xl p-5 relative overflow-hidden shadow-lg">
                <div className="w-1 h-full bg-amber-500 absolute left-0 top-0"></div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                    <span>⚡ What You Need To Do:</span>
                  </p>
                  <button
                    onClick={handleCopyAction}
                    className="flex items-center space-x-1 text-[10px] text-zinc-400 hover:text-amber-400 bg-black/60 px-2.5 py-1 rounded-lg border border-zinc-800 transition"
                  >
                    {copiedAction ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAction ? 'Copied' : 'Copy Task'}</span>
                  </button>
                </div>
                <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                  {notice.actionRequired}
                </p>
              </div>

              {/* Eligibility Condition */}
              {notice.eligibility && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Eligibility & Prerequisites:</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed font-mono">
                    {notice.eligibility}
                  </p>
                </div>
              )}

              {/* Notes */}
              {notice.notes && (
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    Internal Checklist / Student Notes:
                  </p>
                  <p className="text-zinc-300 italic">{notice.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-mono">Extracted via PyTesseract OCR Engine</span>
                <span className="text-zinc-500">File: {notice.fileName || 'Notice_Document.pdf'}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap selection:bg-amber-500 selection:text-black">
                {notice.rawText || "No raw text recorded for this document."}
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Document ID</span>
                <p className="font-mono text-zinc-200">{notice.id}</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Source File Type</span>
                <p className="font-mono text-zinc-200">{notice.fileType}</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Status</span>
                <p className="font-mono text-zinc-200">{notice.status}</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Alert Trigger</span>
                <p className="font-mono text-zinc-200">{notice.reminderSet ? "Enabled (Email / Push)" : "Disabled"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleReminder(notice)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition ${
                notice.reminderSet
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{notice.reminderSet ? 'Reminder Active' : 'Set Alert'}</span>
            </button>

            <button
              onClick={handleExportCalendar}
              className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center space-x-2 transition"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export .ICS</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onToggleDone(notice.id);
                onClose();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                notice.status === 'Completed'
                  ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{notice.status === 'Completed' ? 'Reopen Deadline' : 'Mark as Done ✓'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
