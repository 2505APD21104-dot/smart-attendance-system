import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Shield, Lock, Key, UserCheck, AlertTriangle, CheckCircle2, History } from 'lucide-react';

export const SecurityControl: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getNoSqlDocuments('activity_logs', 30);
      setAuditLogs(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rbacMatrix = [
    { module: 'User Management', admin: 'Full Control', faculty: 'Read Only (Self)', student: 'Read Only (Self)' },
    { module: 'Student Directory', admin: 'Full Control', faculty: 'Read Enrolled', student: 'No Access' },
    { module: 'Mark Attendance', admin: 'Override & Correct', faculty: 'Assigned Classes', student: 'No Access' },
    { module: 'Attendance Records', admin: 'Full Audit Trail', faculty: 'Class-wise', student: 'Personal History Only' },
    { module: 'Database Operations', admin: 'Full DDL & Flush', faculty: 'No Access', student: 'No Access' },
    { module: 'System Configurations', admin: 'Full Control', faculty: 'No Access', student: 'No Access' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Security & Access Control Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">Role-Based Access Control (RBAC), bcrypt password hashing, and immutable security audit logs</p>
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 mb-2">
            <Lock className="w-4 h-4" />
            <h3 className="font-bold text-slate-900 text-xs">Password Encryption</h3>
          </div>
          <p className="text-xs text-slate-500">
            Passwords are salted and cryptographically hashed with <span className="font-mono font-bold text-slate-800">bcrypt (10 rounds)</span>. Plaintext passwords are never stored.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Key className="w-4 h-4" />
            <h3 className="font-bold text-slate-900 text-xs">JWT Authentication</h3>
          </div>
          <p className="text-xs text-slate-500">
            Stateless HMAC SHA-256 JWT tokens with role claims and expiration guards injected in Bearer authorization headers.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Shield className="w-4 h-4" />
            <h3 className="font-bold text-slate-900 text-xs">Data Isolation</h3>
          </div>
          <p className="text-xs text-slate-500">
            Strict middleware gates ensure student users cannot access fellow student records or query unauthorized classes.
          </p>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Role-Based Access Control (RBAC) Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Resource / Module</th>
                <th className="px-4 py-3 text-purple-700">Administrator</th>
                <th className="px-4 py-3 text-blue-700">Faculty</th>
                <th className="px-4 py-3 text-emerald-700">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rbacMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{row.module}</td>
                  <td className="px-4 py-3 font-semibold text-purple-900">{row.admin}</td>
                  <td className="px-4 py-3 font-semibold text-blue-900">{row.faculty}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-900">{row.student}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Security Audit Logs (NoSQL Stream)</h2>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events</span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{log.action}</span>
                <span className="text-[11px] text-slate-500">
                  User: {log.userId} • Role: {log.userRole} • Module: {log.module}
                </span>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {log.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
