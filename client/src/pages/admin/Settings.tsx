import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    min_attendance_percentage: '75',
    academic_year: '2024-2025',
    institution_name: 'Apex Institute of Technology & University'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      setSettings(res.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSuccess('System settings updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure attendance thresholds, institution branding, and academic session rules</p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Minimum Attendance Requirement (%)
            </label>
            <input
              type="number"
              min="50"
              max="95"
              value={settings.min_attendance_percentage || '75'}
              onChange={(e) => setSettings({ ...settings, min_attendance_percentage: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Students falling below this threshold receive warning notifications and appear on academic debarment reports. (Standard: 75%)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Active Academic Year
            </label>
            <input
              type="text"
              value={settings.academic_year || '2024-2025'}
              onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Institution Name
            </label>
            <input
              type="text"
              value={settings.institution_name || 'Apex Institute of Technology & University'}
              onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
