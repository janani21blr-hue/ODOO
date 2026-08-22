import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CheckSquare, 
  Banknote, 
  LogOut, 
  ShieldCheck, 
  Server, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { checkHealth } from '../api';
import SettingsModal from './SettingsModal';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(null);

  const checkStatus = async () => {
    const ok = await checkHealth();
    setIsOnline(ok);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Ledger', icon: Clock },
    { id: 'leaves', label: 'Leave Approvals', icon: CheckSquare },
    { id: 'payroll', label: 'Payroll Management', icon: Banknote },
  ];

  return (
    <>
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        
        {/* Top brand & nav */}
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
              H
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Dayflow HRMS
              </h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <span className="block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Management Menus
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom system status & profile */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          
          {/* API Server status button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs transition"
          >
            <div className="flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-mono text-[11px]">API Server</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${
                isOnline === true ? 'bg-emerald-400 animate-pulse' : isOnline === false ? 'bg-rose-400' : 'bg-slate-400'
              }`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {isOnline === true ? 'Online' : isOnline === false ? 'Offline' : '...'}
              </span>
            </div>
          </button>

          {/* User badge */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.email || 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Role: <span className="text-blue-400 font-bold uppercase">{user?.role}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign out of Admin Console"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => checkStatus()}
      />
    </>
  );
}
