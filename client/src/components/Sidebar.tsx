import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Database,
  ShieldAlert,
  Settings,
  ClipboardList,
  CalendarDays,
  History,
  CheckCircle2,
  BellRing
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user } = useAuth();

  const adminNav = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin_students', label: 'Student Management', icon: Users },
    { id: 'admin_faculty', label: 'Faculty Management', icon: GraduationCap },
    { id: 'admin_departments', label: 'Department Management', icon: Building2 },
    { id: 'admin_courses', label: 'Course Management', icon: BookOpen },
    { id: 'admin_classes', label: 'Class Management', icon: CalendarCheck },
    { id: 'admin_records', label: 'Attendance Records', icon: ClipboardList },
    { id: 'admin_reports', label: 'Attendance Reports', icon: FileSpreadsheet },
    { id: 'admin_database', label: 'Database & Architecture', icon: Database, badge: 'Multi-DB' },
    { id: 'admin_notifications', label: 'Announcements', icon: BellRing },
    { id: 'admin_security', label: 'Security & Access Control', icon: ShieldAlert },
    { id: 'admin_settings', label: 'System Settings', icon: Settings },
  ];

  const facultyNav = [
    { id: 'faculty_dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'faculty_mark', label: 'Mark Attendance', icon: CheckCircle2, badge: 'Live' },
    { id: 'faculty_history', label: 'Attendance History', icon: History },
    { id: 'faculty_reports', label: 'Class Reports', icon: FileSpreadsheet },
  ];

  const studentNav = [
    { id: 'student_dashboard', label: 'My Attendance', icon: LayoutDashboard },
    { id: 'student_subjects', label: 'Subject Breakdown', icon: BookOpen },
    { id: 'student_calendar', label: 'Attendance Calendar', icon: CalendarDays },
    { id: 'student_history', label: 'Attendance Logs', icon: History },
  ];

  let items = adminNav;
  if (user?.role === 'faculty') items = facultyNav;
  if (user?.role === 'student') items = studentNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0 shadow-sm">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.role === 'admin' ? 'Administration' : (user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal')}
            </span>
            <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">
              {user?.role}
            </span>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer system status badge */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-700">Multi-DB Active</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Relational + NoSQL + Graph + Redis Cache
          </p>
        </div>
      </div>
    </aside>
  );
};
