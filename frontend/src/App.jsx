import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide text-indigo-400">DeadlineAI</h1>
        <div className="space-x-4 text-sm text-slate-300">
          <button className="hover:text-white">Dashboard</button>
          <button className="hover:text-white">Upload Notice</button>
          <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md font-medium text-white">Sign In</button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold">Academic Dashboard</h2>
          <p className="text-slate-400 text-sm">Track your extracted deadlines and pending actions.</p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase">Upcoming Deadlines</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase">Pending Actions</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase">Completed Tasks</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
        </div>

        {/* Notice Upload Placeholder */}
        <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-indigo-500 transition cursor-pointer">
          <p className="text-slate-300 font-medium">Drag & drop your notice document (PDF, PNG, JPG)</p>
          <p className="text-xs text-slate-500 mt-1">Upload notices to extract deadlines automatically</p>
        </div>
      </main>
    </div>
  );
}