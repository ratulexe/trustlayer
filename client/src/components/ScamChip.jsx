import React from 'react';

export default function ScamChip({ emoji, label, subtext, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-xs shadow-xs flex items-start gap-2.5 group w-full"
    >
      <span className="text-lg shrink-0 mt-0.5">{emoji}</span>
      <div>
        <span className="font-bold text-slate-800 block group-hover:text-brand-600 transition font-display">
          {label}
        </span>
        <span className="text-[11px] text-slate-500 line-clamp-1">
          {subtext}
        </span>
      </div>
    </button>
  );
}
