import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreVertical,
  History,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    registrationNo: '',
    departmentId: '',
    semester: '1',
    section: 'A',
    batchYear: '2024-2028',
    password: 'Student@123'
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedSem]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stRes, deptRes] = await Promise.all([
        api.getStudents({
          departmentId: selectedDept || undefined,
          semester: selectedSem || undefined,
          search: search || undefined
        }),
        api.getDepartments()
      ]);
      setStudents(stRes.students);
      setDepartments(deptRes.departments);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createStudent(formData);
      setActionSuccess('Student registered successfully.');
      setShowAddModal(false);
      resetForm();
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.updateStudent(selectedStudent.id, formData);
      setActionSuccess('Student updated successfully.');
      setShowEditModal(false);
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student '${name}'? This will also remove associated enrollments and records.`)) {
      return;
    }
    try {
      await api.deleteStudent(id);
      setActionSuccess('Student deleted successfully.');
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleOpenEdit = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      rollNumber: student.rollNumber || '',
      registrationNo: student.registrationNo || '',
      departmentId: student.departmentId || '',
      semester: String(student.semester || '1'),
      section: student.section || 'A',
      batchYear: student.batchYear || '2024-2028',
      password: ''
    });
    setFormError(null);
    setShowEditModal(true);
  };

  const handleOpenHistory = async (student: any) => {
    setSelectedStudent(student);
    try {
      const res = await api.getStudentAttendanceHistory(student.id);
      setHistoryData(res);
      setShowHistoryModal(true);
    } catch (err: any) {
      alert(`Could not load history: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      rollNumber: '',
      registrationNo: '',
      departmentId: departments[0]?.id || '',
      semester: '1',
      section: 'A',
      batchYear: '2024-2028',
      password: 'Student@123'
    });
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage student enrollments, academic profiles, and monitor attendance metrics</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>

          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Sem {sem}</option>
            ))}
          </select>

          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Student Name</th>
                <th className="px-4 py-3">Roll & Reg No</th>
                <th className="px-4 py-3">Dept & Class</th>
                <th className="px-4 py-3">Attendance %</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No students match current search criteria.</td>
                </tr>
              ) : (
                students.map((st) => {
                  const pct = st.attendance?.percentage || 0;
                  const isBelowThreshold = pct < 75;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-[11px] text-slate-400">{st.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <span className="font-bold text-slate-800 block">{st.rollNumber}</span>
                        <span className="text-slate-400">{st.registrationNo}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-block mb-0.5">
                          {st.departmentCode}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Sem {st.semester} • Sec {st.section}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isBelowThreshold
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {pct}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({st.attendance?.present || 0}/{st.attendance?.total || 0})
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenHistory(st)}
                            title="View Attendance History"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(st)}
                            title="Edit Student"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(st.id, st.name)}
                            title="Delete Student"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
            <p className="text-xs text-slate-500 mt-0.5">Register student into the relational university database</p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS2024099"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REG2024999"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Initial Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Edit Student Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">Update student registration details</p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Update Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Attendance History Modal */}
      {showHistoryModal && historyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-100 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{historyData.student.name}</h3>
              <p className="text-xs text-slate-500">
                Roll: {historyData.student.rollNumber} • Sem {historyData.student.semester} ({historyData.student.section})
              </p>

              <div className="grid grid-cols-4 gap-2 mt-3">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                  <span className="text-sm font-bold text-slate-800">{historyData.metrics.totalClasses}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold">Present</span>
                  <span className="text-sm font-bold text-emerald-800">{historyData.metrics.present}</span>
                </div>
                <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-center">
                  <span className="text-[10px] text-red-600 block uppercase font-bold">Absent</span>
                  <span className="text-sm font-bold text-red-800">{historyData.metrics.absent}</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                  <span className="text-[10px] text-indigo-600 block uppercase font-bold">Rate</span>
                  <span className="text-sm font-bold text-indigo-800">{historyData.metrics.percentage}%</span>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto mt-4 divide-y divide-slate-100 text-xs flex-1">
              {historyData.history.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No attendance sessions recorded yet.</p>
              ) : (
                historyData.history.map((rec: any) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{rec.courseName} ({rec.courseCode})</span>
                      <span className="text-[11px] text-slate-400">{rec.className} • {rec.date}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.status === 'Absent'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
