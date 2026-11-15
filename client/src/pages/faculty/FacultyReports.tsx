import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FileSpreadsheet, Users, AlertTriangle, CheckCircle2, Download, Printer } from 'lucide-react';

export const FacultyReports: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    try {
      const res = await api.getFacultyClasses(user?.roleDetails?.facultyId);
      setClasses(res.classes);
      if (res.classes.length > 0) {
        setSelectedClassId(res.classes[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadReport();
    }
  }, [selectedClassId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.getClassReport(selectedClassId);
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Class-wise Attendance Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Evaluate cohort attendance percentages and identify students below 75% threshold</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-700">Select Cohort:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.courseCode} - {c.name}</option>
            ))}
          </select>
        </div>

        {report && (
          <div className="text-xs text-slate-500">
            Total Sessions Conducted: <strong className="text-slate-800">{report.class?.totalSessionsConducted || 0}</strong>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Conducted</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Late</th>
                <th className="px-4 py-3">Attendance %</th>
                <th className="px-4 py-3">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Loading student attendance ratings...</td></tr>
              ) : !report?.students || report.students.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">No students enrolled.</td></tr>
              ) : (
                report.students.map((st: any) => (
                  <tr key={st.studentId} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{st.rollNumber}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3.5 text-slate-700">{st.totalClasses}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">{st.presentClasses}</td>
                    <td className="px-4 py-3.5 font-bold text-red-600">{st.absentClasses}</td>
                    <td className="px-4 py-3.5 font-bold text-amber-600">{st.lateClasses}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        st.isBelowThreshold
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {st.attendancePercentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        st.isBelowThreshold
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {st.isBelowThreshold ? 'Debarred (<75%)' : 'Eligible'}
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
