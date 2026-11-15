import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Users,
  AlertTriangle,
  Building2,
  BookOpen,
  Filter,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

export const AttendanceReports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [minThreshold, setMinThreshold] = useState('75');

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDate, minThreshold]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReports({
        type: reportType,
        date: selectedDate,
        minThreshold
      });
      setReportData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!reportData || !reportData.data) return;
    const items = reportData.data;
    if (items.length === 0) return alert('No data to export.');

    const headers = Object.keys(items[0]).join(',');
    const rows = items.map((row: any) =>
      Object.values(row).map(v => typeof v === 'object' ? `"${JSON.stringify(v)}"` : `"${v}"`).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate daily, weekly, student-wise, and low-attendance compliance reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1.5">
        {[
          { id: 'daily', label: 'Daily Report', icon: Calendar },
          { id: 'weekly', label: 'Weekly Summary', icon: Calendar },
          { id: 'monthly', label: 'Monthly Trends', icon: Calendar },
          { id: 'student_wise', label: 'Student-wise', icon: Users },
          { id: 'subject_wise', label: 'Subject-wise', icon: BookOpen },
          { id: 'department_wise', label: 'Department-wise', icon: Building2 },
          { id: 'low_attendance', label: 'Low Attendance (<75%)', icon: AlertTriangle, badge: 'Crucial' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${isActive ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {reportType === 'daily' && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-700">Target Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>
          )}

          {reportType === 'low_attendance' && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-700">Minimum Threshold (%):</span>
              <input
                type="number"
                min="50"
                max="90"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>
          )}
        </div>

        {reportData?.summary && (
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            {Object.entries(reportData.summary).map(([k, v]) => (
              <span key={k} className="px-2.5 py-1 bg-slate-100 rounded-lg font-medium">
                <span className="font-bold capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span> {String(v)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Report Table Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {reportType === 'daily' && (
                  <>
                    <th className="px-5 py-3">Class Cohort</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Total Students</th>
                    <th className="px-4 py-3">Present</th>
                    <th className="px-4 py-3">Absent</th>
                    <th className="px-4 py-3">Attendance %</th>
                  </>
                )}

                {reportType === 'weekly' && (
                  <>
                    <th className="px-5 py-3">Instructional Date</th>
                    <th className="px-4 py-3">Sessions</th>
                    <th className="px-4 py-3">Total Headcount</th>
                    <th className="px-4 py-3">Present</th>
                    <th className="px-4 py-3">Absent</th>
                    <th className="px-4 py-3">Attendance Rate</th>
                  </>
                )}

                {reportType === 'monthly' && (
                  <>
                    <th className="px-5 py-3">Academic Month</th>
                    <th className="px-4 py-3">Sessions Held</th>
                    <th className="px-4 py-3">Total Students Checked</th>
                    <th className="px-4 py-3">Present</th>
                    <th className="px-4 py-3">Overall Percentage</th>
                  </>
                )}

                {reportType === 'student_wise' && (
                  <>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Dept & Sem</th>
                    <th className="px-4 py-3">Total Classes</th>
                    <th className="px-4 py-3">Present Classes</th>
                    <th className="px-4 py-3">Attendance %</th>
                    <th className="px-4 py-3">Eligibility</th>
                  </>
                )}

                {reportType === 'subject_wise' && (
                  <>
                    <th className="px-5 py-3">Course Code</th>
                    <th className="px-4 py-3">Course Title</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Classes Held</th>
                    <th className="px-4 py-3">Present Total</th>
                    <th className="px-4 py-3">Average %</th>
                  </>
                )}

                {reportType === 'department_wise' && (
                  <>
                    <th className="px-5 py-3">Department Code</th>
                    <th className="px-4 py-3">Department Name</th>
                    <th className="px-4 py-3">Enrolled Students</th>
                    <th className="px-4 py-3">Total Checks</th>
                    <th className="px-4 py-3">Overall Attendance</th>
                  </>
                )}

                {reportType === 'low_attendance' && (
                  <>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Dept & Class</th>
                    <th className="px-4 py-3">Present / Total</th>
                    <th className="px-4 py-3">Current %</th>
                    <th className="px-4 py-3">Classes Needed for 75%</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">Compiling report data...</td></tr>
              ) : !reportData?.data || reportData.data.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">No data found for this report period.</td></tr>
              ) : (
                reportData.data.map((row: any, idx: number) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      {reportType === 'daily' && (
                        <>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{row.className}</td>
                          <td className="px-4 py-3.5">{row.courseName} ({row.courseCode})</td>
                          <td className="px-4 py-3.5 font-mono">{row.departmentCode}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">{row.totalStudents}</td>
                          <td className="px-4 py-3.5 text-emerald-700 font-bold">{row.present}</td>
                          <td className="px-4 py-3.5 text-red-600 font-bold">{row.absent}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {row.percentage}%
                            </span>
                          </td>
                        </>
                      )}

                      {reportType === 'weekly' && (
                        <>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{row.date}</td>
                          <td className="px-4 py-3.5">{row.sessions} sessions</td>
                          <td className="px-4 py-3.5 font-bold">{row.total}</td>
                          <td className="px-4 py-3.5 text-emerald-600 font-bold">{row.present}</td>
                          <td className="px-4 py-3.5 text-red-600 font-bold">{row.absent}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                              {row.percentage}%
                            </span>
                          </td>
                        </>
                      )}

                      {reportType === 'monthly' && (
                        <>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{row.month}</td>
                          <td className="px-4 py-3.5">{row.sessions}</td>
                          <td className="px-4 py-3.5">{row.total}</td>
                          <td className="px-4 py-3.5 text-emerald-600 font-bold">{row.present}</td>
                          <td className="px-4 py-3.5 font-bold text-indigo-600">{row.percentage}%</td>
                        </>
                      )}

                      {reportType === 'student_wise' && (
                        <>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{row.name}</td>
                          <td className="px-4 py-3.5 font-mono">{row.rollNumber}</td>
                          <td className="px-4 py-3.5">{row.departmentCode} • Sem {row.semester}</td>
                          <td className="px-4 py-3.5">{row.totalClasses}</td>
                          <td className="px-4 py-3.5 text-emerald-600 font-bold">{row.presentClasses}</td>
                          <td className="px-4 py-3.5 font-bold">{row.percentage}%</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.isBelowThreshold ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {row.isBelowThreshold ? 'Below 75%' : 'Eligible'}
                            </span>
                          </td>
                        </>
                      )}

                      {reportType === 'subject_wise' && (
                        <>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{row.code}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">{row.name}</td>
                          <td className="px-4 py-3.5 font-mono">{row.departmentCode}</td>
                          <td className="px-4 py-3.5">{row.totalClassesConducted}</td>
                          <td className="px-4 py-3.5 text-emerald-600 font-bold">{row.presentCount}</td>
                          <td className="px-4 py-3.5 font-bold text-indigo-600">{row.averageAttendancePercentage}%</td>
                        </>
                      )}

                      {reportType === 'department_wise' && (
                        <>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{row.code}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">{row.name}</td>
                          <td className="px-4 py-3.5">{row.enrolledStudents} students</td>
                          <td className="px-4 py-3.5">{row.totalAttendanceMarked}</td>
                          <td className="px-4 py-3.5 font-bold text-indigo-600">{row.overallPercentage}%</td>
                        </>
                      )}

                      {reportType === 'low_attendance' && (
                        <>
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            <div className="flex items-center space-x-2">
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span>{row.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-700">{row.rollNumber}</td>
                          <td className="px-4 py-3.5 text-slate-500">{row.email}</td>
                          <td className="px-4 py-3.5">{row.departmentCode} (Sem {row.semester})</td>
                          <td className="px-4 py-3.5 font-bold">{row.presentClasses} / {row.totalClasses}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                              {row.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                              +{row.classesNeededToNormalize} consecutive classes
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
