import React, { useState, useEffect } from 'react';
import { Clock, Shield, Sparkles } from 'lucide-react';

export default function Header({ activeTab, user }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titles = {
    dashboard: { title: 'Executive Overview', subtitle: 'Real-time metrics, approvals queue and organization KPIs' },
    attendance: { title: 'Attendance Ledger', subtitle: 'Complete log of employee daily check-in and check-out records' },
    leaves: { title: 'Leave Approvals', subtitle: 'Review, approve, or reject employee leave applications' },
    payroll: { title: 'Payroll Administration', subtitle: 'Manage salary structures, allowances, and compensation' },
  };

  const current = titles[activeTab] || { title: 'Admin Console', subtitle: 'Human Resource Management System' };

  return (
    <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 sm:px-8 py-4 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>{current.title}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Real-time system clock pill */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-white">
            {time.toLocaleTimeString()}
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            ({time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
          </span>
        </div>
      </div>
    </header>
  );
}
