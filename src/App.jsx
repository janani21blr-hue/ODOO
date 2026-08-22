import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveApprovals from './pages/LeaveApprovals';
import PayrollManagement from './pages/PayrollManagement';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('hrms_admin_user_id');
    const savedRole = localStorage.getItem('hrms_admin_role');
    const savedEmail = localStorage.getItem('hrms_admin_email');

    if (savedUserId && savedRole === 'admin') {
      setUser({
        user_id: parseInt(savedUserId, 10),
        role: savedRole,
        email: savedEmail || `Admin #${savedUserId}`,
      });
    }
    setIsInitializing(false);
  }, []);

  const handleAuthSuccess = (authData, email) => {
    localStorage.setItem('hrms_admin_user_id', authData.user_id.toString());
    localStorage.setItem('hrms_admin_role', authData.role);
    if (email) localStorage.setItem('hrms_admin_email', email);

    setUser({
      user_id: authData.user_id,
      role: authData.role,
      email: email || `Admin #${authData.user_id}`,
    });
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('hrms_admin_user_id');
    localStorage.removeItem('hrms_admin_role');
    localStorage.removeItem('hrms_admin_email');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} user={user} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'leaves' && <LeaveApprovals />}
          {activeTab === 'payroll' && <PayrollManagement />}
        </main>

        <footer className="border-t border-slate-800/80 px-8 py-4 text-center text-xs text-slate-500">
          Dayflow HRMS • Admin Management Console • Connected to FastAPI Backend
        </footer>
      </div>
    </div>
  );
}
