import React, { useState } from 'react';

export default function AdminPortal({ categoryList, onAddCategory }) {
  const [newCatInput, setNewCatInput] = useState("");

  const handleAdd = () => {
    if (newCatInput.trim()) {
      onAddCategory(newCatInput.trim());
      setNewCatInput("");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-black text-zinc-100 uppercase tracking-wide">Administrator Portal</h1>
        <p className="text-xs text-zinc-400 mt-1">System usage statistics, global notice taxonomy, and engine activity metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Registered Students</p>
          <p className="text-3xl font-black text-zinc-100 font-mono mt-1">1,248</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Notices OCR Processed</p>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">4,892</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Action Extraction Accuracy</p>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">98.4%</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">Notice Taxonomy Manager</h3>
        
        <div className="flex gap-2 max-w-md">
          <input 
            type="text"
            placeholder="Enter new notice category..."
            value={newCatInput}
            onChange={e => setNewCatInput(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 flex-1 focus:outline-none focus:border-amber-500"
          />
          <button 
            onClick={handleAdd}
            className="bg-amber-500 text-black font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider"
          >
            Add Category
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {categoryList.map(cat => (
            <span key={cat} className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs text-zinc-300 font-mono">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}