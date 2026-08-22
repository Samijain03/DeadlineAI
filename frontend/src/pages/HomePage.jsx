import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, ScanText, ShieldAlert, Bell, 
  CheckCircle2, FileText, UploadCloud, Calendar, Clock, 
  Search, ShieldCheck, ChevronRight, Play, Eye, Building2,
  Users, Award, Cpu, BookOpen, Layers
} from 'lucide-react';
import { DEMO_PRESET_NOTICES } from '../services/mockData';

export default function HomePage({ onSignIn, onExploreDemo, onNavigateTab }) {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showExtractedResult, setShowExtractedResult] = useState(true);

  const activeDemo = DEMO_PRESET_NOTICES[selectedDemoIndex];

  const handleTestDemo = (index) => {
    setSelectedDemoIndex(index);
    setIsExtracting(true);
    setShowExtractedResult(false);
    setTimeout(() => {
      setIsExtracting(false);
      setShowExtractedResult(true);
    }, 800);
  };

  const COMPARISON_ROWS = [
    { feature: "Notice Management", existing: "Scattered across WhatsApp, emails, portals", deadlineai: "Centralized unified dashboard" },
    { feature: "Document Reading", existing: "Manual reading of lengthy circulars", deadlineai: "AI-assisted structured extraction" },
    { feature: "Deadline Extraction", existing: "Manual date hunting & tracking", deadlineai: "Automatic date & time identification" },
    { feature: "Action Identification", existing: "Manual interpretation of next steps", deadlineai: "AI-generated 'What You Need To Do'" },
    { feature: "Notice Categorization", existing: "Manual sorting", deadlineai: "Automatic into Exam, Fees, Placement, etc." },
    { feature: "Reminder Creation", existing: "Manual calendar entry", deadlineai: "Suggested & automatic multi-channel alerts" },
    { feature: "Urgency / Priority Detection", existing: "Not available", deadlineai: "AI-based High / Medium / Low urgency" },
    { feature: "OCR Document Support", existing: "Limited or none", deadlineai: "Full support for PDF, PNG, JPG, JPEG" },
    { feature: "Deadline Conflict Detection", existing: "Not available (clashes go unnoticed)", deadlineai: "Smart conflict warning radar" },
    { feature: "Search & Filtering", existing: "Basic filename search", deadlineai: "Smart structured multi-tag search" }
  ];

  return (
    <div className="space-y-24 pb-20 animate-fadeIn">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* University Pill */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-amber-300 shadow-lg">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>MIT WORLD PEACE UNIVERSITY • PUNE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">School of Computer Science & Applications</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 leading-[1.1]">
            Never Miss an Academic Deadline Again.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            DeadlineAI transforms unstructured college circulars, scanned PDFs, and WhatsApp screenshots into actionable tasks answering two vital questions:
          </p>
        </div>

        {/* The 2 Core Questions Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          <div className="bg-zinc-900/90 border border-amber-500/40 p-5 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0"></div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Question #1</p>
            <h3 className="text-base font-black text-zinc-100 mt-1">What do I need to do?</h3>
            <p className="text-xs text-zinc-400 mt-1">AI identifies exact required actions (forms, fees, submissions, prerequisites).</p>
          </div>

          <div className="bg-zinc-900/90 border border-red-500/40 p-5 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="w-1.5 h-full bg-red-500 absolute left-0 top-0"></div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Question #2</p>
            <h3 className="text-base font-black text-zinc-100 mt-1">By when do I need to do it?</h3>
            <p className="text-xs text-zinc-400 mt-1">Extracts exact cutoff dates, times, and priority urgency with conflict alerts.</p>
          </div>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#live-demo"
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-bold px-7 py-4 rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Try Interactive Demo</span>
          </a>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto text-zinc-400 hover:text-zinc-200 text-xs font-bold px-4 py-3 transition underline"
          >
            Explore Dashboard as Guest →
          </button>
        </div>

        {/* Visual Workflow Preview Banner */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-4 text-zinc-400">
              <span className="font-mono text-amber-400 font-bold">● SYSTEM WORKFLOW IN ACTION</span>
              <span>Document Upload → OCR → AI Extraction → User Verification → Dashboard</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Input Notice (PDF/Image)</span>
                <p className="text-xs font-mono text-zinc-300 line-clamp-3">
                  "It is hereby informed that semester exam registration is live. Deadline is 28th Aug 2026. Min 75% attendance required."
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-amber-400 uppercase flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Action Extraction</span>
                </span>
                <p className="text-xs font-bold text-zinc-100">
                  ⚡ Fill online exam form on portal & submit receipt to Counter #2.
                </p>
              </div>

              <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Scheduled Output</span>
                <p className="text-xs font-mono text-zinc-200">
                  📅 Due: <strong className="text-amber-400">2026-08-28</strong> • High Urgency • Alert Scheduled
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 2. INTERACTIVE LIVE DEMO PARSER SECTION */}
      <section id="live-demo" className="px-4 sm:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-24">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
            <Cpu className="w-4 h-4" />
            <span>INTERACTIVE DEMO SANDBOX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-wide">
            Test The AI Extraction Engine Live
          </h2>
          <p className="text-xs text-zinc-400">
            Select a sample MIT-WPU academic notice below to see how OCR extracts raw text and AI generates actionable tasks in seconds.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {DEMO_PRESET_NOTICES.map((preset, idx) => (
            <button
              key={preset.presetKey}
              onClick={() => handleTestDemo(idx)}
              className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition flex flex-col justify-between ${
                selectedDemoIndex === idx
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="leading-snug">{preset.label}</span>
              <span className="text-[10px] font-mono text-zinc-500 mt-2 truncate">{preset.fileName}</span>
            </button>
          ))}
        </div>

        {/* Live Extraction Result Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Input Document:</span>
              <h3 className="text-sm font-bold text-zinc-100">{activeDemo.fileName} ({activeDemo.fileType})</h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>PyTesseract + Gemini LLM Ready</span>
              </span>
            </div>
          </div>

          {isExtracting ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-amber-400 animate-pulse">Running OCR Parsing & AI Action Extraction...</p>
            </div>
          ) : showExtractedResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Raw OCR Text */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>1. Raw OCR Extracted Text</span>
                </p>
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                  {activeDemo.rawOcrText}
                </div>
              </div>

              {/* Right: Structured AI Extraction */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Structured Actionable Output</span>
                </p>

                <div className="bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/40 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      activeDemo.data.priority === 'High' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {activeDemo.data.priority} Urgency
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      📅 Due: {activeDemo.data.dueDate}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-100">{activeDemo.data.title}</h4>

                  <div className="bg-black/80 border border-zinc-800 p-3 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-amber-400 mb-0.5">⚡ What You Need To Do:</p>
                    <p className="text-xs text-zinc-200 font-medium leading-relaxed">{activeDemo.data.actionRequired}</p>
                  </div>

                  {activeDemo.data.eligibility && (
                    <p className="text-[11px] text-zinc-400 font-mono">
                      <strong className="text-zinc-500">Eligibility:</strong> {activeDemo.data.eligibility}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onSignIn}
                    className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2.5 rounded-xl transition uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
                  >
                    <span>Add to My Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 3. EXISTING SYSTEM VS DEADLINEAI (From Page 4 in PDF) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
            <Layers className="w-4 h-4" />
            <span>COMPARATIVE ADVANTAGE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-wide">
            Existing System vs. DeadlineAI
          </h2>
          <p className="text-xs text-zinc-400">
            Why traditional calendars and manual notice reading fail college students, and how DeadlineAI solves information overload.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-4 sm:p-5">Feature Capability</th>
                  <th className="p-4 sm:p-5 text-red-400">Existing Manual System</th>
                  <th className="p-4 sm:p-5 text-amber-400">DeadlineAI (Proposed Solution)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition">
                    <td className="p-4 sm:p-5 font-bold text-zinc-100">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-zinc-400">{row.existing}</td>
                    <td className="p-4 sm:p-5 font-bold text-amber-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.deadlineai}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. CORE MODULES GRID (From Page 5 in PDF) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
            <BookOpen className="w-4 h-4" />
            <span>MAJOR SYSTEM MODULES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 uppercase tracking-wide">
            Engineered For Academic Excellence
          </h2>
          <p className="text-xs text-zinc-400">
            6 integrated modules built according to university project specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl w-fit">
              <ScanText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">1. OCR & Document Ingestion</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Accepts PDFs, PNG, JPG, and JPEG notices. Extracts embedded and scanned text using native PDF stream parsing & Tesseract OCR.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition">
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-2xl w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">2. AI Action Extraction Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              NLP and Gemini AI pinpoint specific action items, deadlines, eligibility requirements, and priority urgency from unstructured text.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition">
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-2xl w-fit">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">3. Smart Conflict Radar (USP)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Detects overlapping exam, fee, and assignment deadlines within close proximity and provides AI scheduling recommendations.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition">
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-2xl w-fit">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">4. Smart Categorization</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatically tags notices into Examination, Assignment, Fees, Events, Scholarship, Registration, Placement, or General.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl w-fit">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">5. Multi-Channel Reminders</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dispatches automated alerts before deadline cutoff via University Email, WhatsApp push, and browser notifications.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-2xl w-fit">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">6. Centralized Multi-View Hub</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track tasks across Card Stream, Kanban Board, Monthly Calendar, and Tabular Matrix with .ICS calendar export.
            </p>
          </div>

        </div>
      </section>

      {/* 5. PROJECT AUTHORS & UNIVERSITY FOOTER */}
      <footer className="border-t border-zinc-800/80 pt-12 px-4 sm:px-8 max-w-7xl mx-auto text-xs text-zinc-500 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <span className="text-base font-black text-zinc-200 uppercase">Deadline<span className="text-amber-500">AI</span></span>
              <span className="px-2 py-0.5 text-[9px] bg-amber-950 text-amber-300 border border-amber-800 rounded-full font-mono">MIT-WPU Mini-Project</span>
            </div>
            <p className="text-[11px] text-zinc-400">Department of Computer Science and Applications • 2025-2026</p>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-zinc-400 font-bold">Project Authors:</p>
            <p className="text-zinc-300 font-mono">Samay Jain (1272251075) • Shaurya Singh (1272251359) • Mrunal Jadhav (1272251274)</p>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 text-center text-[10px] text-zinc-600 font-mono">
          Dr. Vishwanath Karad MIT World Peace University, Pune - 411038
        </div>
      </footer>

    </div>
  );
}
