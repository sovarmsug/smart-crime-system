const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validateAlert } = require('../utils/validation');
const { sendSMS, sendEmail, sendPushNotification } = require('../utils/notifications');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all alerts with filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      alert_type,
      priority,
      status,
      start_date,
      end_date
    } = req.query;

    let query = db('alerts')
      .select([
        'alerts.*',
        'crime_reports.title as crime_title',
        'crime_reports.crime_type',
        'users.first_name',
        'users.last_name'
      ])
      .leftJoin('crime_reports', 'alerts.crime_report_id', 'crime_reports.id')
      .leftJoin('users', 'alerts.triggered_by', 'users.id')
      .orderBy('alerts.created_at', 'desc');

    // Apply filters
    if (alert_type) {
      query = query.where('alerts.alert_type', alert_type);
    }
    if (priority) {
      query = query.where('alerts.priority', priority);
    }
    if (status) {
      query = query.where('alerts.status', status);
    }
    if (start_date) {
      query = query.where('alerts.created_at', '>=', start_date);
    }
    if (end_date) {
      query = query.where('alerts.created_at', '<=', end_date);
    }

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const alerts = await query.limit(limit).offset(offset);

    // Format location data
    const formattedAlerts = alerts.map(alert => ({
      ...alert,
      location: alert.location ? {
        type: 'Point',
        coordinates: [alert.location.x, alert.location.y]
      } : null
    }));

    res.json({
      alerts: formattedAlerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get single alert by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await db('alerts')
      .select([
        'alerts.*',
        'crime_reports.title as crime_title',
        'crime_reports.crime_type',
        'users.first_name',
        'users.last_name'
      ])
      .leftJoin('crime_reports', 'alerts.crime_report_id', 'crime_reports.id')
      .leftJoin('users', 'alerts.triggered_by', 'users.id')
      .where('alerts.id', id)
      .first();

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Format location data
    if (alert.location) {
      alert.location = {
        type: 'Point',
        coordinates: [alert.location.x, alert.location.y]
      };
    }

    res.json({ alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Create new alert
router.post('/', authMiddleware, roleMiddleware('police_officer', 'admin'), validateAlert, async (req, res) => {
  try {
    const {
      title,
      message,
      alert_type,
      priority,
      location,
      area_description,
      radius_km,
      send_sms = false,
      send_email = false,
      send_push = false,
      target_users,
      target_areas,
      target_role = 'all',
      expires_at
    } = req.body;

    // Create alert
    const [alert] = await db('alerts')
      .insert({
        id: uuidv4(),
        triggered_by: req.user.userId,
        title,
        message,
        alert_type,
        priority,
        location: location ? db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [location.longitude, location.latitude]) : null,
        area_description,
        radius_km,
        send_sms,
        send_email,
        send_push,
        target_users: target_users || [],
        target_areas: target_areas || [],
        target_role,
        expires_at
      })
      .returning('*');

    // Get target users for notification
    let targetUsersQuery = db('users').where('status', 'active');
    
    if (target_role !== 'all') {
      targetUsersQuery = targetUsersQuery.where('role', target_role);
    }
    
    if (target_users && target_users.length > 0) {
      targetUsersQuery = targetUsersQuery.whereIn('id', target_users);
    }

    const targetUsers = await targetUsersQuery;

    // Initialize delivery status
    const deliveryStatus = {
      sms: { sent: 0, failed: 0, total: 0 },
      email: { sent: 0, failed: 0, total: 0 },
      push: { sent: 0, failed: 0, total: 0 }
    };

    // Send notifications
    try {
      if (send_sms) {
        deliveryStatus.sms.total = targetUsers.filter(u => u.phone_number).length;
        for (const user of targetUsers) {
          if (user.phone_number) {
            try {
              await sendSMS(user.phone_number, message);
              deliveryStatus.sms.sent++;
            } catch (error) {
              console.error(`SMS failed for ${user.phone_number}:`, error);
              deliveryStatus.sms.failed++;
            }
          }
        }
      }

      if (send_email) {
        deliveryStatus.email.total = targetUsers.filter(u => u.email).length;
        for (const user of targetUsers) {
          try {
            await sendEmail(user.email, title, message);
            deliveryStatus.email.sent++;
          } catch (error) {
            console.error(`Email failed for ${user.email}:`, error);
            deliveryStatus.email.failed++;
          }
        }
      }

      if (send_push) {
        deliveryStatus.push.total = targetUsers.length;
        for (const user of targetUsers) {
          try {
            await sendPushNotification(user.id, title, message);
            deliveryStatus.push.sent++;
          } catch (error) {
            console.error(`Push notification failed for user ${user.id}:`, error);
            deliveryStatus.push.failed++;
          }
        }
      }

      // Update alert with delivery status
      await db('alerts')
        .where({ id: alert.id })
        .update({
          status: 'sent',
          sent_at: new Date(),
          delivery_status: deliveryStatus,
          updated_at: new Date()
        });

    } catch (notificationError) {
      console.error('Notification sending failed:', notificationError);
      
      // Update alert with error status
      await db('alerts')
        .where({ id: alert.id })
        .update({
          status: 'failed',
          error_message: notificationError.message,
          delivery_status: deliveryStatus,
          updated_at: new Date()
        });
    }

    // Emit real-time alert
    req.app.get('io').emit('new-alert', {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      alert_type: alert.alert_type,
      priority: alert.priority,
      location: location || null,
      created_at: alert.created_at
    });

    res.status(201).json({
      message: 'Alert created and sent successfully',
      alert: {
        ...alert,
        delivery_status: deliveryStatus
      }
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert status
router.put('/:id/status', authMiddleware, roleMiddleware('police_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'sent', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [updatedAlert] = await db('alerts')
      .where({ id })
      .update({
        status,
        updated_at: new Date()
      })
      .returning('*');

    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      message: 'Alert status updated successfully',
      alert: updatedAlert
    });
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

// Delete alert (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db('alerts').where({ id }).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Get alert statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query; // period in days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total alerts
    const totalAlerts = await db('alerts')
      .where('created_at', '>=', startDate)
      .count('* as count')
      .first();

    // Get alerts by type
    const byType = await db('alerts')
      .select('alert_type')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('alert_type')
      .orderBy('count', 'desc');

    // Get alerts by priority
    const byPriority = await db('alerts')
      .select('priority')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('priority')
      .orderBy('count', 'desc');

    // Get alerts by status
    const byStatus = await db('alerts')
      .select('status')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('status')
      .orderBy('count', 'desc');

    // Get daily trend
    const dailyTrend = await db('alerts')
      .select(
        db.raw('DATE(created_at) as date'),
        db.raw('COUNT(*) as count')
      )
      .where('created_at', '>=', startDate)
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    res.json({
      total: parseInt(totalAlerts.count),
      by_type: byType,
      by_priority: byPriority,
      by_status: byStatus,
      daily_trend: dailyTrend,
      period_days: parseInt(period)
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

module.exports = router;
