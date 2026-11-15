import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  Percent,
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const StudentDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentDashboard(user?.roleDetails?.studentId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {};
  const isLowAttendance = metrics.isLowAttendance;

  const handleDownloadCsv = () => {
    window.open('/api/student/export', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Student Academic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hello, {data?.student?.name || `${user?.firstName} ${user?.lastName}`}
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1">
              Roll No: <span className="font-mono font-bold text-white">{data?.student?.rollNumber}</span> • {data?.student?.departmentName} (Sem {data?.student?.semester}, Sec {data?.student?.section})
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-indigo-300" />
            <span>Download Attendance Report</span>
          </button>
        </div>
      </div>

      {/* Critical Low Attendance Warning Alert (< 75%) */}
      {isLowAttendance && (
        <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 shadow-sm animate-pulse-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm text-red-900">
                Action Required: Attendance Below Minimum 75% Requirement
              </h3>
              <p className="text-xs text-red-800 mt-1 max-w-xl">
                Your cumulative attendance is currently <strong className="underline">{metrics.attendancePercentage}%</strong>, which is below the mandatory university threshold of 75%. You need to attend at least <strong>{metrics.classesNeededForThreshold} consecutive classes</strong> to normalize eligibility.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('student_calendar')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shrink-0"
          >
            Review Calendar
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Classes</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{metrics.totalClasses || 0}</span>
          <span className="text-[11px] text-slate-400">Total sessions held</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Present Classes</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{metrics.presentClasses || 0}</span>
          <span className="text-[11px] text-slate-400">Attended on time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Absent Classes</span>
          <span className="text-2xl font-black text-red-600 block mt-1">{metrics.absentClasses || 0}</span>
          <span className="text-[11px] text-slate-400">Missed sessions</span>
        </div>

        <div className={`p-4 rounded-2xl text-white shadow-md ${
          metrics.attendancePercentage >= 75
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-200'
            : 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-200'
        }`}>
          <span className="text-xs font-bold text-white/80 uppercase">Overall Attendance</span>
          <span className="text-2xl font-black text-white block mt-1">{metrics.attendancePercentage || 0}%</span>
          <span className="text-[11px] text-white/80">
            {metrics.attendancePercentage >= 75 ? 'Eligible for Exams' : 'Debarment Risk'}
          </span>
        </div>
      </div>

      {/* Subject-wise Progress Bars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Subject-wise Attendance Breakdown</h2>
            <p className="text-xs text-slate-500">Track compliance and exam eligibility per registered course</p>
          </div>
          <button
            onClick={() => onNavigate('student_subjects')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>Full Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {(!data?.subjectWise || data.subjectWise.length === 0) ? (
            <p className="text-center py-6 text-xs text-slate-400">No subject records loaded.</p>
          ) : (
            data.subjectWise.map((sub: any) => {
              const pct = sub.percentage;
              const isBelow = sub.isBelowThreshold;

              return (
                <div key={sub.classId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {sub.courseCode}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{sub.courseName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Instructor: {sub.facultyName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-slate-600">
                        {sub.presentClasses} / {sub.totalClasses} Classes
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        isBelow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBelow ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                    {/* 75% Target Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                      style={{ left: '75%' }}
                      title="75% Requirement"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Personal History Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Recent Attendance Records</h2>
          <button
            onClick={() => onNavigate('student_history')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Class Cohort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!data?.recentHistory || data.recentHistory.length === 0) ? (
                <tr><td colSpan={5} className="py-6 text-center text-slate-400">No recent logs recorded.</td></tr>
              ) : (
                data.recentHistory.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{rec.date}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{rec.courseName} ({rec.courseCode})</td>
                    <td className="px-4 py-3 text-slate-500">{rec.className}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.status === 'Absent'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic">{rec.remarks || '—'}</td>
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
