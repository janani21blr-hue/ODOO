import React, { useState, useEffect } from 'react';
import { 
  getAllAttendance, 
  getAllLeaves, 
  getAllPayroll, 
  approveLeave, 
  rejectLeave 
} from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  Clock, 
  CheckSquare, 
  Banknote, 
  Users, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Check, 
  X, 
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [commentModal, setCommentModal] = useState(null); // { id, action }
  const [adminComment, setAdminComment] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [attRes, leavesRes, payRes] = await Promise.allSettled([
        getAllAttendance(),
        getAllLeaves(),
        getAllPayroll(),
      ]);

      if (attRes.status === 'fulfilled') setAttendances(attRes.value || []);
      if (leavesRes.status === 'fulfilled') setLeaves(leavesRes.value || []);
      if (payRes.status === 'fulfilled') setPayrolls(payRes.value || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const pendingLeaves = leaves.filter((l) => (l.status || '').toLowerCase() === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((a) => a.date === todayStr);

  const totalPayrollExpenditure = payrolls.reduce((acc, curr) => acc + (curr.net_salary || 0), 0);

  const handleQuickAction = async (leaveId, action) => {
    setActionLoadingId(leaveId);
    setFeedback(null);
    try {
      if (action === 'approve') {
        await approveLeave(leaveId, 'Approved via Admin Quick Queue');
        setFeedback({ type: 'success', message: `Leave #${leaveId} approved successfully!` });
      } else {
        await rejectLeave(leaveId, 'Rejected via Admin Quick Queue');
        setFeedback({ type: 'success', message: `Leave #${leaveId} rejected.` });
      }
      fetchAdminData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenCommentModal = (leave, action) => {
    setCommentModal({ leave, action });
    setAdminComment('');
  };

  const handleConfirmActionWithComment = async () => {
    if (!commentModal) return;
    setActionLoadingId(commentModal.leave.id);
    setFeedback(null);
    try {
      if (commentModal.action === 'approve') {
        await approveLeave(commentModal.leave.id, adminComment || 'Approved by Admin');
        setFeedback({ type: 'success', message: `Leave #${commentModal.leave.id} approved!` });
      } else {
        await rejectLeave(commentModal.leave.id, adminComment || 'Rejected by Admin');
        setFeedback({ type: 'success', message: `Leave #${commentModal.leave.id} rejected.` });
      }
      setCommentModal(null);
      fetchAdminData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Organization Status Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            System overview and instant approval queue
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Pending Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Leaves</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{pendingLeaves.length}</p>
          <p className="text-[11px] text-amber-400 mt-1 font-medium">Requires admin decision</p>
        </div>

        {/* Total Leaves */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leave Records</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{leaves.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">All applications submitted</p>
        </div>

        {/* Attendance Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Check-Ins</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{todayAttendances.length}</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Employees present today</p>
        </div>

        {/* Total Payroll */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Net Payroll</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white truncate">₹{totalPayrollExpenditure.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-cyan-400 mt-1 font-medium">{payrolls.length} active structures</p>
        </div>

      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Approvals Action Queue (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Pending Leave Queue</h2>
            </div>
            <button
              onClick={() => onNavigate('leaves')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Full Approvals Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              🎉 No pending leave requests! All applications have been reviewed.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800 transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">
                        User #{req.user_id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium">
                        {req.leave_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {req.start_date} → {req.end_date}
                    </p>
                    {req.remarks && (
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{req.remarks}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleOpenCommentModal(req, 'approve')}
                      disabled={actionLoadingId === req.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleOpenCommentModal(req, 'reject')}
                      disabled={actionLoadingId === req.id}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Nav & Stats Shortcuts (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Management Modules
            </h2>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition group"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Attendance Ledger</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => onNavigate('leaves')}
                className="w-full p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition group"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Leave Approvals</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => onNavigate('payroll')}
                className="w-full p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition group"
              >
                <div className="flex items-center space-x-3">
                  <Banknote className="w-4 h-4 text-cyan-400" />
                  <span>Payroll Management</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Decision with Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-1 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>
                {commentModal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Leave #{commentModal.leave.id} for Employee #{commentModal.leave.user_id} ({commentModal.leave.leave_type})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Remarks / Comment (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder={
                    commentModal.action === 'approve'
                      ? 'e.g. Approved. Ensure handover is completed.'
                      : 'e.g. Insufficient leave balance or critical sprint deadline.'
                  }
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCommentModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmActionWithComment}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition ${
                    commentModal.action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {commentModal.action === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
