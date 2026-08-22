import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthModal({ show, onClose, onSuccess, onNotify }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('samay.jain@mitwpu.edu.in');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Samay Jain');
  const [studentId, setStudentId] = useState('1272251075');
  const [department, setDepartment] = useState('School of Computer Science & Applications');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess();
    onClose();
    if (onNotify) onNotify("Authenticated Successfully", `Welcome back, ${name} (PRN: ${studentId})`, "success");
  };

  const handleQuickDemoFill = (type) => {
    if (type === 'student') {
      setEmail('samay.jain@mitwpu.edu.in');
      setName('Samay Jain');
      setStudentId('1272251075');
      setDepartment('School of Computer Science & Applications');
    } else {
      setEmail('coordinator@mitwpu.edu.in');
      setName('Dr. S. Kulkarni (Dept Coordinator)');
      setStudentId('EMP-8821');
      setDepartment('Department of CS & Applications');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center mb-2 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-zinc-100 uppercase tracking-wide">
            {authMode === 'login' ? 'University Sign In' : 'Register Student ID'}
          </h3>
          <p className="text-xs text-zinc-400">MIT World Peace University • DeadlineAI Portal</p>
        </div>

        {/* Demo Fast Account Switcher */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>1-Click Demo Profiles:</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('student')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-amber-500 text-[11px] font-bold text-zinc-300 hover:text-amber-400 transition truncate"
            >
              🎓 Student (Samay Jain)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-amber-500 text-[11px] font-bold text-zinc-300 hover:text-amber-400 transition truncate"
            >
              🛡️ Coordinator (Prof)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Student PRN / ID</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none font-mono" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Department</label>
                <select 
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="School of Computer Science & Applications">School of Computer Science & Applications</option>
                  <option value="Department of AI & Data Science">Department of AI & Data Science</option>
                  <option value="Department of Electronics Engineering">Department of Electronics Engineering</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">University Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none font-mono" 
              required 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.25)] mt-2"
          >
            {authMode === 'login' ? 'Authenticate & Enter' : 'Create Student Account'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-1">
          {authMode === 'login' ? (
            <p>New student? <button onClick={() => setAuthMode('register')} className="text-amber-400 font-bold hover:underline">Create an account</button></p>
          ) : (
            <p>Already registered? <button onClick={() => setAuthMode('login')} className="text-amber-400 font-bold hover:underline">Sign in here</button></p>
          )}
        </div>

      </div>
    </div>
  );
}