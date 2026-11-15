import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BookOpen, CheckCircle2, AlertTriangle, Users, GraduationCap, ChevronRight } from 'lucide-react';

export const SubjectAttendance: React.FC = () => {
  const { user } = useAuth();
  const [subjectWise, setSubjectWise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentDashboard(user?.roleDetails?.studentId);
      setSubjectWise(res.subjectWise || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Subject-wise Attendance</h1>
        <p className="text-xs text-slate-500 mt-0.5">Course-by-course attendance percentage, class conducted ratios, and eligibility status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading course enrollments...</div>
        ) : (
          subjectWise.map((sub) => {
            const isBelow = sub.isBelowThreshold;
            return (
              <div key={sub.classId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {sub.courseCode}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-2">{sub.courseName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.className}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      isBelow ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Instructor:</span>
                      <span className="font-bold text-slate-800">{sub.facultyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Classes Attended:</span>
                      <span className="font-bold text-emerald-700">{sub.presentClasses} of {sub.totalClasses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Classes Missed:</span>
                      <span className="font-bold text-red-600">{sub.absentClasses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Late Arrivals:</span>
                      <span className="font-bold text-amber-600">{sub.lateClasses}</span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isBelow ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Minimum Req: <strong>75%</strong></span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    isBelow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isBelow ? 'Debarred Warning' : 'Exam Eligible'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
