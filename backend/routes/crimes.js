const express = require('express');
const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/**
 * =========================
 * CREATE CRIME REPORT
 * =========================
 */
router.post('/', async (req, res) => {
  try {
    console.log("📩 Incoming Crime Report:", req.body);

    const {
      title,
      description,
      crime_type,
      severity,
      location,
      address,
      district,
      county,
      subcounty,
      parish,
      village,
      incident_date,
      evidence,
      witnesses,
      notes,
      is_anonymous
    } = req.body;

    // Validation (basic safety check)
    if (!title || !description || !crime_type) {
      return res.status(400).json({
        error: "Title, description, and crime_type are required"
      });
    }

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        error: "Location (latitude & longitude) is required"
      });
    }

    const [report] = await db('crime_reports')
      .insert({
        id: uuidv4(),
        reported_by: null, // simplified for testing (no auth yet)
        title,
        description,
        crime_type,
        severity,
        location: db.raw(
          `ST_SetSRID(ST_MakePoint(?, ?), 4326)`,
          [location.longitude, location.latitude]
        ),
        address,
        district,
        county,
        subcounty,
        parish,
        village,
        incident_date,
        evidence: evidence || [],
        witnesses: witnesses || [],
        notes,
        is_anonymous: is_anonymous || false,
        created_at: new Date()
      })
      .returning('*');

    res.status(201).json({
      message: "Crime report submitted successfully",
      report
    });

  } catch (error) {
    console.error("❌ CREATE ERROR:", error);

    res.status(500).json({
      error: "Failed to create crime report",
      details: error.message
    });
  }
});

/**
 * =========================
 * GET ALL REPORTS (TEST)
 * =========================
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reports = await db('crime_reports')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('crime_reports').count('* as total').first();
    const total = parseInt(totalCount.total);

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch reports"
    });
  }
});

module.exports = router;