import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payroll from './pages/Payroll';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const savedUserId = localStorage.getItem('hrms_user_id');
    const savedRole = localStorage.getItem('hrms_user_role');
    const savedEmail = localStorage.getItem('hrms_user_email');

    if (savedUserId && savedRole) {
      setUser({
        user_id: parseInt(savedUserId, 10),
        role: savedRole,
        email: savedEmail || `User #${savedUserId}`,
      });
    }
    setIsInitializing(false);
  }, []);

  const handleAuthSuccess = (authData, email) => {
    localStorage.setItem('hrms_user_id', authData.user_id.toString());
    localStorage.setItem('hrms_user_role', authData.role);
    if (email) localStorage.setItem('hrms_user_email', email);

    setUser({
      user_id: authData.user_id,
      role: authData.role,
      email: email || `User #${authData.user_id}`,
    });
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('hrms_user_id');
    localStorage.removeItem('hrms_user_role');
    localStorage.removeItem('hrms_user_email');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard user={user} onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'profile' && <Profile user={user} />}
        {activeTab === 'attendance' && <Attendance user={user} />}
        {activeTab === 'leave' && <Leave user={user} />}
        {activeTab === 'payroll' && <Payroll user={user} />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Dayflow HRMS • Employee Portal • Connected to Live Backend
      </footer>
    </div>
  );
}
