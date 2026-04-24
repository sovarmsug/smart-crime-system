const express = require('express');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      is_read,
      priority
    } = req.query;

    let query = db('notifications as n')
      .select([
        'n.*',
        'u.first_name as assigned_by_first_name',
        'u.last_name as assigned_by_last_name',
        'u.email as assigned_by_email'
      ])
      .leftJoin('users as u', 'n.assigned_by', 'u.id')
      .where('n.user_id', req.user.userId)
      .orderBy('n.created_at', 'desc');

    // Apply filters
    if (type) {
      query = query.where('n.type', type);
    }
    if (is_read !== undefined) {
      query = query.where('n.is_read', is_read === 'true');
    }
    if (priority) {
      query = query.where('n.priority', priority);
    }

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const notifications = await query.limit(limit).offset(offset);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count for current user
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await db('notifications')
      .where('user_id', req.user.userId)
      .where('is_read', false)
      .count('* as count')
      .first();

    res.json({ unread_count: parseInt(unreadCount.count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification belongs to user
    const notification = await db('notifications')
      .where({ id, user_id: req.user.userId })
      .first();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Mark as read
    const [updatedNotification] = await db('notifications')
      .where({ id })
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await db('notifications')
      .where('user_id', req.user.userId)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date()
      });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification belongs to user
    const notification = await db('notifications')
      .where({ id, user_id: req.user.userId })
      .first();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db('notifications').where({ id }).del();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create notification (internal use)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const {
      user_id,
      type,
      title,
      message,
      priority = 'medium',
      action_url,
      metadata
    } = req.body;

    // Validate inputs
    if (!user_id || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'User ID, type, title, and message are required' 
      });
    }

    if (!['role_assigned', 'role_updated', 'role_revoked', 'department_change', 'crime_assigned', 'assignment_updated'].includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    // Create notification
    const [notification] = await db('notifications')
      .insert({
        id: uuidv4(),
        user_id,
        type,
        title,
        message,
        priority,
        action_url,
        assigned_by: req.user.userId,
        metadata: metadata || {},
        created_at: new Date()
      })
      .returning('*');

    // Emit socket event for real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(`user_${user_id}`).emit('notification-received', notification);
    }

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get notification statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Get total notifications
    const totalNotifications = await db('notifications')
      .where('user_id', req.user.userId)
      .count('* as count')
      .first();

    // Get notifications by type
    const byType = await db('notifications')
      .where('user_id', req.user.userId)
      .select('type')
      .count('* as count')
      .groupBy('type')
      .orderBy('count', 'desc');

    // Get notifications by priority
    const byPriority = await db('notifications')
      .where('user_id', req.user.userId)
      .select('priority')
      .count('* as count')
      .groupBy('priority')
      .orderBy('count', 'desc');

    // Get read vs unread
    const readStats = await db('notifications')
      .where('user_id', req.user.userId)
      .select('is_read')
      .count('* as count')
      .groupBy('is_read');

    // Get recent notifications (last 7 days)
    const recentNotifications = await db('notifications')
      .where('user_id', req.user.userId)
      .where('created_at', '>=', db.raw("NOW() - INTERVAL '7 days'"))
      .count('* as count')
      .first();

    res.json({
      total: parseInt(totalNotifications.count),
      by_type: byType,
      by_priority: byPriority,
      read_stats: readStats,
      recent_7_days: parseInt(recentNotifications.count)
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

module.exports = router;
