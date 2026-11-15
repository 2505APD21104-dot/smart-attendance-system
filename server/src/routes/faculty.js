import express from 'express';
import { relationalDb } from '../db/relational.js';
import { nosqlDb } from '../db/nosql.js';
import { TransactionService } from '../db/transactions.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize('faculty', 'admin'));

// Helper to get faculty ID for request
function getFacultyRecord(req) {
  if (req.user.role === 'faculty') {
    return relationalDb.findOne('faculty', f => f.user_id === req.user.id);
  }
  // Admin can simulate or pass facultyId
  const facId = req.query.facultyId || req.body.facultyId;
  if (facId) return relationalDb.findById('faculty', facId);
  return relationalDb.select('faculty')[0] || null;
}

// GET /api/faculty/dashboard - Faculty Overview
router.get('/dashboard', (req, res) => {
  const fac = getFacultyRecord(req);
  if (!fac) return res.status(404).json({ error: 'Faculty profile not found.' });

  const classes = relationalDb.select('classes', c => c.faculty_id === fac.id);
  const classIds = new Set(classes.map(c => c.id));
  const enrollments = relationalDb.select('class_enrollments', e => classIds.has(e.class_id));
  const courses = relationalDb.select('courses');
  const sessions = relationalDb.select('attendance_sessions', s => s.faculty_id === fac.id);

  const todayStr = new Date().toISOString().split('T')[0];

  // Map today's classes and their completion status
  const todayClasses = classes.map(cls => {
    const course = courses.find(c => c.id === cls.course_id) || {};
    const sessionToday = sessions.find(s => s.class_id === cls.id && s.date === todayStr);

    return {
      classId: cls.id,
      className: cls.name,
      courseCode: course.code,
      courseName: course.name,
      scheduleTime: cls.schedule_time,
      roomNo: cls.room_no,
      enrolledCount: enrollments.filter(e => e.class_id === cls.id).length,
      isCompletedToday: !!sessionToday,
      todaySessionId: sessionToday ? sessionToday.id : null,
      todayStats: sessionToday ? {
        present: sessionToday.present_count,
        absent: sessionToday.absent_count,
        late: sessionToday.late_count
      } : null
    };
  });

  // Calculate distinct students taught
  const distinctStudentIds = new Set(enrollments.map(e => e.student_id));

  // Recent attendance sessions
  const recentSessions = sessions
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(s => {
      const cls = classes.find(c => c.id === s.class_id) || {};
      const course = courses.find(c => c.id === s.subject_id) || {};
      return {
        id: s.id,
        date: s.date,
        className: cls.name,
        courseCode: course.code,
        courseName: course.name,
        total: s.total_students,
        present: s.present_count,
        absent: s.absent_count,
        late: s.late_count,
        percentage: s.total_students > 0 ? Number(((s.present_count / s.total_students) * 100).toFixed(1)) : 0
      };
    });

  res.json({
    faculty: {
      id: fac.id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      designation: fac.designation,
      employeeId: fac.employee_id
    },
    metrics: {
      assignedClassesCount: classes.length,
      assignedSubjectsCount: new Set(classes.map(c => c.course_id)).size,
      totalStudentsTaught: distinctStudentIds.size,
      totalSessionsConducted: sessions.length,
      completedTodayCount: todayClasses.filter(c => c.isCompletedToday).length,
      pendingTodayCount: todayClasses.filter(c => !c.isCompletedToday).length
    },
    todayClasses,
    recentSessions
  });
});

// GET /api/faculty/classes - List assigned classes & courses
router.get('/classes', (req, res) => {
  const fac = getFacultyRecord(req);
  if (!fac) return res.status(404).json({ error: 'Faculty profile not found.' });

  const classes = relationalDb.select('classes', c => c.faculty_id === fac.id);
  const courses = relationalDb.select('courses');
  const departments = relationalDb.select('departments');
  const enrollments = relationalDb.select('class_enrollments');

  const list = classes.map(cls => {
    const course = courses.find(c => c.id === cls.course_id) || {};
    const dept = departments.find(d => d.id === cls.department_id) || {};
    const enrolled = enrollments.filter(e => e.class_id === cls.id).length;

    return {
      id: cls.id,
      name: cls.name,
      courseId: cls.course_id,
      courseCode: course.code,
      courseName: course.name,
      departmentId: cls.department_id,
      departmentCode: dept.code,
      departmentName: dept.name,
      semester: cls.semester,
      section: cls.section,
      scheduleTime: cls.schedule_time,
      roomNo: cls.room_no,
      enrolledCount: enrolled
    };
  });

  res.json({ classes: list });
});

// GET /api/faculty/classes/:classId/students - Get students enrolled in a class for marking
router.get('/classes/:classId/students', (req, res) => {
  const { classId } = req.params;
  const { date } = req.query; // optional date check

  const cls = relationalDb.findById('classes', classId);
  if (!cls) return res.status(404).json({ error: 'Class not found.' });

  const enrollments = relationalDb.select('class_enrollments', e => e.class_id === classId);
  const students = relationalDb.select('students');
  const users = relationalDb.select('users');
  const departments = relationalDb.select('departments');

  // Check if attendance session already exists for this date
  const targetDate = date || new Date().toISOString().split('T')[0];
  const existingSession = relationalDb.findOne('attendance_sessions', s =>
    s.class_id === classId && s.date === targetDate
  );

  let existingRecords = [];
  if (existingSession) {
    existingRecords = relationalDb.select('attendance_records', r => r.session_id === existingSession.id);
  }

  const studentList = enrollments.map(enr => {
    const st = students.find(s => s.id === enr.student_id) || {};
    const u = users.find(usr => usr.id === st.user_id) || {};
    const dept = departments.find(d => d.id === st.department_id) || {};
    const existingRec = existingRecords.find(r => r.student_id === st.id);

    return {
      studentId: st.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      rollNumber: st.roll_number,
      registrationNo: st.registration_no,
      departmentCode: dept.code,
      departmentName: dept.name,
      semester: st.semester,
      section: st.section,
      currentStatus: existingRec ? existingRec.status : 'Present',
      remarks: existingRec ? existingRec.remarks : '',
      recordId: existingRec ? existingRec.id : null
    };
  }).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

  res.json({
    class: {
      id: cls.id,
      name: cls.name,
      courseId: cls.course_id,
      roomNo: cls.room_no
    },
    date: targetDate,
    isAlreadySubmitted: !!existingSession,
    existingSession: existingSession || null,
    totalEnrolled: studentList.length,
    students: studentList
  });
});

// POST /api/faculty/mark-attendance - Atomically save class attendance
router.post('/mark-attendance', (req, res) => {
  try {
    const { classId, subjectId, date, records, sessionTime } = req.body;
    const fac = getFacultyRecord(req);
    const facultyId = fac ? fac.id : 'fac_1';

    const result = TransactionService.submitAttendanceSession({
      classId,
      facultyId,
      subjectId,
      date,
      records,
      sessionTime,
      markedBy: req.user.id
    });

    res.status(201).json({
      message: 'Attendance saved successfully.',
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/faculty/update-record - Update an individual attendance record
router.put('/update-record', (req, res) => {
  try {
    const { recordId, newStatus, remarks } = req.body;
    if (!recordId || !newStatus) {
      return res.status(400).json({ error: 'recordId and newStatus are required.' });
    }

    const result = TransactionService.updateAttendanceRecord({
      recordId,
      newStatus,
      remarks,
      updatedBy: req.user.id,
      userRole: req.user.role
    });

    res.json({ message: 'Attendance record updated.', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/faculty/history - Past attendance sessions conducted by this faculty
router.get('/history', (req, res) => {
  const fac = getFacultyRecord(req);
  if (!fac) return res.status(404).json({ error: 'Faculty profile not found.' });

  const sessions = relationalDb.select('attendance_sessions', s => s.faculty_id === fac.id);
  const classes = relationalDb.select('classes');
  const courses = relationalDb.select('courses');

  const history = sessions
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(s => {
      const cls = classes.find(c => c.id === s.class_id) || {};
      const course = courses.find(c => c.id === s.subject_id) || {};
      const pct = s.total_students > 0 ? Number(((s.present_count / s.total_students) * 100).toFixed(1)) : 0;

      return {
        id: s.id,
        date: s.date,
        sessionTime: s.session_time,
        classId: s.class_id,
        className: cls.name,
        courseCode: course.code,
        courseName: course.name,
        total: s.total_students,
        present: s.present_count,
        absent: s.absent_count,
        late: s.late_count,
        percentage: pct,
        status: s.status
      };
    });

  res.json({ history });
});

// GET /api/faculty/class-report/:classId - Class-wise Attendance Report
router.get('/class-report/:classId', (req, res) => {
  const { classId } = req.params;
  const cls = relationalDb.findById('classes', classId);
  if (!cls) return res.status(404).json({ error: 'Class not found.' });

  const enrollments = relationalDb.select('class_enrollments', e => e.class_id === classId);
  const students = relationalDb.select('students');
  const users = relationalDb.select('users');
  const sessions = relationalDb.select('attendance_sessions', s => s.class_id === classId);
  const records = relationalDb.select('attendance_records', r => r.class_id === classId);
  const course = relationalDb.findById('courses', cls.course_id) || {};

  const minSetting = relationalDb.findOne('system_settings', s => s.key === 'min_attendance_percentage');
  const threshold = minSetting ? Number(minSetting.value) : 75;

  const studentReports = enrollments.map(enr => {
    const st = students.find(s => s.id === enr.student_id) || {};
    const u = users.find(usr => usr.id === st.user_id) || {};
    const stRecords = records.filter(r => r.student_id === st.id);
    const present = stRecords.filter(r => r.status === 'Present').length;
    const absent = stRecords.filter(r => r.status === 'Absent').length;
    const late = stRecords.filter(r => r.status === 'Late').length;
    const total = stRecords.length;
    const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

    return {
      studentId: st.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      rollNumber: st.roll_number,
      totalClasses: total,
      presentClasses: present,
      absentClasses: absent,
      lateClasses: late,
      attendancePercentage: percentage,
      isBelowThreshold: percentage < threshold,
      threshold
    };
  }).sort((a, b) => b.attendancePercentage - a.attendancePercentage);

  res.json({
    class: {
      id: cls.id,
      name: cls.name,
      courseCode: course.code,
      courseName: course.name,
      totalSessionsConducted: sessions.length
    },
    threshold,
    students: studentReports
  });
});

export default router;
