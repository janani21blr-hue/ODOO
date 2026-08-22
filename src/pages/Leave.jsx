import React, { useState, useEffect } from 'react';
import { getMyLeaves, applyLeave } from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  CalendarDays, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Calendar,
  Clock,
  FileText
} from 'lucide-react';

export default function Leave({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    remarks: '',
  });

  const fetchLeaves = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await getMyLeaves(user.user_id);
      // Sort latest first
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setLeaves(sorted);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchLeaves();
    }
  }, [user?.user_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return null;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setFeedback({ type: 'error', message: 'End date cannot be earlier than start date.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await applyLeave({
        user_id: user.user_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        remarks: formData.remarks,
      });
      setFeedback({ type: 'success', message: 'Leave application submitted successfully!' });
      setFormData({
        leave_type: 'Casual Leave',
        start_date: '',
        end_date: '',
        remarks: '',
      });
      fetchLeaves();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return (item.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  const daysCount = calculateDays();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-sm text-slate-500">
            Submit leave requests and monitor manager approval status
          </p>
        </div>
        <button
          onClick={fetchLeaves}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
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

      {/* Grid: Apply Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Apply Leave Form */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Apply for Leave</h2>
              <p className="text-xs text-slate-500">Submit a new request to HR</p>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Leave Type
              </label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              >
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Sick Leave">Sick / Medical Leave (SL)</option>
                <option value="Earned / Paid Leave">Earned / Paid Leave (PL)</option>
                <option value="Maternity / Paternity">Maternity / Paternity</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>

            {daysCount !== null && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-between text-xs text-teal-800">
                <span className="font-medium">Total Duration:</span>
                <span className="font-extrabold">{daysCount} Day{daysCount > 1 ? 's' : ''}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reason / Remarks
              </label>
              <textarea
                rows={3}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Explain the purpose of your leave..."
                className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition text-xs uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* My Requests List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          
          {/* List Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">My Leave Applications</h2>
              <p className="text-xs text-slate-500">Track and review past leave submissions</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              {['ALL', 'Pending', 'Approved', 'Rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    statusFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Type & Dates</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Employee Remarks</th>
                  <th className="px-6 py-3.5">Admin Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No leave requests found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-xs">{item.leave_type}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.start_date} → {item.end_date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate" title={item.remarks}>
                        {item.remarks || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-[200px]">
                        {item.admin_comment ? (
                          <div className="flex items-start space-x-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="truncate">{item.admin_comment}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No comments yet</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
