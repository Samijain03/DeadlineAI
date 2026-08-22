import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onCloseToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 flex items-start space-x-3 ${
              isSuccess
                ? 'bg-zinc-900/95 border-emerald-500/50 text-zinc-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : isWarning
                ? 'bg-zinc-900/95 border-amber-500/60 text-zinc-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : isError
                ? 'bg-zinc-900/95 border-red-500/60 text-zinc-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-zinc-900/95 border-zinc-700 text-zinc-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isError && <AlertTriangle className="w-5 h-5 text-red-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs">
              <p className="font-bold text-zinc-100">{toast.title}</p>
              {toast.message && <p className="text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>

            <button
              onClick={() => onCloseToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-200 transition shrink-0 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
