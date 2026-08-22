import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Clock, 
  CalendarDays, 
  Receipt, 
  LogOut, 
  Menu, 
  X, 
  Server, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { checkHealth } from '../api';
import SettingsModal from './SettingsModal';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(null);

  const checkStatus = async () => {
    const ok = await checkHealth();
    setIsOnline(ok);
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: CalendarDays },
    { id: 'payroll', label: 'Payroll', icon: Receipt },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="text-xl font-black">H</span>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                  Dayflow HRMS
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Employee
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Header Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Backend indicator / settings button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Click to check or change backend API URL"
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                  isOnline === true
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50'
                    : isOnline === false
                    ? 'border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  isOnline === true ? 'bg-emerald-500 animate-pulse' : isOnline === false ? 'bg-rose-500' : 'bg-slate-400'
                }`} />
                <span className="font-mono text-[11px]">API {isOnline ? 'Online' : isOnline === false ? 'Offline' : 'Connecting'}</span>
              </button>

              {/* User badge */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                  {user?.email ? user.email.charAt(0) : 'E'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                    {user?.email || `User #${user?.user_id}`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">ID: #{user?.user_id}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Server className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile dropdown nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">{user?.email}</p>
                <p className="text-[10px] text-slate-500">Employee ID: #{user?.user_id}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => checkStatus()}
      />
    </>
  );
}
