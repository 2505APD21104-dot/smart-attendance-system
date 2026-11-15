import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { History, Download, Filter, Search, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const StudentHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHistory();
  }, [user, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentHistory({
        studentId: user?.roleDetails?.studentId,
        status: statusFilter || undefined
      });
      setHistory(res.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open('/api/student/export', '_blank');
  };

  const filtered = history.filter((h) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return h.courseName.toLowerCase().includes(q) || h.courseCode.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Personal Attendance Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Complete chronological verification history of your lecture attendance</p>
        </div>
        <button
          onClick={handleDownloadCsv}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Transcript</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by subject title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="">All Attendance Statuses</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Only</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Class Cohort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks / Reason</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading history records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No attendance records found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-700">{r.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">{r.courseName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{r.courseCode}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{r.className}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'Absent'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 italic max-w-xs truncate">{r.remarks || '—'}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-400">
                      {new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
};
