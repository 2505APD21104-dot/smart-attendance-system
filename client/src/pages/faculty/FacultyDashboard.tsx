import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';

export const FacultyDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyDashboard(user?.roleDetails?.facultyId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Faculty Instruction Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            {user?.roleDetails?.designation || 'Faculty Instructor'} • {user?.roleDetails?.departmentName || 'School of Computing'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Assigned Classes</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{metrics.assignedClassesCount || 0}</span>
          <span className="text-[11px] text-slate-400">Cohorts this term</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Subjects Taught</span>
          <span className="text-2xl font-black text-blue-600 block mt-1">{metrics.assignedSubjectsCount || 0}</span>
          <span className="text-[11px] text-slate-400">Curriculum courses</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Students</span>
          <span className="text-2xl font-black text-indigo-600 block mt-1">{metrics.totalStudentsTaught || 0}</span>
          <span className="text-[11px] text-slate-400">Enrolled across classes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Today's Sessions</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">
            {metrics.completedTodayCount || 0} / {(metrics.completedTodayCount || 0) + (metrics.pendingTodayCount || 0)}
          </span>
          <span className="text-[11px] text-slate-400">Attendance marked</span>
        </div>
      </div>

      {/* Today's Classes List with Quick Mark Attendance Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Today's Class Schedule</h2>
            <p className="text-xs text-slate-500">Track and submit attendance records for today's instructional sessions</p>
          </div>
          <button
            onClick={() => onNavigate('faculty_mark')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center space-x-1.5"
          >
            <span>Mark Class Attendance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {(!data?.todayClasses || data.todayClasses.length === 0) ? (
            <p className="text-center py-8 text-xs text-slate-400">No classes assigned for this faculty profile.</p>
          ) : (
            data.todayClasses.map((cls: any) => (
              <div
                key={cls.classId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-indigo-700 shadow-sm">
                    {cls.courseCode}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{cls.className}</h3>
                    <p className="text-xs text-slate-500">{cls.courseName}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                      <span>Room: <strong className="text-slate-700">{cls.roomNo}</strong></span>
                      <span>Schedule: <strong className="text-slate-700">{cls.scheduleTime}</strong></span>
                      <span>Enrolled: <strong className="text-slate-700">{cls.enrolledCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {cls.isCompletedToday ? (
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Submitted Today</span>
                      </span>
                      {cls.todayStats && (
                        <span className="text-xs font-bold text-slate-600">
                          ({cls.todayStats.present} P, {cls.todayStats.absent} A)
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate('faculty_mark')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
                    >
                      Mark Attendance
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Attendance Sessions Conducted */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Recently Conducted Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Class & Subject</th>
                <th className="px-4 py-3">Total Checked</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Late</th>
                <th className="px-4 py-3">Turnout %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!data?.recentSessions || data.recentSessions.length === 0) ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400">No past sessions recorded.</td></tr>
              ) : (
                data.recentSessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{s.date}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{s.className}</span>
                      <span className="text-[11px] text-slate-400">{s.courseCode}</span>
                    </td>
                    <td className="px-4 py-3 font-bold">{s.total}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{s.present}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{s.absent}</td>
                    <td className="px-4 py-3 font-bold text-amber-600">{s.late}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
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
