import React, { useState, useEffect } from 'react';
import { getMyPayroll } from '../api';
import { 
  Receipt, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  RefreshCw, 
  AlertCircle,
  Building,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function Payroll({ user }) {
  const [payroll, setPayroll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPayroll = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyPayroll(user.user_id);
      setPayroll(data);
    } catch (err) {
      if (err.status === 404) {
        setPayroll(null);
      } else {
        setErrorMsg(err.message || 'Failed to load payroll details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchPayroll();
    }
  }, [user?.user_id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Payroll & Compensation
          </h1>
          <p className="text-sm text-slate-500">
            Read-only breakdown of your monthly compensation structure
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchPayroll}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {payroll && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Salary Slip</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!payroll && !isLoading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No Payroll Record Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your salary structure has not yet been initialized in the system. HR will configure your payroll profile shortly.
            </p>
          </div>
        </div>
      )}

      {payroll && (
        <div className="space-y-6">
          
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Basic Pay</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-800">
                ₹{payroll.basic_salary?.toLocaleString('en-IN') || '0.00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Base contractual salary</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Allowances</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-teal-600">
                + ₹{payroll.allowances?.toLocaleString('en-IN') || '0.00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">HRA, Medical & Special perks</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deductions</span>
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-rose-600">
                - ₹{payroll.deductions?.toLocaleString('en-IN') || '0.00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PF, Tax & statutory deductions</p>
            </div>

          </div>

          {/* Salary Slip Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 space-y-6">
            
            {/* Slip Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  D
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Dayflow HRMS</h2>
                  <p className="text-xs text-slate-500">Official Monthly Payslip</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Compensation Slip
                </span>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Employee ID: #{payroll.user_id}
                </p>
              </div>
            </div>

            {/* Slip Table Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Earnings column */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-2 border-b border-emerald-100 flex items-center justify-between">
                  <span>Earnings Breakdown</span>
                  <span>Amount (INR)</span>
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-600 font-medium">Basic Pay</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{payroll.basic_salary?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-600 font-medium">Allowances (HRA & Flexi)</span>
                    <span className="font-mono font-bold text-emerald-700">
                      + ₹{payroll.allowances?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between bg-emerald-50/50 px-2 rounded-lg font-bold">
                    <span className="text-emerald-900">Gross Monthly Earnings</span>
                    <span className="font-mono text-emerald-900">
                      ₹{((payroll.basic_salary || 0) + (payroll.allowances || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions column */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 pb-2 border-b border-rose-100 flex items-center justify-between">
                  <span>Deductions Breakdown</span>
                  <span>Amount (INR)</span>
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-600 font-medium">Provident Fund (PF) / TDS</span>
                    <span className="font-mono font-bold text-rose-600">
                      - ₹{payroll.deductions?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between bg-rose-50/50 px-2 rounded-lg font-bold">
                    <span className="text-rose-900">Total Deductions</span>
                    <span className="font-mono text-rose-900">
                      - ₹{(payroll.deductions || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Total Net Salary Box */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-700/15">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Total Take-Home Pay (Net Salary)
                </span>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Basic + Allowances - Deductions
                </p>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                ₹{payroll.net_salary?.toLocaleString('en-IN')}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
