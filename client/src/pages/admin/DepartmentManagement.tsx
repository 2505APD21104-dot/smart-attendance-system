import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Building2, Plus, Edit2, Trash2, X, CheckCircle2, Users, GraduationCap, BookOpen } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      setDepartments(res.departments);
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
      await api.createDepartment(formData);
      setActionSuccess('Department created successfully.');
      setShowAddModal(false);
      setFormData({ code: '', name: '', description: '' });
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
      await api.updateDepartment(selectedDept.id, formData);
      setActionSuccess('Department updated successfully.');
      setShowEditModal(false);
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete department '${name}'? Foreign key constraints will prevent deletion if students, faculty, or courses are assigned.`)) return;
    try {
      await api.deleteDepartment(id);
      setActionSuccess('Department deleted successfully.');
      loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Delete rejected by relational constraint: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Department Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure academic schools, divisions, and faculty associations</p>
        </div>
        <button
          onClick={() => {
            setFormData({ code: '', name: '', description: '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
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
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading departments...</div>
        ) : (
          departments.map((d) => (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    {d.code}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedDept(d);
                        setFormData({ code: d.code, name: d.name, description: d.description || '' });
                        setShowEditModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id, d.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm mt-3">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description || 'No description provided.'}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Students</span>
                    <span className="text-xs font-black text-slate-800">{d.studentCount || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Faculty</span>
                    <span className="text-xs font-black text-slate-800">{d.facultyCount || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Courses</span>
                    <span className="text-xs font-black text-slate-800">{d.courseCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">Add Department</h3>
            <p className="text-xs text-slate-500 mt-0.5">Create a new academic unit</p>

            {formError && <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{formError}</div>}

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-ML"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">Edit Department</h3>
            <p className="text-xs text-slate-500 mt-0.5">Modify department metadata</p>

            {formError && <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{formError}</div>}

            <form onSubmit={handleUpdate} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">Update Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
