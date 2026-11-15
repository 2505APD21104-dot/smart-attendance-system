import express from 'express';
import bcrypt from 'bcryptjs';
import { relationalDb } from '../db/relational.js';
import { nosqlDb } from '../db/nosql.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(authenticate, authorize(['admin']));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const students = relationalDb.select('students');
    const faculty = relationalDb.select('faculty');
    const courses = relationalDb.select('courses');
    const classes = relationalDb.select('classes');
    const attendanceRecords = relationalDb.select('attendance_records');

    // Calculate overall attendance percentage
    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendancePercentage = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;

    // Fetch recent activity logs from Atlas (with safe fallback)
    let recentLogs = [];
    try {
      recentLogs = await nosqlDb.find('activity_logs', {}, { limit: 8, sort: { timestamp: -1 } });
    } catch (err) {
      console.warn('[Atlas Offline] Could not fetch recent logs:', err.message);
    }

    res.json({
      stats: {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: courses.length,
        totalClasses: classes.length,
        overallAttendancePercentage: attendancePercentage
      },
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/students
router.get('/students', (req, res) => {
  const students = relationalDb.select('students');
  const users = relationalDb.select('users');
  const departments = relationalDb.select('departments');

  const detailedStudents = students.map(st => {
    const user = users.find(u => u.id === st.user_id);
    const dept = departments.find(d => d.id === st.department_id);
    return {
      ...st,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      department_name: dept?.name
    };
  });

  res.json(detailedStudents);
});

// GET /api/admin/faculty
router.get('/faculty', (req, res) => {
  const facultyList = relationalDb.select('faculty');
  const users = relationalDb.select('users');
  const departments = relationalDb.select('departments');

  const detailedFaculty = facultyList.map(fac => {
    const user = users.find(u => u.id === fac.user_id);
    const dept = departments.find(d => d.id === fac.department_id);
    return {
      ...fac,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      department_name: dept?.name
    };
  });

  res.json(detailedFaculty);
});

// POST /api/admin/users (Create new user - student or faculty)
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName, departmentId, rollNumber, employeeId, semester, section, batchYear } = req.body;

    // Check if user exists
    const existing = relationalDb.findOne('users', u => u.email === email || u.username === username);
    if (existing) return res.status(400).json({ error: 'Email or username already exists.' });

    const password_hash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now();

    const txId = relationalDb.beginTransaction();
    try {
      relationalDb.insert('users', {
        id: userId,
        username,
        email,
        password_hash,
        role,
        first_name: firstName,
        last_name: lastName,
        avatar: null,
        created_at: new Date().toISOString()
      }, txId);

      if (role === 'student') {
        relationalDb.insert('students', {
          id: 'std_' + Date.now(),
          user_id: userId,
          roll_number: rollNumber,
          registration_no: 'REG_' + Date.now(),
          department_id: departmentId,
          semester: parseInt(semester),
          section,
          batch_year: batchYear
        }, txId);
      } else if (role === 'faculty') {
        relationalDb.insert('faculty', {
          id: 'fac_' + Date.now(),
          user_id: userId,
          employee_id: employeeId,
          department_id: departmentId,
          qualification: 'N/A',
          designation: 'Lecturer',
          joining_date: new Date().toISOString()
        }, txId);
      }

      relationalDb.commitTransaction(txId);

      // Log action to Atlas
      try {
        await nosqlDb.insertOne('activity_logs', {
          userId: req.user.id,
          userRole: req.user.role,
          action: `CREATE_${role.toUpperCase()}`,
          module: 'Admin',
          details: { createdUserId: userId, email },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (logErr) {
        console.warn('[Atlas Offline] Failed to log admin action:', logErr.message);
      }

      res.status(201).json({ message: 'User created successfully', userId });
    } catch (err) {
      relationalDb.rollbackTransaction(txId);
      throw err;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/departments
router.get('/departments', (req, res) => {
  res.json(relationalDb.select('departments'));
});

// GET /api/admin/courses
router.get('/courses', (req, res) => {
  res.json(relationalDb.select('courses'));
});

export default router;