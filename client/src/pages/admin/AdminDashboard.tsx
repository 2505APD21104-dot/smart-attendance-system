import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Percent,
  RefreshCw,
  Zap,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Present, Absent, Late

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading university metrics...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const statusBreakdown = stats.statusBreakdown || {};

  const pieData = [
    { name: 'Present', value: statusBreakdown.present || 0 },
    { name: 'Absent', value: statusBreakdown.absent || 0 },
    { name: 'Late', value: statusBreakdown.late || 0 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">University Overview Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time attendance metrics, departmental trends, and system telemetry</p>
        </div>
        <div className="flex items-center space-x-3">
          {data?._cache && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              {data._cache}
            </span>
          )}
          <button
            onClick={fetchStats}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalStudents || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Enrolled</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalFaculty || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active Instructors</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Courses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalCourses || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Approved Subjects</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Classes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalClasses || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active Cohorts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.todaySessions || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Sessions Taken</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-md shadow-indigo-200">
          <div className="flex items-center justify-between text-indigo-200">
            <span className="text-xs font-bold uppercase tracking-wider">Overall</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{stats.overallPercentage || 0}%</span>
            <span className="text-[11px] text-indigo-200 block mt-0.5">
              {stats.overallPercentage >= 75 ? 'Above 75% target' : 'Below 75% target'}
            </span>
          </div>
        </div>

      </div>

      {/* Visualizations Row 1: Weekly Trend & Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Attendance Bar/Line Graph */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly Attendance Trends</h2>
              <p className="text-xs text-slate-500">Student attendance counts for recent instructional days</p>
            </div>
            <button
              onClick={() => onNavigate('admin_reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.substring(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="present" fill="#4f46e5" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Present vs Absent vs Late Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Attendance Distribution</h2>
            <p className="text-xs text-slate-500">Aggregate ratio across all recorded sessions</p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-emerald-50">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Present</span>
              <span className="text-sm font-black text-emerald-900">{statusBreakdown.present || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-red-50">
              <span className="text-[10px] font-bold text-red-800 uppercase block">Absent</span>
              <span className="text-sm font-black text-red-900">{statusBreakdown.absent || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Late</span>
              <span className="text-sm font-black text-amber-900">{statusBreakdown.late || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Visualizations Row 2: Department-wise Attendance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department-wise Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department-wise Attendance</h2>
              <p className="text-xs text-slate-500">Overall attendance rate comparison per school/department</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Threshold: 75%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.departmentStats || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Attendance']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="attendancePercentage" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Attendance Activity (from NoSQL database) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Attendance Activity</h2>
                <p className="text-xs text-slate-500">Live event stream logged to MongoDB document store</p>
              </div>
              <button
                onClick={() => onNavigate('admin_database')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Inspect Logs
              </button>
            </div>

            <div className="space-y-2.5 overflow-hidden">
              {(data?.recentActivity || []).slice(0, 5).map((log: any) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                      {log.action.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-slate-500">
                        Module: {log.module} • By {log.userRole}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Powered by MongoDB Wire Protocol Store</span>
            <span className="font-semibold text-emerald-600">● Streaming</span>
          </div>
        </div>

      </div>

    </div>
  );
};
