import express from 'express';
import { relationalDb } from '../db/relational.js';
import { nosqlDb } from '../db/nosql.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize(['student']));

// GET /api/student/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const user = relationalDb.findById('users', req.user.id);
    const student = relationalDb.findOne('students', s => s.user_id === user.id);

    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const enrollments = relationalDb.select('class_enrollments', e => e.student_id === student.id);
    const classIds = enrollments.map(e => e.class_id);
    
    const classes = relationalDb.select('classes').filter(c => classIds.includes(c.id));
    const courses = relationalDb.select('courses');
    const facultyList = relationalDb.select('faculty');
    const users = relationalDb.select('users');

    const detailedClasses = classes.map(cls => {
      const course = courses.find(c => c.id === cls.course_id);
      const fac = facultyList.find(f => f.id === cls.faculty_id);
      const facUser = fac ? users.find(u => u.id === fac.user_id) : null;
      
      const records = relationalDb.select('attendance_records', r => r.student_id === student.id && r.class_id === cls.id);
      const total = records.length;
      const present = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      
      return {
        ...cls,
        courseName: course?.name,
        courseCode: course?.code,
        facultyName: facUser ? `${facUser.first_name} ${facUser.last_name}` : 'N/A',
        attendancePercentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
      };
    });

    // Fetch recent notifications (with safe fallback)
    let notifications = [];
    try {
      notifications = await nosqlDb.find('notifications', { recipientId: student.id }, { limit: 5, sort: { createdAt: -1 } });
    } catch (err) {
      console.warn('[Atlas Offline] Could not fetch student notifications:', err.message);
    }

    res.json({
      student: {
        ...student,
        firstName: user.first_name,
        lastName: user.last_name
      },
      classes: detailedClasses,
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/attendance
router.get('/attendance', (req, res) => {
  const user = relationalDb.findById('users', req.user.id);
  const student = relationalDb.findOne('students', s => s.user_id === user.id);
  
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const records = relationalDb.select('attendance_records', r => r.student_id === student.id);
  const courses = relationalDb.select('courses');
  
  const detailedRecords = records.map(rec => {
    const course = courses.find(c => c.id === rec.subject_id);
    return {
      ...rec,
      subjectName: course?.name,
      subjectCode: course?.code
    };
  });

  res.json(detailedRecords);
});

export default router;