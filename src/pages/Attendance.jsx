import React, { useState, useEffect } from 'react';
import { getMyAttendance, checkIn, checkOut } from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  Search
} from 'lucide-react';

export default function Attendance({ user }) {
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterDate, setFilterDate] = useState('');

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await getMyAttendance(user.user_id);
      // Sort newest date first
      const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendances(sorted);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchAttendance();
    }
  }, [user?.user_id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendances.find((a) => a.date === todayStr);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await checkIn(user.user_id);
      setFeedback({ type: 'success', message: 'Check-in successful! Timestamp recorded.' });
      fetchAttendance();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await checkOut(user.user_id);
      setFeedback({ type: 'success', message: 'Check-out successful! Attendance complete for today.' });
      fetchAttendance();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '-';
    const diffMs = new Date(outTime) - new Date(inTime);
    if (diffMs <= 0) return '-';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredAttendances = attendances.filter((att) => {
    if (!filterDate) return true;
    return att.date === filterDate;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Attendance
          </h1>
          <p className="text-sm text-slate-500">
            Record daily work shifts and track your attendance ledger
          </p>
        </div>
        <button
          onClick={fetchAttendance}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Clock & Action Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Real-time Clock Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Live System Time</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {currentTime.toLocaleTimeString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Status Today</span>
            {todayRecord ? (
              todayRecord.check_out ? (
                <span className="text-emerald-400 font-semibold">Shift Completed</span>
              ) : (
                <span className="text-amber-400 font-semibold">Currently Clocked In</span>
              )
            ) : (
              <span className="text-slate-400 font-semibold">Not Started</span>
            )}
          </div>
        </div>

        {/* Check In Action Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Check In</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LogIn className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {todayRecord ? formatTime(todayRecord.check_in) : '--:--:--'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {todayRecord ? 'Checked in successfully today' : 'Start your shift for today'}
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || Boolean(todayRecord)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              <span>{todayRecord ? 'Already Checked In' : 'Punch In Now'}</span>
            </button>
          </div>
        </div>

        {/* Check Out Action Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Check Out</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {todayRecord?.check_out ? formatTime(todayRecord.check_out) : '--:--:--'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {todayRecord?.check_out ? 'Shift completed' : 'Punch out when leaving for the day'}
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !todayRecord || Boolean(todayRecord.check_out)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>{todayRecord?.check_out ? 'Already Checked Out' : 'Punch Out Now'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Attendance History</h2>
            <p className="text-xs text-slate-500">Log of your historical check-in and check-out punches</p>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Check-In Time</th>
                <th className="px-6 py-3.5">Check-Out Time</th>
                <th className="px-6 py-3.5">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {filterDate ? 'No attendance records found for this date.' : 'No attendance records found.'}
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => (
                  <tr key={att.id || att.date} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800 font-mono">
                      {att.date}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={att.status || 'present'} />
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-mono">
                      {formatTime(att.check_in)}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-mono">
                      {formatTime(att.check_out)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {calculateHours(att.check_in, att.check_out)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
