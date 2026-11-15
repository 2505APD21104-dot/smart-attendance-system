import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Save,
  Users,
  Search,
  CheckCheck,
  XCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const MarkAttendance: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Student roster state
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [existingSession, setExistingSession] = useState<any>(null);

  // Form submission feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await api.getFacultyClasses(user?.roleDetails?.facultyId);
      setClasses(res.classes);
      if (res.classes.length > 0) {
        setSelectedClassId(res.classes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadStudentsForClass();
    }
  }, [selectedClassId, selectedDate]);

  const loadStudentsForClass = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.getClassStudents(selectedClassId, selectedDate);
      setStudents(res.students);
      setIsAlreadySubmitted(res.isAlreadySubmitted);
      setExistingSession(res.existingSession);

      // Initialize attendance map
      const initialMap: Record<string, { status: string; remarks: string }> = {};
      res.students.forEach((st: any) => {
        initialMap[st.studentId] = {
          status: st.currentStatus || 'Present',
          remarks: st.remarks || ''
        };
      });
      setAttendanceMap(initialMap);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      students.forEach((st) => {
        next[st.studentId] = {
          ...next[st.studentId],
          status
        };
      });
      return next;
    });
  };

  // Compute live counters
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  students.forEach((st) => {
    const s = attendanceMap[st.studentId]?.status || 'Present';
    if (s === 'Present') presentCount++;
    else if (s === 'Absent') absentCount++;
    else if (s === 'Late') lateCount++;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const selectedCls = classes.find((c) => c.id === selectedClassId);
    if (!selectedCls) return;

    if (students.length === 0) {
      setErrorMsg('No students are enrolled in this class to mark attendance.');
      return;
    }

    const payload = {
      classId: selectedClassId,
      subjectId: selectedCls.courseId,
      date: selectedDate,
      sessionTime: selectedCls.scheduleTime || '09:00 AM - 10:00 AM',
      records: students.map((st) => ({
        studentId: st.studentId,
        status: attendanceMap[st.studentId]?.status || 'Present',
        remarks: attendanceMap[st.studentId]?.remarks || ''
      }))
    };

    setSubmitting(true);
    try {
      const res = await api.markAttendance(payload);
      setSuccessMsg(
        `Attendance atomically committed! Session ID: ${res.sessionId} (${res.presentCount} Present, ${res.absentCount} Absent, ${res.lateCount} Late).`
      );
      setIsAlreadySubmitted(true);
      setTimeout(() => {
        if (onNavigate) onNavigate('faculty_dashboard');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((st) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.rollNumber.toLowerCase().includes(q);
  });

  const activeClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mark Class Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">Record and commit attendance roster with database transaction integrity</p>
        </div>

        {/* Live Counters Pill */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            Present: {presentCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200">
            Absent: {absentCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Late: {lateCount}
          </span>
        </div>
      </div>

      {/* Duplicate Prevention Alert if already submitted */}
      {isAlreadySubmitted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Attendance Already Submitted for This Date</span>
            <p className="mt-0.5 text-amber-800">
              An attendance record session has already been committed for this class and date. Re-submission is prevented by the relational database composite unique constraint <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">uq_session_class_sub_date</code> to protect against duplicate records.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Class & Date Selector Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Class & Subject
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} - {c.name} ({c.enrolledCount} Students)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Attendance Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div className="flex flex-col justify-end">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Bulk Fast Actions
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isAlreadySubmitted}
              onClick={() => handleMarkAll('Present')}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center space-x-1 disabled:opacity-40"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>All Present</span>
            </button>
            <button
              type="button"
              disabled={isAlreadySubmitted}
              onClick={() => handleMarkAll('Absent')}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center space-x-1 disabled:opacity-40"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>All Absent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filter Subheader */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student in roster..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredStudents.length} of {students.length} enrolled students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No students currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const currentStatus = attendanceMap[st.studentId]?.status || 'Present';
                  const remarks = attendanceMap[st.studentId]?.remarks || '';

                  return (
                    <tr key={st.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                        {st.rollNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{st.name}</span>
                        <span className="text-[10px] text-slate-400">Reg: {st.registrationNo}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {st.departmentCode} (Sem {st.semester})
                        </span>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                          <button
                            type="button"
                            disabled={isAlreadySubmitted}
                            onClick={() => handleStatusChange(st.studentId, 'Present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            disabled={isAlreadySubmitted}
                            onClick={() => handleStatusChange(st.studentId, 'Absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            disabled={isAlreadySubmitted}
                            onClick={() => handleStatusChange(st.studentId, 'Late')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          disabled={isAlreadySubmitted}
                          placeholder={currentStatus === 'Absent' ? 'Enter leave reason...' : 'Optional notes...'}
                          value={remarks}
                          onChange={(e) => handleRemarksChange(st.studentId, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Attendance submissions are committed atomically using database transactions.</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || isAlreadySubmitted || students.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>
              {isAlreadySubmitted
                ? 'Attendance Already Committed'
                : submitting
                ? 'Committing Transaction...'
                : 'Submit & Save Attendance'}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
};
