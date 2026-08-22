import React, { useState } from 'react';
import { getBackendUrl, setBackendUrl, DEFAULT_BACKEND_URL, checkHealth } from '../api';
import { Settings, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [url, setUrl] = useState(getBackendUrl());
  const [status, setStatus] = useState(null); // 'checking' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleTest = async () => {
    setStatus('checking');
    setStatusMsg('Testing connection...');
    try {
      // Temporarily store the testing url in localStorage
      const original = getBackendUrl();
      setBackendUrl(url);
      const isOk = await checkHealth();
      if (isOk) {
        setStatus('success');
        setStatusMsg('Successfully connected to backend API!');
      } else {
        setStatus('error');
        setStatusMsg('Could not reach backend at this address. Check tunnel or URL.');
      }
      setBackendUrl(original);
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.message || 'Connection failed.');
    }
  };

  const handleSave = () => {
    setBackendUrl(url);
    if (onSave) onSave(url);
    onClose();
  };

  const handleReset = () => {
    setUrl(DEFAULT_BACKEND_URL);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Backend API Settings</h3>
            <p className="text-xs text-slate-500">Configure the server endpoint for this session</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Backend Base URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setStatus(null);
              }}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono"
            />
            <div className="flex justify-between items-center mt-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-emerald-600 hover:underline font-medium"
              >
                Reset to default ngrok URL
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={status === 'checking'}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                status === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : status === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />}
              {status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />}
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
