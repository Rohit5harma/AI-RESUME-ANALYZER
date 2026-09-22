import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-900",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-900",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  }[type] || {
    bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 max-w-md animate-in fade-in slide-in-from-bottom-5">
      <div className={`flex items-center gap-3 p-3 rounded-xl border w-full ${config.bg}`}>
        {config.icon}
        <div className="text-sm font-medium pr-2 flex-1">{message}</div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
