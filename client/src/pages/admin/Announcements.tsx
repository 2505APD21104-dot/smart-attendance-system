import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BellRing, Send, CheckCircle2, AlertTriangle, Info, Calendar } from 'lucide-react';

export const Announcements: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientRole: 'all',
    type: 'announcement'
  });
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await api.publishNotification(formData);
      setSuccess('Notification published successfully.');
      setFormData({ title: '', message: '', recipientRole: 'all', type: 'announcement' });
      loadNotifications();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Announcements & Notification Broadcasting</h1>
        <p className="text-xs text-slate-500 mt-0.5">Publish alerts, timetable revisions, and compliance announcements to students and faculty</p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Publish Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Compose Announcement</h2>
          <form onSubmit={handlePublish} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Examination Attendance Notice"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Audience</label>
              <select
                value={formData.recipientRole}
                onChange={(e) => setFormData({ ...formData, recipientRole: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="all">Broadcast to Entire University</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Members Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="announcement">Important Announcement</option>
                <option value="low_attendance">Low Attendance Alert</option>
                <option value="assignment">Class Assignment Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="Write notice details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Existing Notifications Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Live Notification Stream</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No notifications in record.</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-xs">
                  <div className="mt-0.5">
                    {n.type === 'low_attendance' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{n.message}</p>
                    <div className="mt-2 flex items-center space-x-2 text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 capitalize">
                        Target: {n.recipientRole}
                      </span>
                      {n.authorName && <span>By {n.authorName}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
