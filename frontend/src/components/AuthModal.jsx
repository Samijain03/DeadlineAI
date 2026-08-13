import React, { useState } from 'react';

export default function AuthModal({ show, onClose, onSuccess }) {
  const [authMode, setAuthMode] = useState('login');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wide">
            {authMode === 'login' ? 'Student Sign In' : 'Register Account'}
          </h3>
          <p className="text-xs text-zinc-400">Access your DeadlineAI notice dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Email Address</label>
            <input type="email" placeholder="student@mitwpu.edu.in" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none" required />
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none" required />
          </div>

          <button type="submit" className="w-full bg-amber-500 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            {authMode === 'login' ? 'Authenticate' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          {authMode === 'login' ? (
            <p>New user? <button onClick={() => setAuthMode('register')} className="text-amber-400 font-bold">Register here</button></p>
          ) : (
            <p>Registered already? <button onClick={() => setAuthMode('login')} className="text-amber-400 font-bold">Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}