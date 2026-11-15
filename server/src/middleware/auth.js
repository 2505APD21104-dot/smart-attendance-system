import jwt from 'jsonwebtoken';
import { relationalDb } from '../db/relational.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'apex-smart-attendance-super-secret-jwt-key-2025';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find user in relational database
    const user = relationalDb.findById('users', decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token: User no longer exists.' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar
    };

    // Attach role-specific entity IDs
    if (user.role === 'faculty') {
      const fac = relationalDb.findOne('faculty', f => f.user_id === user.id);
      if (fac) req.user.facultyId = fac.id;
    } else if (user.role === 'student') {
      const st = relationalDb.findOne('students', s => s.user_id === user.id);
      if (st) {
        req.user.studentId = st.id;
        req.user.rollNumber = st.roll_number;
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed. Token is invalid or expired.' });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. User authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}
