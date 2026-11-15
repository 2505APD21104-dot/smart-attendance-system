import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { History, Calendar, CheckCircle2, Clock, Users, ChevronRight } from 'lucide-react';

export const FacultyAttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyHistory(user?.roleDetails?.facultyId);
      setHistory(res.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance Session History</h1>
        <p className="text-xs text-slate-500 mt-0.5">Chronological record of all attendance sessions committed by your faculty profile</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Class Cohort</th>
                <th className="px-4 py-3">Course Code</th>
                <th className="px-4 py-3">Total Checked</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Late</th>
                <th className="px-4 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Loading historical sessions...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">No attendance sessions recorded yet.</td></tr>
              ) : (
                history.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{s.date}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{s.className}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{s.courseCode}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{s.total} students</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">{s.present}</td>
                    <td className="px-4 py-3.5 font-bold text-red-600">{s.absent}</td>
                    <td className="px-4 py-3.5 font-bold text-amber-600">{s.late}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {s.percentage}%
                      </span>
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
