import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { relationalDb } from './db/relational.js';
import { seedDatabase } from './db/seed.js';
import { connectMongo, disconnectMongo } from './db/mongo.js'; // <-- ADDED

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import facultyRoutes from './routes/faculty.js';
import studentRoutes from './routes/student.js';
import attendanceRoutes from './routes/attendance.js';
import databaseRoutes from './routes/database.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files if they exist
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Catch-all for frontend
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

async function startServer() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await connectMongo(); // <-- ADDED
    console.log('MongoDB connection attempt finished.');

    const existingUsers = relationalDb.select('users');
    if (existingUsers.length === 0) {
      console.log('No relational users found. Seeding database...');
      await seedDatabase();
      console.log('Seeding completed.');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await disconnectMongo();
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();