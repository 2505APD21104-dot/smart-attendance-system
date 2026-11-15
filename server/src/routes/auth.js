import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { relationalDb } from '../db/relational.js';
import { nosqlDb } from '../db/nosql.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, password, rememberMe } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Email/Username and Password are required.' });
    }

    const cleanLogin = login.trim().toLowerCase();

    // Find by email or username
    const user = relationalDb.findOne('users', u =>
      u.email.toLowerCase() === cleanLogin || u.username.toLowerCase() === cleanLogin
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    // Verify password hash
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    // Fetch role specific details
    let roleDetails = null;
    if (user.role === 'faculty') {
      const fac = relationalDb.findOne('faculty', f => f.user_id === user.id);
      if (fac) {
        const dept = relationalDb.findById('departments', fac.department_id);
        roleDetails = {
          facultyId: fac.id,
          employeeId: fac.employee_id,
          departmentId: fac.department_id,
          departmentName: dept?.name,
          designation: fac.designation,
          qualification: fac.qualification
        };
      }
    } else if (user.role === 'student') {
      const st = relationalDb.findOne('students', s => s.user_id === user.id);
      if (st) {
        const dept = relationalDb.findById('departments', st.department_id);
        roleDetails = {
          studentId: st.id,
          rollNumber: st.roll_number,
          registrationNo: st.registration_no,
          departmentId: st.department_id,
          departmentName: dept?.name,
          semester: st.semester,
          section: st.section,
          batchYear: st.batch_year
        };
      }
    }

    // Log login activity to NoSQL (MongoDB Atlas)
    try {
      await nosqlDb.insertOne('activity_logs', {
        userId: user.id,
        userRole: user.role,
        action: 'USER_LOGIN',
        module: 'Auth',
        details: { email: user.email, role: user.role },
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      });
    } catch (logErr) {
      console.warn('[Atlas Offline] Failed to log user login to Atlas:', logErr.message);
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        roleDetails
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = relationalDb.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let roleDetails = null;
  if (user.role === 'faculty') {
    const fac = relationalDb.findOne('faculty', f => f.user_id === user.id);
    if (fac) {
      const dept = relationalDb.findById('departments', fac.department_id);
      roleDetails = {
        facultyId: fac.id,
        employeeId: fac.employee_id,
        departmentId: fac.department_id,
        departmentName: dept?.name,
        designation: fac.designation,
        qualification: fac.qualification
      };
    }
  } else if (user.role === 'student') {
    const st = relationalDb.findOne('students', s => s.user_id === user.id);
    if (st) {
      const dept = relationalDb.findById('departments', st.department_id);
      roleDetails = {
        studentId: st.id,
        rollNumber: st.roll_number,
        registrationNo: st.registration_no,
        departmentId: st.department_id,
        departmentName: dept?.name,
        semester: st.semester,
        section: st.section,
        batchYear: st.batch_year
      };
    }
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      roleDetails
    }
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const user = relationalDb.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    // Avoid user enumeration: standard security practice
    return res.json({ message: 'If that email address is registered, password reset instructions have been sent.' });
  }

  // Create audit log & simulation code
  try {
    await nosqlDb.insertOne('activity_logs', {
      userId: user.id,
      userRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      module: 'Auth',
      details: { email },
      status: 'PENDING',
      timestamp: new Date().toISOString()
    });
  } catch (logErr) {
    console.warn('[Atlas Offline] Failed to log password reset request to Atlas:', logErr.message);
  }

  res.json({
    message: `Password reset verification token sent to ${email}. In this academic demo, you may use password 'Admin@123', 'Faculty@123', or 'Student@123'.`
  });
});

export default router;