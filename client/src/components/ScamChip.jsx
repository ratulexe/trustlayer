import React from 'react';

export default function ScamChip({ icon: Icon, label, subtext, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-xs shadow-xs flex items-start gap-2.5 group w-full"
    >
      <div className="w-8 h-8 rounded-lg bg-surface border border-slate-200 text-slate-700 group-hover:text-brand-600 flex items-center justify-center shrink-0 mt-0.5 transition shadow-2xs">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div>
        <span className="font-bold text-slate-800 block group-hover:text-brand-600 transition font-display">
          {label}
        </span>
        <span className="text-xs text-slate-500 line-clamp-1">
          {subtext}
        </span>
      </div>
    </button>
  );
}
