import express from 'express';
import { relationalDb } from '../db/relational.js';
import { redisCache } from '../db/cache.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /api/attendance/reports - Unified reports generator
router.get('/reports', (req, res) => {
  const { type = 'daily', date, startDate, endDate, departmentId, courseId, classId, status, minThreshold = 75, search } = req.query;

  const cacheKey = `report:${type}:${JSON.stringify(req.query)}`;
  const cached = redisCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, _cache: 'HIT (Redis)' });
  }

  const records = relationalDb.select('attendance_records');
  const sessions = relationalDb.select('attendance_sessions');
  const students = relationalDb.select('students');
  const users = relationalDb.select('users');
  const departments = relationalDb.select('departments');
  const courses = relationalDb.select('courses');
  const classes = relationalDb.select('classes');

  let reportData = [];
  let summary = {};

  if (type === 'daily') {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const filteredSessions = sessions.filter(s => s.date === targetDate);
    const dayRecords = records.filter(r => r.date === targetDate);

    reportData = filteredSessions.map(s => {
      const cls = classes.find(c => c.id === s.class_id) || {};
      const course = courses.find(c => c.id === s.subject_id) || {};
      const dept = departments.find(d => d.id === cls.department_id) || {};
      const pct = s.total_students > 0 ? Number(((s.present_count / s.total_students) * 100).toFixed(1)) : 0;

      return {
        sessionId: s.id,
        date: s.date,
        sessionTime: s.session_time,
        className: cls.name,
        departmentCode: dept.code,
        departmentName: dept.name,
        courseCode: course.code,
        courseName: course.name,
        totalStudents: s.total_students,
        present: s.present_count,
        absent: s.absent_count,
        late: s.late_count,
        percentage: pct
      };
    });

    const totalMarked = dayRecords.length;
    const totalPresent = dayRecords.filter(r => r.status === 'Present').length;
    summary = {
      date: targetDate,
      sessionsConducted: filteredSessions.length,
      totalHeadcount: totalMarked,
      overallPresent: totalPresent,
      overallPercentage: totalMarked > 0 ? Number(((totalPresent / totalMarked) * 100).toFixed(1)) : 0
    };
  } else if (type === 'weekly') {
    // Group records by week / date
    const dateMap = new Map();
    sessions.forEach(s => {
      if (!dateMap.has(s.date)) {
        dateMap.set(s.date, { date: s.date, sessions: 0, total: 0, present: 0, absent: 0, late: 0 });
      }
      const entry = dateMap.get(s.date);
      entry.sessions++;
      entry.total += s.total_students;
      entry.present += s.present_count;
      entry.absent += s.absent_count;
      entry.late += s.late_count;
    });

    reportData = Array.from(dateMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
      .map(d => ({
        ...d,
        percentage: d.total > 0 ? Number(((d.present / d.total) * 100).toFixed(1)) : 0
      }));

    summary = {
      daysTracked: reportData.length,
      totalConducted: reportData.reduce((acc, curr) => acc + curr.total, 0),
      totalPresent: reportData.reduce((acc, curr) => acc + curr.present, 0)
    };
  } else if (type === 'monthly') {
    // Group by month
    const monthMap = new Map();
    sessions.forEach(s => {
      const monthKey = s.date.substring(0, 7);
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { month: monthKey, sessions: 0, total: 0, present: 0, absent: 0, late: 0 });
      }
      const m = monthMap.get(monthKey);
      m.sessions++;
      m.total += s.total_students;
      m.present += s.present_count;
      m.absent += s.absent_count;
      m.late += s.late_count;
    });

    reportData = Array.from(monthMap.values()).map(m => ({
      ...m,
      percentage: m.total > 0 ? Number(((m.present / m.total) * 100).toFixed(1)) : 0
    }));

    summary = { totalMonths: reportData.length };
  } else if (type === 'student_wise') {
    reportData = students.map(st => {
      const user = users.find(u => u.id === st.user_id) || {};
      const dept = departments.find(d => d.id === st.department_id) || {};
      const stRecords = records.filter(r => r.student_id === st.id);

      const total = stRecords.length;
      const present = stRecords.filter(r => r.status === 'Present').length;
      const absent = stRecords.filter(r => r.status === 'Absent').length;
      const late = stRecords.filter(r => r.status === 'Late').length;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return {
        studentId: st.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        rollNumber: st.roll_number,
        registrationNo: st.registration_no,
        departmentCode: dept.code,
        departmentName: dept.name,
        semester: st.semester,
        section: st.section,
        totalClasses: total,
        presentClasses: present,
        absentClasses: absent,
        lateClasses: late,
        percentage,
        isBelowThreshold: percentage < Number(minThreshold)
      };
    });

    if (departmentId) reportData = reportData.filter(r => r.departmentCode === departmentId || r.departmentId === departmentId);
    if (search) {
      const q = search.toLowerCase();
      reportData = reportData.filter(r => r.name.toLowerCase().includes(q) || r.rollNumber.toLowerCase().includes(q));
    }

    reportData.sort((a, b) => b.percentage - a.percentage);
    summary = {
      totalStudentsEvaluated: reportData.length,
      belowThresholdCount: reportData.filter(r => r.isBelowThreshold).length
    };
  } else if (type === 'subject_wise') {
    reportData = courses.map(c => {
      const dept = departments.find(d => d.id === c.department_id) || {};
      const cRecords = records.filter(r => r.subject_id === c.id);
      const total = cRecords.length;
      const present = cRecords.filter(r => r.status === 'Present').length;
      const absent = cRecords.filter(r => r.status === 'Absent').length;
      const late = cRecords.filter(r => r.status === 'Late').length;
      const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return {
        courseId: c.id,
        code: c.code,
        name: c.name,
        departmentCode: dept.code,
        credits: c.credits,
        totalClassesConducted: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        averageAttendancePercentage: pct
      };
    });

    if (departmentId) reportData = reportData.filter(r => r.departmentCode === departmentId);
    summary = { totalCourses: reportData.length };
  } else if (type === 'department_wise') {
    reportData = departments.map(d => {
      const deptStudents = students.filter(s => s.department_id === d.id);
      const deptStudentIds = new Set(deptStudents.map(s => s.id));
      const deptRecords = records.filter(r => deptStudentIds.has(r.student_id));

      const total = deptRecords.length;
      const present = deptRecords.filter(r => r.status === 'Present').length;
      const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return {
        departmentId: d.id,
        code: d.code,
        name: d.name,
        enrolledStudents: deptStudents.length,
        totalAttendanceMarked: total,
        presentCount: present,
        overallPercentage: pct
      };
    });

    summary = { totalDepartments: reportData.length };
  } else if (type === 'low_attendance') {
    // Low attendance student report (< 75% or specified threshold)
    const thresholdNum = Number(minThreshold) || 75;

    const studentStats = students.map(st => {
      const user = users.find(u => u.id === st.user_id) || {};
      const dept = departments.find(d => d.id === st.department_id) || {};
      const stRecords = records.filter(r => r.student_id === st.id);

      const total = stRecords.length;
      const present = stRecords.filter(r => r.status === 'Present').length;
      const absent = stRecords.filter(r => r.status === 'Absent').length;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      // Classes needed
      const needed = Math.max(0, Math.ceil(((thresholdNum / 100) * total - present) / (1 - (thresholdNum / 100))));

      return {
        studentId: st.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        rollNumber: st.roll_number,
        email: user.email,
        departmentCode: dept.code,
        departmentName: dept.name,
        semester: st.semester,
        section: st.section,
        totalClasses: total,
        presentClasses: present,
        absentClasses: absent,
        percentage,
        threshold: thresholdNum,
        shortfallPercentage: Number((thresholdNum - percentage).toFixed(1)),
        classesNeededToNormalize: needed
      };
    });

    reportData = studentStats.filter(s => s.percentage < thresholdNum);
    reportData.sort((a, b) => a.percentage - b.percentage);

    summary = {
      threshold: thresholdNum,
      lowAttendanceCount: reportData.length,
      actionRequired: 'Counseling notification & academic probation warning'
    };
  }

  const response = {
    reportType: type,
    generatedAt: new Date().toISOString(),
    summary,
    data: reportData
  };

  redisCache.set(cacheKey, response, 30);
  res.json(response);
});

// GET /api/attendance/export-csv - Download CSV report
router.get('/export-csv', (req, res) => {
  const { type = 'records' } = req.query;

  const records = relationalDb.select('attendance_records');
  const students = relationalDb.select('students');
  const users = relationalDb.select('users');
  const classes = relationalDb.select('classes');
  const courses = relationalDb.select('courses');

  let csv = 'Record ID,Date,Student Name,Roll Number,Class Name,Course Code,Status,Remarks,Updated At\n';

  records.forEach(r => {
    const st = students.find(s => s.id === r.student_id) || {};
    const u = users.find(usr => usr.id === st.user_id) || {};
    const cls = classes.find(c => c.id === r.class_id) || {};
    const course = courses.find(c => c.id === r.subject_id) || {};

    const studentName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
    csv += `"${r.id}","${r.date}","${studentName}","${st.roll_number || ''}","${cls.name || ''}","${course.code || ''}","${r.status}","${r.remarks || ''}","${r.updated_at}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=attendance_records_export_${Date.now()}.csv`);
  res.send(csv);
});

export default router;
