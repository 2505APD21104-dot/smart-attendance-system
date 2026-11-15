import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ClipboardList,
  Search,
  Filter,
  Edit3,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Calendar
} from 'lucide-react';

export const AttendanceRecords: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Edit / Correction Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('Present');
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, classFilter, dateFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repRes, clsRes] = await Promise.all([
        api.getReports({
          type: 'daily',
          date: dateFilter || undefined,
          status: statusFilter || undefined,
          classId: classFilter || undefined,
          search: search || undefined
        }),
        api.getClasses()
      ]);
      setClasses(clsRes.classes);
      // For detailed records list, fetch from student or report endpoint
      const rawRecordsRes = await fetch(`/api/attendance/export-csv?type=records`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('attendance_token')}` }
      });
      const csvText = await rawRecordsRes.text();
      // Parse CSV rows into objects
      const lines = csvText.trim().split('\n');
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.replace(/"/g, ''));
        if (parts.length >= 7) {
          rows.push({
            id: parts[0],
            date: parts[1],
            studentName: parts[2],
            rollNumber: parts[3],
            className: parts[4],
            courseCode: parts[5],
            status: parts[6],
            remarks: parts[7] || '',
            updatedAt: parts[8] || ''
          });
        }
      }
      setRecords(rows);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.studentName.toLowerCase().includes(q) || r.rollNumber.toLowerCase().includes(q) || r.courseCode.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCorrection = (record: any) => {
    setSelectedRecord(record);
    setNewStatus(record.status);
    setCorrectionRemarks(record.remarks || '');
    setFeedback(null);
    setShowEditModal(true);
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      await api.updateAttendanceRecord({
        recordId: selectedRecord.id,
        newStatus,
        remarks: correctionRemarks
      });
      setFeedback('Record successfully corrected with audit log entry.');
      setTimeout(() => {
        setShowEditModal(false);
        loadData();
      }, 1000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open('/api/attendance/export-csv', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit trail of all student attendance events across cohorts</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses (Present, Absent, Late)</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Only</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => {
            setSearch('');
            setStatusFilter('');
            setClassFilter('');
            setDateFilter('');
            loadData();
          }}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Class & Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3 text-right">Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">Loading stored attendance records...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">No records found matching filters.</td></tr>
              ) : (
                filteredRecords.slice(0, 100).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{r.date}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{r.studentName}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">{r.rollNumber}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 block">{r.courseCode}</span>
                      <span className="text-[11px] text-slate-400">{r.className}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'Absent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 italic max-w-xs truncate">
                      {r.remarks || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenCorrection(r)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Attendance Correction</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized correction with automatic audit log recording
            </p>

            <div className="my-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
              <div><span className="font-bold text-slate-800">Student:</span> {selectedRecord.studentName} ({selectedRecord.rollNumber})</div>
              <div><span className="font-bold text-slate-800">Class:</span> {selectedRecord.className} • {selectedRecord.date}</div>
              <div><span className="font-bold text-slate-800">Current Status:</span> <span className="font-bold">{selectedRecord.status}</span></div>
            </div>

            {feedback && (
              <div className="mb-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs border border-indigo-200">
                {feedback}
              </div>
            )}

            <form onSubmit={handleSaveCorrection} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">New Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Absent', 'Late'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        newStatus === st
                          ? st === 'Present'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Absent'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Reason for Correction (Audit Log)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Medical leave slip submitted & verified"
                  value={correctionRemarks}
                  onChange={(e) => setCorrectionRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
