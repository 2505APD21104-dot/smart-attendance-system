import express from 'express';
import { nosqlDb } from '../db/nosql.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await nosqlDb.find('notifications', {}, { sort: { createdAt: -1 } });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await nosqlDb.updateOne('notifications', { _id: id }, { isRead: true });
    res.json({ success: true, updated });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const all = await nosqlDb.find('notifications');
    await Promise.all(
      all.map(n => nosqlDb.updateOne('notifications', { _id: n._id }, { isRead: true }))
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating all notifications:', err);
    res.status(500).json({ error: 'Failed to update all notifications' });
  }
});

// POST /api/notifications
router.post('/', authenticate, async (req, res) => {
  try {
    const { recipientId, recipientRole, title, message, type } = req.body;
    
    const newNotif = await nosqlDb.insertOne('notifications', {
      recipientId,
      recipientRole,
      title,
      message,
      type: type || 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ success: true, newNotif });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;