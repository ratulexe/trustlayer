import React from 'react';

export default function ScamChip({ icon, emoji, label, subtext, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-3 text-left rounded-xl bg-white hover:bg-[#F8FAFC] border border-slate-200/80 hover:border-slate-300 transition text-xs shadow-[0_1px_3px_rgba(23,37,84,0.03)] hover:shadow-[0_4px_12px_-2px_rgba(23,37,84,0.06)] flex items-start gap-3 group w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#172554] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-blue-50/50 group-hover:border-blue-300 group-hover:text-blue-600 transition">
        {icon ? icon : <span className="text-sm shrink-0">{emoji}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-bold text-[#111827] block group-hover:text-blue-600 transition font-display truncate">
          {label}
        </span>
        <span className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
          {subtext}
        </span>
      </div>
    </button>
  );
}
