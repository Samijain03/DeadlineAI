import React, { useState } from 'react';

export default function UploadStudio({ categoryList, onAddNotice, onNavigateDashboard }) {
  const [ocrStep, setOcrStep] = useState(0); // 0: Idle, 1: OCR, 2: AI Parse, 3: Confirm
  const [extractedForm, setExtractedForm] = useState({
    title: "Even Semester Tuition Fee Payment Notice",
    category: "Fees",
    actionRequired: "Pay remaining tuition fees on college ERP portal and store transaction receipt.",
    dueDate: "2026-08-30",
    priority: "High",
    eligibility: "All enrolled undergraduate & postgraduate students"
  });

  const handleRunOcrPipeline = () => {
    setOcrStep(1);
    setTimeout(() => setOcrStep(2), 1200);
    setTimeout(() => setOcrStep(3), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...extractedForm,
      status: "Upcoming",
      reminderSet: true,
      fileType: "PDF Document"
    };
    onAddNotice(newEntry);
    setOcrStep(0);
    onNavigateDashboard();
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-black text-zinc-100 uppercase tracking-wide">OCR & AI Extraction Studio</h1>
        <p className="text-xs text-zinc-400 mt-1">Upload unstructured PDFs, screenshots, or official notices to extract deadlines automatically.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-center font-mono text-[10px]">
        <div className={`py-2 rounded-lg ${ocrStep >= 0 ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500'}`}>1. Ingest Notice</div>
        <div className={`py-2 rounded-lg ${ocrStep >= 1 ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500'}`}>2. OCR & LLM Analysis</div>
        <div className={`py-2 rounded-lg ${ocrStep >= 3 ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500'}`}>3. Verify & Confirm</div>
      </div>

      {ocrStep < 3 ? (
        <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 transition-all bg-zinc-900/40 rounded-3xl p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-200">Drag & drop your notice document</h3>
            <p className="text-xs text-zinc-500 mt-1">Supported formats: PDF, PNG, JPG, JPEG (Tesseract Engine Enabled)</p>
          </div>

          {ocrStep > 0 ? (
            <div className="space-y-3 pt-4 max-w-xs mx-auto">
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className={`h-full bg-amber-500 transition-all duration-700 ${ocrStep === 1 ? 'w-1/2' : 'w-full'}`}></div>
              </div>
              <p className="text-xs font-mono text-amber-400 animate-pulse">
                {ocrStep === 1 ? "Processing OCR Text Extraction (PyTesseract)..." : "LLM Extracting Deadlines & Required Actions..."}
              </p>
            </div>
          ) : (
            <button 
              onClick={handleRunOcrPipeline}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              Simulate Document Parsing Pipeline
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="bg-amber-950/40 border border-amber-800/50 p-4 rounded-xl text-xs text-amber-300">
            <strong className="font-bold">Human Verification Required:</strong> AI has parsed the notice. Please verify or modify the extracted fields before committing to your dashboard database.
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Parsed Notice Title</label>
            <input 
              type="text" 
              value={extractedForm.title}
              onChange={e => setExtractedForm({...extractedForm, title: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-black text-amber-400 uppercase mb-1">⚡ Action Required (Extracted)</label>
            <textarea 
              rows="2"
              value={extractedForm.actionRequired}
              onChange={e => setExtractedForm({...extractedForm, actionRequired: e.target.value})}
              className="w-full bg-zinc-950 border border-amber-500/50 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Notice Category</label>
              <select 
                value={extractedForm.category}
                onChange={e => setExtractedForm({...extractedForm, category: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Priority Level</label>
              <select 
                value={extractedForm.priority}
                onChange={e => setExtractedForm({...extractedForm, priority: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Extracted Deadline Date</label>
              <input 
                type="date" 
                value={extractedForm.dueDate}
                onChange={e => setExtractedForm({...extractedForm, dueDate: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Eligibility Criteria</label>
              <input 
                type="text" 
                value={extractedForm.eligibility}
                onChange={e => setExtractedForm({...extractedForm, eligibility: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setOcrStep(0)}
              className="px-5 py-3 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:text-zinc-200"
            >
              Discard
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 rounded-xl text-xs font-black text-black bg-amber-500 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Confirm & Commit Deadline
            </button>
          </div>
        </form>
      )}
    </main>
  );
}