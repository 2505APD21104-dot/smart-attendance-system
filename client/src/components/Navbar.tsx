import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  Shield,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch {}
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Shield className="w-3 h-3" /> Administrator</span>;
      case 'faculty':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><BookOpen className="w-3 h-3" /> Faculty</span>;
      case 'student':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><GraduationCap className="w-3 h-3" /> Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">APEX UNIVERSITY</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Attendance OS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden md:block">Smart Enterprise Attendance Management System</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Quick Demo Role Switcher (Academic Evaluation Tool) */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
            <span className="px-2 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">Test Role:</span>
            <button
              onClick={() => quickLoginAs('admin')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${user?.role === 'admin' ? 'bg-white text-purple-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Admin
            </button>
            <button
              onClick={() => quickLoginAs('faculty')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${user?.role === 'faculty' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Faculty
            </button>
            <button
              onClick={() => quickLoginAs('student')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${user?.role === 'student' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Student
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif._id}
                        className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${!notif.isRead ? 'bg-indigo-50/40' : ''}`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'low_attendance' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : notif.type === 'attendance_submitted' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 focus:outline-none transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.firstName}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-100"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2">{user?.role && getRoleBadge(user.role)}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (user?.role === 'admin') onNavigate('settings');
                      else if (user?.role === 'faculty') onNavigate('faculty_dashboard');
                      else onNavigate('student_dashboard');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Account Info</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
