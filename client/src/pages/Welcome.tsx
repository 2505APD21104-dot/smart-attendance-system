import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Shield,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  Database,
  Layers,
  Network,
  Zap,
  Lock,
  CalendarCheck,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';

interface WelcomeProps {
  onGoToLogin: (presetRole?: 'admin' | 'faculty' | 'student') => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onGoToLogin }) => {
  const { quickLoginAs } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top University Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">APEX UNIVERSITY</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  Institutional Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Attendance & Academic Information System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Platform Capabilities</a>
            <a href="#portals" className="hover:text-indigo-600 transition-colors">Role Portals</a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">Multi-DB Architecture</a>
            <a href="#stats" className="hover:text-indigo-600 transition-colors">Institutional Metrics</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onGoToLogin()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center space-x-2"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Academic Year 2024–2025 • University Attendance Subsystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            Institutional Attendance & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-100 bg-clip-text text-transparent">
              Academic Information Platform
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-indigo-200/90 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, database-driven attendance management platform designed for universities. Features multi-model storage (PostgreSQL, MongoDB, Neo4j, Redis), real-time 75% compliance tracking, and role-based workflows for administrators, faculty, and students.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onGoToLogin()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Access Attendance Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#architecture"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-indigo-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Multi-DB Engine</span>
              <ChevronRight className="w-4 h-4 text-indigo-300" />
            </a>
          </div>

          {/* Quick System Highlights Strip */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">Relational Core</span>
              <span className="text-xs font-semibold text-white mt-1 block">PostgreSQL / MySQL Schema with PK & FK</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Integrity Guarantee</span>
              <span className="text-xs font-semibold text-white mt-1 block">Zero Duplicate Record Constraint</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Graph & NoSQL</span>
              <span className="text-xs font-semibold text-white mt-1 block">Neo4j Cypher & MongoDB Event Stream</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">Fast In-Memory</span>
              <span className="text-xs font-semibold text-white mt-1 block">Redis Caching & Instant Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portal Cards */}
      <section id="portals" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Dedicated Role Access</h2>
          <p className="text-2xl font-black text-slate-900 mt-1">Select an Institutional Portal to Begin</p>
          <p className="text-xs text-slate-500 mt-1">Each profile has isolated access boundaries, custom dashboard telemetry, and role-tailored actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Administrator Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                Executive Portal
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">University Administrator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Oversee entire institution metrics, manage departments, faculty, courses, and classes, run compliance reports, inspect the multi-model database, and audit security logs.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>University-wide attendance analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Student & Faculty directory CRUD</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Multi-Model Database & Cypher center</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onGoToLogin('admin')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch Administrator Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Faculty Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                Instructor Portal
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">Faculty & Instructors</h3>
              <p className="text-xs text-slate-500 mt-1">
                Review assigned classes and today's schedule, mark student attendance with fast bulk toggles, prevent duplicate submissions, and generate class-wise reports.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>1-Click bulk present/absent markings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Duplicate record constraint prevention</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Instant attendance % recalculation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onGoToLogin('faculty')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch Faculty Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Student Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                Student Portal
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">Enrolled Students</h3>
              <p className="text-xs text-slate-500 mt-1">
                Monitor personal lecture attendance, track 75% exam eligibility, calculate needed recovery classes, view interactive monthly attendance calendars, and download transcripts.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cumulative & subject-wise percentage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>75% threshold recovery calculator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Color-coded monthly calendar & CSV export</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onGoToLogin('student')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Database Subsystems Showcase */}
      <section id="architecture" className="py-16 bg-slate-100/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Engineering & Architecture</h2>
            <p className="text-2xl font-black text-slate-900 mt-1">Multi-Model Database Integration</p>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrates relational integrity, document storage, graph relationships, caching, and ACID transactions in one unified engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">1. Relational Database</h3>
              <p className="text-xs text-slate-500 mt-1">
                PostgreSQL/MySQL compliant schema with primary/foreign keys, referential cascades, and composite unique keys.
              </p>
              <span className="mt-3 inline-block font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                ANSI SQL:2016 DDL
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">2. NoSQL Document Store</h3>
              <p className="text-xs text-slate-500 mt-1">
                MongoDB wire-protocol document collections for activity logs, real-time alerts, and audit trails.
              </p>
              <span className="mt-3 inline-block font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                MongoDB JSON/BSON
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">3. Neo4j Graph Engine</h3>
              <p className="text-xs text-slate-500 mt-1">
                Graph relationships connecting students, instructors, courses, and classes with live Cypher query execution.
              </p>
              <span className="mt-3 inline-block font-mono text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Cypher Query Engine
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">4. Redis Caching</h3>
              <p className="text-xs text-slate-500 mt-1">
                In-memory cache layer for sub-millisecond report generation, live hit/miss telemetry, and auto-invalidation.
              </p>
              <span className="mt-3 inline-block font-mono text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Key-Value In-Memory
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Statistics */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Operational Integrity</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">Engineered for Academic Compliance</h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-lg">
              Designed to enforce statutory university attendance guidelines, eliminating manual paper rosters and securing academic transcripts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 shrink-0 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">75%</span>
              <span className="text-[11px] text-indigo-200 mt-0.5 block">Statutory Threshold</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">100%</span>
              <span className="text-[11px] text-indigo-200 mt-0.5 block">Duplicate Immunity</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-2xl sm:text-3xl font-black text-indigo-300 block">0ms</span>
              <span className="text-[11px] text-indigo-200 mt-0.5 block">Cached Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-800">Apex Institute of Technology & University</span>
          </div>
          <p className="text-center sm:text-right">
            Smart Attendance Management System &copy; {new Date().getFullYear()}. All institutional rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
