import React, { useState, useEffect } from 'react';
import { getAllPayroll, setPayroll } from '../api';
import { 
  Banknote, 
  Plus, 
  Search, 
  RefreshCw, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Edit3, 
  Calculator,
  Building
} from 'lucide-react';

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [searchUserId, setSearchUserId] = useState('');
  
  // Modal for Create/Update Payroll
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    basic_salary: '',
    allowances: '',
    deductions: '',
  });

  const fetchPayrolls = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await getAllPayroll();
      // Sort by user_id
      const sorted = (data || []).sort((a, b) => a.user_id - b.user_id);
      setPayrolls(sorted);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch payroll structures.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleOpenAddModal = (existing = null) => {
    if (existing) {
      setFormData({
        user_id: existing.user_id.toString(),
        basic_salary: existing.basic_salary.toString(),
        allowances: (existing.allowances || 0).toString(),
        deductions: (existing.deductions || 0).toString(),
      });
    } else {
      setFormData({
        user_id: '',
        basic_salary: '',
        allowances: '0',
        deductions: '0',
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateNet = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const allow = parseFloat(formData.allowances) || 0;
    const ded = parseFloat(formData.deductions) || 0;
    return basic + allow - ded;
  };

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.basic_salary) {
      setFeedback({ type: 'error', message: 'Employee ID and Basic Salary are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await setPayroll({
        user_id: parseInt(formData.user_id, 10),
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances || 0),
        deductions: parseFloat(formData.deductions || 0),
      });
      setFeedback({ type: 'success', message: `Payroll record for Employee #${formData.user_id} saved successfully!` });
      setIsModalOpen(false);
      fetchPayrolls();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update payroll structure.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayrolls = payrolls.filter((p) => {
    if (searchUserId && p.user_id.toString() !== searchUserId.trim()) {
      return false;
    }
    return true;
  });

  const totalMonthlySpend = payrolls.reduce((acc, curr) => acc + (curr.net_salary || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Payroll & Compensation Administration
          </h1>
          <p className="text-xs text-slate-400">
            Configure employee compensation, salary structures and statutory deductions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPayrolls}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Set Employee Salary</span>
          </button>
        </div>
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

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Configured Structures</span>
          <p className="text-2xl font-black text-white mt-1">{payrolls.length} Employees</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monthly Expenditure</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹{totalMonthlySpend.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Net Salary</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            ₹{payrolls.length ? Math.round(totalMonthlySpend / payrolls.length).toLocaleString('en-IN') : '0'}
          </p>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="Search by Employee ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredPayrolls.length} record{filteredPayrolls.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Basic Salary</th>
                <th className="px-6 py-4">Allowances</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Take-Home Pay</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No payroll records configured yet. Click "Set Employee Salary" to create one.
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => (
                  <tr key={p.id || p.user_id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                          {p.user_id}
                        </div>
                        <span>Employee #{p.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-200">
                      ₹{p.basic_salary?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400">
                      + ₹{p.allowances?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 font-mono text-rose-400">
                      - ₹{p.deductions?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 font-mono font-extrabold text-white text-sm">
                      ₹{p.net_salary?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenAddModal(p)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs transition inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Structure</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Banknote className="w-5 h-5 text-blue-400" />
              <span>Configure Employee Salary</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Set contractual base pay, monthly allowances, and tax deductions
            </p>

            <form onSubmit={handleSavePayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Employee User ID
                </label>
                <input
                  type="number"
                  required
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleFormChange}
                  placeholder="e.g. 1"
                  className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Basic Monthly Salary (INR)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleFormChange}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Allowances (+)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleFormChange}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Deductions (-)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleFormChange}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Calculated preview */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Calculated Net Salary</span>
                  <span className="text-slate-400">Basic + Allowances - Deductions</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₹{calculateNet().toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Salary Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
