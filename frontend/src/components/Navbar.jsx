import React from 'react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isAuthenticated, 
  setIsAuthenticated, 
  setShowAuthModal, 
  reminderCount 
}) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-black border border-amber-500/60 flex items-center justify-center text-amber-500 font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          D<span className="text-red-500">AI</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black tracking-wider text-zinc-100 uppercase">
              Deadline<span className="text-amber-500">AI</span>
            </span>
            <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-widest text-red-400 bg-red-950/80 border border-red-800/60 rounded-full uppercase">
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono tracking-tight">Intelligent Notice & Action Engine</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center bg-black/80 p-1 border border-zinc-800/90 rounded-xl space-x-1">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'dashboard' 
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'upload' 
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <span>OCR Studio</span>
        </button>

        <button 
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'reminders' 
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span>Alerts ({reminderCount})</span>
        </button>

        <button 
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'admin' 
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span>Admin Portal</span>
        </button>
      </div>

      {/* User Auth Action Trigger */}
      <div>
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center border border-red-400">
              SJ
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100">Samay Jain</p>
              <p className="text-[10px] text-zinc-500 font-mono">Student ID: 1272251075</p>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-[10px] text-zinc-500 hover:text-red-400 ml-2 font-mono">
              Exit
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.25)] uppercase tracking-wider"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}