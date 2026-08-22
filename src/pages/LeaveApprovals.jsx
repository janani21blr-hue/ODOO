import React, { useState, useEffect } from 'react';
import { getAllLeaves, approveLeave, rejectLeave, actOnLeave } from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  CheckSquare, 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchUserId, setSearchUserId] = useState('');
  
  // Modal for admin decision with comment
  const [activeModal, setActiveModal] = useState(null); // { leave, action: 'approve' | 'reject' }
  const [commentText, setCommentText] = useState('');

  const fetchLeaves = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await getAllLeaves();
      // Sort newest ID first
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setLeaves(sorted);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch leave requests.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openDecisionModal = (leave, action) => {
    setActiveModal({ leave, action });
    setCommentText('');
  };

  const handleConfirmDecision = async () => {
    if (!activeModal) return;
    const { leave, action } = activeModal;
    setActionLoadingId(leave.id);
    setFeedback(null);

    try {
      if (action === 'approve') {
        await approveLeave(leave.id, commentText || 'Approved by HR Administrator');
        setFeedback({ type: 'success', message: `Leave request #${leave.id} successfully approved!` });
      } else {
        await rejectLeave(leave.id, commentText || 'Rejected by HR Administrator');
        setFeedback({ type: 'success', message: `Leave request #${leave.id} has been rejected.` });
      }
      setActiveModal(null);
      fetchLeaves();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? `${diffDays} Day${diffDays > 1 ? 's' : ''}` : '-';
  };

  const filteredLeaves = leaves.filter((item) => {
    if (statusFilter !== 'ALL' && (item.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchUserId && item.user_id.toString() !== searchUserId.trim()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Leave Approvals Management
          </h1>
          <p className="text-xs text-slate-400">
            Review and take decisions on employee time-off and leave applications
          </p>
        </div>

        <button
          onClick={fetchLeaves}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Requests</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 w-full sm:w-auto">
            {['ALL', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* User ID search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="Filter by Employee ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Duration & Dates</th>
                <th className="px-6 py-4">Employee Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Admin Remarks</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((item) => {
                  const isPending = (item.status || '').toLowerCase() === 'pending';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-mono text-slate-500 font-bold">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                            {item.user_id}
                          </div>
                          <span>Employee #{item.user_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-400">
                        {item.leave_type}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-200">{item.start_date} → {item.end_date}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {calculateDays(item.start_date, item.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-[180px] truncate" title={item.remarks}>
                        {item.remarks || <span className="text-slate-500 italic">None provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-[180px]">
                        {item.admin_comment ? (
                          <div className="flex items-start space-x-1.5 text-xs text-slate-300 bg-slate-800 p-2 rounded-xl border border-slate-700">
                            <MessageSquare className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                            <span className="truncate">{item.admin_comment}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openDecisionModal(item, 'approve')}
                              disabled={actionLoadingId === item.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => openDecisionModal(item, 'reject')}
                              disabled={actionLoadingId === item.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center space-x-1 shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>
                {activeModal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Reviewing Leave #{activeModal.leave.id} for Employee #{activeModal.leave.user_id} ({activeModal.leave.leave_type})
            </p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                <p><strong className="text-slate-300">Duration:</strong> {activeModal.leave.start_date} → {activeModal.leave.end_date}</p>
                {activeModal.leave.remarks && (
                  <p><strong className="text-slate-300">Reason:</strong> "{activeModal.leave.remarks}"</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Remarks / Feedback
                </label>
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    activeModal.action === 'approve'
                      ? 'e.g. Approved. Please ensure tasks are delegated.'
                      : 'e.g. Denied due to team availability constraints.'
                  }
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition ${
                    activeModal.action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  Confirm {activeModal.action === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
