import React, { useState } from 'react';
import { login, signup } from '../api';
import { Lock, Mail, Shield, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { LogIn, UserPlus, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.role !== 'admin') {
          throw new Error('Access denied: Only accounts with "admin" role can access the Admin / HR Console.');
        }
        setSuccessMsg('Admin authentication successful! Redirecting...');
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(res, email);
        }, 400);
      } else {
        // Create an admin account
        const res = await signup(email, password, 'admin');
        setSuccessMsg('Admin account created! Redirecting...');
        const res = await signup(email, password, role);
        setSuccessMsg('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          onAuthSuccess(res, email);
        }, 400);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-2xl shadow-blue-500/30 mb-4 border border-blue-400/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin / HR Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-md w-full">
        
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/25 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employee Self-Service
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dayflow Human Resource Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          
          {/* Tabs */}
          <div className="flex p-1 bg-slate-800/80 rounded-2xl mb-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-2 ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center space-x-2 ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-2 ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Admin</span>
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center space-x-2 ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-start space-x-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-medium flex items-start space-x-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-start space-x-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-start space-x-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-800/80 rounded-xl border border-slate-700 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm text-white placeholder-slate-500 transition"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50/50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-800/80 rounded-xl border border-slate-700 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm text-white placeholder-slate-500 transition"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50/50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-60 flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isLogin ? 'Sign In as Administrator' : 'Create Admin Account'}</span>
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          🔒 Dayflow HRMS Admin Gateway • Direct API Connection
        </p>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Account Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition appearance-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <span>Sign In to Portal</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          🔒 Secure connection directly to Dayflow Backend API
        </p>
      </div>
    </div>
  );
}
