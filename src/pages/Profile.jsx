import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Image, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Profile({ user }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    job_title: '',
    department: '',
    profile_pic_url: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await getProfile(user.user_id);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        job_title: data.job_title || '',
        department: data.department || '',
        profile_pic_url: data.profile_pic_url || '',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchProfile();
    }
  }, [user?.user_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await updateProfile(user.user_id, formData);
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setFormData({
        full_name: updated.full_name || '',
        phone: updated.phone || '',
        address: updated.address || '',
        job_title: updated.job_title || '',
        department: updated.department || '',
        profile_pic_url: updated.profile_pic_url || '',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Personal Profile
          </h1>
          <p className="text-sm text-slate-500">
            View and update your employment and contact details
          </p>
        </div>
        <button
          onClick={fetchProfile}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
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

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Top Avatar Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-28 px-8 flex items-end">
          <div className="translate-y-8 flex items-end space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100">
              {formData.profile_pic_url ? (
                <img
                  src={formData.profile_pic_url}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-2xl">
                  {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-slate-800 leading-none">
                {formData.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {user?.email} • Employee #{user?.user_id}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-12 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Job Title / Designation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering / Product"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Residential Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 pt-3 pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Innovation Way, Tech Park, Bangalore"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Profile Pic URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Profile Picture URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Image className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="profile_pic_url"
                    value={formData.profile_pic_url}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  />
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
