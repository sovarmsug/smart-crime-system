const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search
    } = req.query;

    let query = db('users')
      .select([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'role',
        'status',
        'badge_number',
        'station',
        'email_verified',
        'phone_verified',
        'created_at',
        'updated_at'
      ])
      .orderBy('created_at', 'desc');

    // Apply filters
    if (role) {
      query = query.where('role', role);
    }
    if (status) {
      query = query.where('status', status);
    }
    if (search) {
      query = query.where(function() {
        this.where('first_name', 'ilike', `%${search}%`)
            .orWhere('last_name', 'ilike', `%${search}%`)
            .orWhere('email', 'ilike', `%${search}%`)
            .orWhere('phone_number', 'ilike', `%${search}%`);
      });
    }

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const users = await query.limit(limit).offset(offset);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    // Get total users
    const totalUsers = await db('users').count('* as count').first();

    // Get users by role
    const byRole = await db('users')
      .select('role')
      .count('* as count')
      .groupBy('role')
      .orderBy('count', 'desc');

    // Get users by status
    const byStatus = await db('users')
      .select('status')
      .count('* as count')
      .groupBy('status')
      .orderBy('count', 'desc');

    // Get verification stats
    const emailVerified = await db('users')
      .where('email_verified', true)
      .count('* as count')
      .first();

    const phoneVerified = await db('users')
      .where('phone_verified', true)
      .count('* as count')
      .first();

    // Get monthly registration trend
    const monthlyTrend = await db('users')
      .select(
        db.raw('TO_CHAR(created_at, \'YYYY-MM\') as month'),
        db.raw('COUNT(*) as count')
      )
      .groupBy(db.raw('TO_CHAR(created_at, \'YYYY-MM\')'))
      .orderBy('month', 'desc')
      .limit(12);

    res.json({
      total: parseInt(totalUsers.count),
      by_role: byRole,
      by_status: byStatus,
      verification: {
        email_verified: parseInt(emailVerified.count),
        phone_verified: parseInt(phoneVerified.count)
      },
      monthly_trend: monthlyTrend.reverse() // Show oldest to newest
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get single user by ID (admin only)
router.get('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .select([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'role',
        'status',
        'badge_number',
        'station',
        'email_verified',
        'phone_verified',
        'created_at',
        'updated_at'
      ])
      .where('id', id)
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's crime reports count
    const crimeReportsCount = await db('crime_reports')
      .where('reported_by', id)
      .count('* as count')
      .first();

    // Get user's alerts triggered count
    const alertsTriggeredCount = await db('alerts')
      .where('triggered_by', id)
      .count('* as count')
      .first();

    res.json({
      user: {
        ...user,
        stats: {
          crime_reports: parseInt(crimeReportsCount.count),
          alerts_triggered: parseInt(alertsTriggeredCount.count)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone_number,
      role,
      status,
      badge_number,
      station,
      email_verified,
      phone_verified
    } = req.body;

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (phone_number !== undefined) {
      // Check if phone number is already taken by another user
      const existingPhone = await db('users')
        .where({ phone_number })
        .whereNot({ id })
        .first();
      
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
      updateData.phone_number = phone_number;
    }
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (badge_number !== undefined) {
      // Check if badge number is already taken by another user
      const existingBadge = await db('users')
        .where({ badge_number })
        .whereNot({ id })
        .first();
      
      if (existingBadge) {
        return res.status(400).json({ error: 'Badge number already in use' });
      }
      updateData.badge_number = badge_number;
    }
    if (station !== undefined) updateData.station = station;
    if (email_verified !== undefined) updateData.email_verified = email_verified;
    if (phone_verified !== undefined) updateData.phone_verified = phone_verified;

    updateData.updated_at = new Date();

    const [updatedUser] = await db('users')
      .where({ id })
      .update(updateData)
      .returning([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'role',
        'status',
        'badge_number',
        'station',
        'email_verified',
        'phone_verified',
        'updated_at'
      ]);

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Suspend/Activate user (admin only)
router.put('/:id/status', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.userId && status !== 'active') {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const [updatedUser] = await db('users')
      .where({ id })
      .update({
        status,
        updated_at: new Date()
      })
      .returning([
        'id',
        'first_name',
        'last_name',
        'email',
        'status',
        'updated_at'
      ]);

    res.json({
      message: `User ${status} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user has associated crime reports
    const crimeReportsCount = await db('crime_reports')
      .where('reported_by', id)
      .count('* as count')
      .first();

    if (parseInt(crimeReportsCount.count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with associated crime reports. Consider suspending the account instead.' 
      });
    }

    const deleted = await db('users').where({ id }).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get police officers by station
router.get('/police/by-station', authMiddleware, async (req, res) => {
  try {
    const { station } = req.query;

    let query = db('users')
      .select([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'badge_number',
        'station'
      ])
      .where('role', 'police_officer')
      .where('status', 'active');

    if (station) {
      query = query.where('station', 'ilike', `%${station}%`);
    }

    const officers = await query.orderBy('last_name', 'asc');

    res.json({ officers });
  } catch (error) {
    console.error('Error fetching police officers:', error);
    res.status(500).json({ error: 'Failed to fetch police officers' });
  }
});

module.exports = router;
