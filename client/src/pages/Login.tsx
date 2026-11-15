import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  BookOpen,
  ArrowRight,
  AlertCircle,
  X,
  ArrowLeft
} from 'lucide-react';

interface LoginProps {
  onBackToHome?: () => void;
  presetRole?: 'admin' | 'faculty' | 'student' | null;
}

export const Login: React.FC<LoginProps> = ({ onBackToHome, presetRole }) => {
  const { login, quickLoginAs } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  useEffect(() => {
    if (presetRole) {
      if (presetRole === 'admin') {
        setIdentifier('admin@apex.edu');
        setPassword('Admin@123');
      } else if (presetRole === 'faculty') {
        setIdentifier('robert.chen@apex.edu');
        setPassword('Faculty@123');
      } else if (presetRole === 'student') {
        setIdentifier('alex.j@apex.edu');
        setPassword('Student@123');
      }
    }
  }, [presetRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMsg(res.message);
    } catch (err: any) {
      setForgotMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      {onBackToHome && (
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-200 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-300" />
            <span>Return to Portal Home</span>
          </button>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/25 mb-4">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Apex University
        </h1>
        <p className="mt-1 text-sm text-indigo-200 font-medium">
          Smart Attendance Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@apex.edu or CS2024001"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-2 font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs('admin')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/60 text-purple-800 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-bold">Admin</span>
                </div>
                <p className="text-[10px] text-purple-600/80 mt-0.5">admin@apex.edu</p>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('faculty')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/60 text-blue-800 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold">Faculty</span>
                </div>
                <p className="text-[10px] text-blue-600/80 mt-0.5">Dr. Robert Chen</p>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('student')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-800 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold">Student</span>
                </div>
                <p className="text-[10px] text-emerald-600/80 mt-0.5">Alex Johnson</p>
              </button>
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Apex Institute of Technology &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotMsg(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered university email to receive a password recovery link.
            </p>

            {forgotMsg ? (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. robert.chen@apex.edu"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
