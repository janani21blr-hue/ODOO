import React, { useState, useEffect } from 'react';
import { getAllAttendance } from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AttendanceManagement() {
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchRecords = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getAllAttendance();
      // Sort latest date and ID first
      const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
      setAttendances(sorted);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch attendance ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

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

  const filteredRecords = attendances.filter((rec) => {
    if (searchUserId && rec.user_id.toString() !== searchUserId.trim()) {
      return false;
    }
    if (filterDate && rec.date !== filterDate) {
      return false;
    }
    if (filterStatus !== 'ALL' && (rec.status || '').toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Organization Attendance Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Monitor employee daily check-in, check-out and work hours
          </p>
        </div>

        <button
          onClick={fetchRecords}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Ledger</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          
          {/* User ID Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="Search by User ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half-Day</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center space-x-2">
            {(searchUserId || filterDate || filterStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchUserId('');
                  setFilterDate('');
                  setFilterStatus('ALL');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Clear Filters
              </button>
            )}
            <span className="text-xs text-slate-400 font-mono ml-auto">
              Showing {filteredRecords.length} of {attendances.length} records
            </span>
          </div>

        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Record ID</th>
                <th className="px-6 py-4">Employee (User ID)</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No attendance records found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-mono text-slate-500">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-xs">
                          {item.user_id}
                        </div>
                        <span className="font-bold text-white">Employee #{item.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {item.date}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {formatTime(item.check_in)}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {formatTime(item.check_out)}
                    </td>
                    <td className="px-6 py-4 font-bold text-white font-mono">
                      {calculateHours(item.check_in, item.check_out)}
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
