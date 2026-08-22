import React, { useState } from 'react';
import { 
  X, Calendar, Clock, Bell, CheckCircle, FileText, 
  Sparkles, Download, ShieldCheck, Tag, Building2, 
  ExternalLink, Copy, Check, MessageSquare, Share2, Send,
  HelpCircle, Bot, CornerDownLeft
} from 'lucide-react';
import { noticeService } from '../services/noticeService';

export default function NoticeDetailModal({ 
  notice, 
  onClose, 
  onToggleReminder, 
  onToggleDone,
  onNotify
}) {
  const [activeTab, setActiveTab] = useState('action'); // 'action', 'qa', 'ocr', 'metadata'
  const [copiedAction, setCopiedAction] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  
  // Notice Q&A Assistant state
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: `Hello! I have analyzed "${notice?.title}". You can ask me anything about this circular, like eligibility, required documents, or deadlines.`
    }
  ]);

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

  const handleOpenGoogleCalendar = () => {
    const url = noticeService.getGoogleCalendarUrl(notice);
    window.open(url, '_blank');
    if (onNotify) onNotify("Google Calendar Opened", "Event created in new tab.", "info");
  };

  const handleShareWhatsApp = () => {
    const url = noticeService.getWhatsAppShareUrl(notice);
    window.open(url, '_blank');
  };

  const handleCopyShareText = () => {
    const text = noticeService.getFormattedShareText(notice);
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    if (onNotify) onNotify("Notice Summary Copied", "Formatted summary copied for WhatsApp / Classroom.", "success");
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAskQuestion = async (qText) => {
    const query = qText || questionInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestionInput('');
    setIsAsking(true);

    const answer = await noticeService.askNoticeQuestion(notice, query);
    setChatHistory(prev => [...prev, { sender: 'ai', text: answer }]);
    setIsAsking(false);
  };

  const SUGGESTED_QUESTIONS = [
    "Am I eligible for this?",
    "What documents do I need to submit?",
    "Where and how do I submit?",
    "Is there a late submission penalty?"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
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

            <div className="flex items-center space-x-4 text-xs text-zinc-400 pt-1 flex-wrap gap-y-1">
              <span className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due: {notice.dueDate} {notice.dueTime && `(${notice.dueTime} HRS)`}</span>
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
        <div className="flex border-b border-zinc-800 bg-black/40 px-6 pt-2 space-x-3 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('action')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'action'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Action Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'qa'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>🤖 Ask AI Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'ocr'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw OCR Document</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
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
          
          {/* TAB 1: ACTION SUMMARY */}
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

              {/* Share Card Options */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-200">Share Notice with Classmates</p>
                  <p className="text-[10px] text-zinc-500">Send formatted deadline card to WhatsApp groups or copy summary</p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 sm:flex-none px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/80 text-emerald-300 font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyShareText}
                    className="flex-1 sm:flex-none px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition"
                  >
                    {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShare ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI NOTICE Q&A ASSISTANT (From Page 12 of PDF) */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 flex items-center space-x-3 text-xs text-zinc-400">
                <Bot className="w-5 h-5 text-amber-400 shrink-0" />
                <p>
                  Ask any question regarding this circular (eligibility, submissions, fees, or contact desk) and AI will answer from the document context.
                </p>
              </div>

              {/* Chat Thread */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3 max-h-64 overflow-y-auto">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 whitespace-pre-wrap'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-amber-400 animate-pulse flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyzing notice text...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Questions Pills */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Suggested Queries:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskQuestion(q)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 rounded-lg text-[11px] font-medium transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAskQuestion(); }}
                className="flex gap-2 pt-1"
              >
                <input 
                  type="text"
                  placeholder="Ask a question about this notice (e.g. Can I submit after 28th?)..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!questionInput.trim() || isAsking}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: RAW OCR */}
          {activeTab === 'ocr' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-mono">PyTesseract / PyPDF Extracted Stream</span>
                <span className="text-zinc-500 font-mono">{notice.fileName || 'Notice_Document.pdf'}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap max-h-72 overflow-y-auto">
                {notice.rawText || "Official circular extracted text loaded in database."}
              </div>
            </div>
          )}

          {/* TAB 4: METADATA */}
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
                <p className="font-mono text-zinc-200">{notice.reminderSet ? "Enabled (Email / WhatsApp)" : "Disabled"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions with Direct Google Calendar & Export */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => onToggleReminder(notice)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition ${
                notice.reminderSet
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{notice.reminderSet ? 'Alert Active' : 'Set Alert'}</span>
            </button>

            {/* Direct Google Calendar 1-Click Link */}
            <button
              onClick={handleOpenGoogleCalendar}
              className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-bold flex items-center space-x-1.5 transition"
              title="Add to Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Google Calendar ↗</span>
            </button>

            {/* .ICS export */}
            <button
              onClick={handleExportCalendar}
              className="px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold flex items-center space-x-1.5 transition"
              title="Download iCal file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.ICS</span>
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
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
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
