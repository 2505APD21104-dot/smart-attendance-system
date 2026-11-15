import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';

export const AttendanceCalendar: React.FC = () => {
  const { user } = useAuth();
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDaySessions, setSelectedDaySessions] = useState<any>(null);

  useEffect(() => {
    loadCalendar();
  }, [user]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentCalendar(user?.roleDetails?.studentId);
      setCalendarData(res.calendar || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Build calendar matrix
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry = calendarData.find(c => c.date === dateStr);
    days.push({ day: d, dateStr, entry });
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Monthly Attendance Calendar</h1>
          <p className="text-xs text-slate-500 mt-0.5">Visual day-by-day record of lecture attendance</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Present</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-600">Absent</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Late</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          
          {/* Month Controller */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-50/50" />;
              }

              const hasRecord = !!item.entry;
              const status = item.entry?.dayStatus;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => item.entry && setSelectedDaySessions(item.entry)}
                  className={`h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    item.entry
                      ? status === 'Present'
                        ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
                        : status === 'Absent'
                        ? 'bg-red-50/60 border-red-200 hover:border-red-400'
                        : 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">{item.day}</span>
                  {item.entry && (
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-700">
                        {status}
                      </span>
                      <span className="w-2 h-2 rounded-full" style={{
                        backgroundColor: status === 'Present' ? '#10b981' : (status === 'Absent' ? '#ef4444' : '#f59e0b')
                      }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Session Detail Inspector</h3>
            <p className="text-xs text-slate-500 mb-4">Click any marked day on the calendar to inspect classes held</p>

            {selectedDaySessions ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block">Date: {selectedDaySessions.date}</span>
                  <span className="text-[11px] text-slate-500">
                    Day Turnout: <strong className="capitalize">{selectedDaySessions.dayStatus}</strong>
                  </span>
                </div>

                <div className="space-y-2 mt-3">
                  {selectedDaySessions.sessions.map((s: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{s.courseName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.courseCode}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <span>Select an active date from the calendar to inspect individual period sessions.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
