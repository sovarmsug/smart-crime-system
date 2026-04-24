const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all crime assignments (admin only)
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      officer_id,
      crime_id
    } = req.query;

    let query = db('crime_assignments as ca')
      .select([
        'ca.*',
        'cr.title as crime_title',
        'cr.description as crime_description',
        'cr.crime_type',
        'cr.severity',
        'cr.location',
        'cr.address',
        'cr.district',
        'cr.incident_date',
        'cr.status as crime_status',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone_number',
        'u.role as officer_role',
        'u.station'
      ])
      .leftJoin('crime_reports as cr', 'ca.crime_id', 'cr.id')
      .leftJoin('users as u', 'ca.officer_id', 'u.id')
      .orderBy('ca.created_at', 'desc');

    // Apply filters
    if (status) {
      query = query.where('ca.status', status);
    }
    if (officer_id) {
      query = query.where('ca.officer_id', officer_id);
    }
    if (crime_id) {
      query = query.where('ca.crime_id', crime_id);
    }

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const assignments = await query.limit(limit).offset(offset);

    res.json({
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get available officers for assignment (admin only)
router.get('/officers/available', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { specialization, district } = req.query;

    let query = db('users')
      .select([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'role',
        'station',
        'badge_number'
      ])
      .whereIn('role', ['police_officer', 'district_commander', 'regional_coordinator', 'dpcs', 'rpcs'])
      .where('status', 'active');

    // Filter by specialization if provided
    if (specialization) {
      query = query.where('specialization', 'ilike', `%${specialization}%`);
    }

    // Filter by district if provided
    if (district) {
      query = query.where('district', 'ilike', `%${district}%`);
    }

    const officers = await query.orderBy('last_name', 'asc');

    // Get current assignment counts for each officer
    const officersWithAssignments = await Promise.all(
      officers.map(async (officer) => {
        const currentAssignments = await db('crime_assignments')
          .where('officer_id', officer.id)
          .whereIn('status', ['assigned', 'in_progress'])
          .count('* as count')
          .first();

        const maxAssignments = getMaxAssignments(officer.role);

        return {
          ...officer,
          current_assignments: parseInt(currentAssignments.count),
          max_assignments: maxAssignments,
          is_available: parseInt(currentAssignments.count) < maxAssignments,
          specialization: getSpecialization(officer.role)
        };
      })
    );

    res.json({ officers: officersWithAssignments });
  } catch (error) {
    console.error('Error fetching available officers:', error);
    res.status(500).json({ error: 'Failed to fetch available officers' });
  }
});

// Assign officer to crime (admin only)
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { crime_id, officer_id, notes } = req.body;

    // Validate inputs
    if (!crime_id || !officer_id) {
      return res.status(400).json({ error: 'Crime ID and Officer ID are required' });
    }

    // Check if crime exists
    const crime = await db('crime_reports').where({ id: crime_id }).first();
    if (!crime) {
      return res.status(404).json({ error: 'Crime report not found' });
    }

    // Check if officer exists and is active
    const officer = await db('users')
      .where({ id: officer_id, status: 'active' })
      .whereIn('role', ['police_officer', 'district_commander', 'regional_coordinator', 'dpcs', 'rpcs'])
      .first();
    
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found or not eligible for assignment' });
    }

    // Check if officer is available
    const currentAssignments = await db('crime_assignments')
      .where('officer_id', officer_id)
      .whereIn('status', ['assigned', 'in_progress'])
      .count('* as count')
      .first();

    const maxAssignments = getMaxAssignments(officer.role);
    if (parseInt(currentAssignments.count) >= maxAssignments) {
      return res.status(400).json({ error: 'Officer has reached maximum assignments' });
    }

    // Check if crime is already assigned
    const existingAssignment = await db('crime_assignments')
      .where('crime_id', crime_id)
      .whereIn('status', ['assigned', 'in_progress'])
      .first();

    if (existingAssignment) {
      return res.status(400).json({ error: 'Crime is already assigned to an officer' });
    }

    // Create assignment
    const [assignment] = await db('crime_assignments')
      .insert({
        id: uuidv4(),
        crime_id,
        officer_id,
        assigned_by: req.user.userId,
        status: 'assigned',
        notes,
        created_at: new Date()
      })
      .returning('*');

    // Update crime status
    await db('crime_reports')
      .where({ id: crime_id })
      .update({
        status: 'under_investigation',
        updated_at: new Date()
      });

    // Get assignment details for response
    const assignmentDetails = await db('crime_assignments as ca')
      .select([
        'ca.*',
        'cr.title as crime_title',
        'cr.description as crime_description',
        'cr.crime_type',
        'cr.severity',
        'cr.location',
        'cr.address',
        'cr.district',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone_number',
        'u.role as officer_role',
        'u.station'
      ])
      .leftJoin('crime_reports as cr', 'ca.crime_id', 'cr.id')
      .leftJoin('users as u', 'ca.officer_id', 'u.id')
      .where('ca.id', assignment.id)
      .first();

    // Emit socket event for real-time notification
    const io = require('../server').io;
    if (io) {
      io.emit('crime-assigned', {
        assignment: assignmentDetails,
        assigned_by: req.user.email
      });

      // Send notification to assigned officer
      io.to(`user_${officer_id}`).emit('role-assigned', {
        type: 'crime_assigned',
        title: 'New Crime Assignment',
        message: `You have been assigned to investigate: ${crime.title}`,
        crime_id,
        assigned_by: req.user.email,
        assignedAt: new Date().toISOString(),
        priority: 'high',
        actionUrl: `/crimes/${crime_id}`
      });
    }

    res.status(201).json({
      message: 'Officer assigned to crime successfully',
      assignment: assignmentDetails
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to assign officer to crime' });
  }
});

// Update assignment status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get assignment
    const assignment = await db('crime_assignments').where({ id }).first();
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check permissions - officer can update their own assignments, admin can update any
    if (assignment.officer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this assignment' });
    }

    // Update assignment
    const updateData = { status, updated_at: new Date() };
    if (notes) updateData.notes = notes;

    const [updatedAssignment] = await db('crime_assignments')
      .where({ id })
      .update(updateData)
      .returning('*');

    // Update crime status based on assignment status
    let crimeStatus = 'reported';
    if (status === 'in_progress') crimeStatus = 'under_investigation';
    else if (status === 'completed') crimeStatus = 'resolved';
    else if (status === 'cancelled') crimeStatus = 'reported';

    await db('crime_reports')
      .where({ id: assignment.crime_id })
      .update({
        status: crimeStatus,
        updated_at: new Date()
      });

    // Emit socket event for real-time update
    const io = require('../server').io;
    if (io) {
      io.emit('assignment-updated', {
        assignment_id: id,
        status,
        updated_by: req.user.email
      });
    }

    res.json({
      message: 'Assignment status updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'Failed to update assignment status' });
  }
});

// Get my assignments (for logged-in officer)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = db('crime_assignments as ca')
      .select([
        'ca.*',
        'cr.title as crime_title',
        'cr.description as crime_description',
        'cr.crime_type',
        'cr.severity',
        'cr.location',
        'cr.address',
        'cr.district',
        'cr.incident_date',
        'cr.status as crime_status',
        'cr.created_at as crime_created_at'
      ])
      .leftJoin('crime_reports as cr', 'ca.crime_id', 'cr.id')
      .where('ca.officer_id', req.user.userId)
      .orderBy('ca.created_at', 'desc');

    if (status) {
      query = query.where('ca.status', status);
    }

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const assignments = await query.limit(limit).offset(offset);

    res.json({
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching my assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Helper functions
function getMaxAssignments(role) {
  const assignments = {
    'police_officer': 5,
    'district_commander': 8,
    'regional_coordinator': 10,
    'dpcs': 12,
    'rpcs': 10,
    'admin': 15
  };
  return assignments[role] || 5;
}

function getSpecialization(role) {
  const specializations = {
    'police_officer': ['General Investigation', 'Patrol', 'Response'],
    'district_commander': ['District Operations', 'Coordination', 'Management'],
    'regional_coordinator': ['Regional Strategy', 'Multi-district Coordination'],
    'dpcs': ['Criminal Investigation', 'Forensics', 'Major Crimes'],
    'rpcs': ['Regional Police Service', 'Strategic Planning'],
    'admin': ['System Administration', 'Overall Management']
  };
  return specializations[role] || ['General Duties'];
}

module.exports = router;
