import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CalendarCheck, Plus, Edit2, Trash2, X, CheckCircle2, Users, Clock, MapPin } from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    departmentId: '',
    facultyId: '',
    semester: '5',
    section: 'A',
    academicYear: '2024-2025',
    scheduleTime: 'Mon, Wed 09:00 - 10:30 AM',
    roomNo: 'Hall 201'
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, crsRes, facRes, deptRes] = await Promise.all([
        api.getClasses(),
        api.getCourses(),
        api.getFacultyList(),
        api.getDepartments()
      ]);
      setClasses(clsRes.classes);
      setCourses(crsRes.courses);
      setFaculty(facRes.faculty);
      setDepartments(deptRes.departments);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createClass(formData);
      setActionSuccess('Class created successfully.');
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
      await api.updateClass(selectedClass.id, formData);
      setActionSuccess('Class updated successfully.');
      setShowEditModal(false);
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete class '${name}'? This removes student enrollments and records.`)) return;
    try {
      await api.deleteClass(id);
      setActionSuccess('Class removed successfully.');
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Delete rejected: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      courseId: courses[0]?.id || '',
      departmentId: departments[0]?.id || '',
      facultyId: faculty[0]?.id || '',
      semester: '5',
      section: 'A',
      academicYear: '2024-2025',
      scheduleTime: 'Mon, Wed 09:00 - 10:30 AM',
      roomNo: 'Hall 201'
    });
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Class Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage course cohorts, faculty assignments, schedule timetables and classrooms</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading classes...</div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    {cls.courseCode}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setFormData({
                          name: cls.name,
                          courseId: cls.course_id,
                          departmentId: cls.department_id,
                          facultyId: cls.faculty_id,
                          semester: String(cls.semester),
                          section: cls.section,
                          academicYear: cls.academic_year,
                          scheduleTime: cls.schedule_time || '',
                          roomNo: cls.room_no || ''
                        });
                        setShowEditModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm mt-3">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cls.courseName}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Instructor</span>
                    <span className="font-bold text-slate-800">{cls.facultyName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Enrolled Students</span>
                    <span className="font-bold text-indigo-600">{cls.enrolledStudentsCount} students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Room & Schedule</span>
                    <span className="text-slate-700 font-mono text-[11px] truncate max-w-[170px]">{cls.room_no} • {cls.schedule_time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">Create Class Cohort</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assign subject, instructor, and classroom</p>

            {formError && <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{formError}</div>}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Class Cohort Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE-5A Database Systems"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Course Subject</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Assigned Faculty</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select Faculty Instructor</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 301"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Schedule Time</label>
                  <input
                    type="text"
                    placeholder="e.g. Mon, Wed 09:00 - 10:00 AM"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">Edit Class Cohort</h3>

            {formError && <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{formError}</div>}

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Assigned Faculty</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
