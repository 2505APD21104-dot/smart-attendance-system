import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { FacultyManagement } from './pages/admin/FacultyManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { ClassManagement } from './pages/admin/ClassManagement';
import { AttendanceRecords } from './pages/admin/AttendanceRecords';
import { AttendanceReports } from './pages/admin/AttendanceReports';
import { DatabaseManagement } from './pages/admin/DatabaseManagement';
import { SecurityControl } from './pages/admin/SecurityControl';
import { SystemSettings } from './pages/admin/Settings';
import { Announcements } from './pages/admin/Announcements';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { MarkAttendance } from './pages/faculty/MarkAttendance';
import { FacultyAttendanceHistory } from './pages/faculty/FacultyAttendanceHistory';
import { FacultyReports } from './pages/faculty/FacultyReports';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubjectAttendance } from './pages/student/SubjectAttendance';
import { AttendanceCalendar } from './pages/student/AttendanceCalendar';
import { StudentHistory } from './pages/student/StudentHistory';

export const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('admin_dashboard');
  const [authView, setAuthView] = useState<'welcome' | 'login'>('welcome');
  const [presetRole, setPresetRole] = useState<'admin' | 'faculty' | 'student' | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') setCurrentTab('admin_dashboard');
      else if (user.role === 'faculty') setCurrentTab('faculty_dashboard');
      else if (user.role === 'student') setCurrentTab('student_dashboard');
    }
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
            Initializing Apex Portal...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated routing: Welcome landing by default, or Login modal
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onBackToHome={() => setAuthView('welcome')}
          presetRole={presetRole}
        />
      );
    }

    return (
      <Welcome
        onGoToLogin={(role) => {
          setPresetRole(role || null);
          setAuthView('login');
        }}
      />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      // Admin Views
      case 'admin_dashboard':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'admin_students':
        return <StudentManagement />;
      case 'admin_faculty':
        return <FacultyManagement />;
      case 'admin_departments':
        return <DepartmentManagement />;
      case 'admin_courses':
        return <CourseManagement />;
      case 'admin_classes':
        return <ClassManagement />;
      case 'admin_records':
        return <AttendanceRecords />;
      case 'admin_reports':
        return <AttendanceReports />;
      case 'admin_database':
        return <DatabaseManagement />;
      case 'admin_security':
        return <SecurityControl />;
      case 'admin_settings':
        return <SystemSettings />;
      case 'admin_notifications':
        return <Announcements />;

      // Faculty Views
      case 'faculty_dashboard':
        return <FacultyDashboard onNavigate={setCurrentTab} />;
      case 'faculty_mark':
        return <MarkAttendance onNavigate={setCurrentTab} />;
      case 'faculty_history':
        return <FacultyAttendanceHistory />;
      case 'faculty_reports':
        return <FacultyReports />;

      // Student Views
      case 'student_dashboard':
        return <StudentDashboard onNavigate={setCurrentTab} />;
      case 'student_subjects':
        return <SubjectAttendance />;
      case 'student_calendar':
        return <AttendanceCalendar />;
      case 'student_history':
        return <StudentHistory />;

      default:
        if (user?.role === 'admin') return <AdminDashboard onNavigate={setCurrentTab} />;
        if (user?.role === 'faculty') return <FacultyDashboard onNavigate={setCurrentTab} />;
        return <StudentDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar currentTab={currentTab} onNavigate={setCurrentTab} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onNavigate={setCurrentTab} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
