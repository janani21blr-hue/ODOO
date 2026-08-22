import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'approved' || normalized === 'present') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400"></span>
        {status}
      </span>
    );
  }

  if (normalized === 'pending' || normalized === 'half-day') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        {status}
      </span>
    );
  }

  if (normalized === 'rejected' || normalized === 'absent') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-400"></span>
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300">
      {status || 'N/A'}
    </span>
  );
}
