const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Smart Crime Prediction System API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock auth endpoints for demo
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo users
  const users = {
    'admin@smartcrime.ug': {
      id: 'admin-uuid',
      first_name: 'System',
      last_name: 'Administrator',
      email: 'admin@smartcrime.ug',
      role: 'admin',
      status: 'active'
    },
    'police@smartcrime.ug': {
      id: 'police-uuid',
      first_name: 'Police',
      last_name: 'Officer',
      email: 'police@smartcrime.ug',
      role: 'police_officer',
      status: 'active'
    },
    'citizen@smartcrime.ug': {
      id: 'citizen-uuid',
      first_name: 'John',
      last_name: 'Citizen',
      email: 'citizen@smartcrime.ug',
      role: 'citizen',
      status: 'active'
    }
  };

  const user = users[email];
  if (user && password === 'admin123') {
    res.json({
      message: 'Login successful',
      user,
      token: 'demo-jwt-token-' + Date.now()
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  res.json({ 
    valid: true, 
    user: { 
      id: 'demo-user', 
      email: 'demo@smartcrime.ug', 
      role: 'citizen' 
    } 
  });
});

// Mock crime data
app.get('/api/crimes', (req, res) => {
  const mockCrimes = [
    {
      id: '1',
      title: 'Mobile Phone Theft',
      description: 'Phone stolen on Kampala Road',
      crime_type: 'theft',
      severity: 'medium',
      status: 'reported',
      location: { type: 'Point', coordinates: [32.5825, 0.3476] },
      address: 'Kampala Road',
      district: 'Kampala',
      incident_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Burglary at Shop',
      description: 'Unknown persons broke into a retail shop',
      crime_type: 'burglary',
      severity: 'high',
      status: 'under_investigation',
      location: { type: 'Point', coordinates: [32.5750, 0.3450] },
      address: 'Nakasero Market',
      district: 'Kampala',
      incident_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  res.json({
    reports: mockCrimes,
    pagination: { page: 1, limit: 20, total: 2, pages: 1 }
  });
});

app.get('/api/crimes/stats/overview', (req, res) => {
  res.json({
    total: 8,
    by_type: [
      { crime_type: 'theft', count: 3 },
      { crime_type: 'assault', count: 2 },
      { crime_type: 'burglary', count: 2 },
      { crime_type: 'vandalism', count: 1 }
    ],
    by_severity: [
      { severity: 'low', count: 2 },
      { severity: 'medium', count: 3 },
      { severity: 'high', count: 2 },
      { severity: 'critical', count: 1 }
    ],
    by_status: [
      { status: 'reported', count: 4 },
      { status: 'under_investigation', count: 3 },
      { status: 'resolved', count: 1 }
    ],
    daily_trend: [
      { date: '2026-04-10', count: 2 },
      { date: '2026-04-11', count: 3 },
      { date: '2026-04-12', count: 3 }
    ],
    top_districts: [
      { district: 'Kampala', count: 6 },
      { district: 'Wakiso', count: 2 }
    ],
    period_days: 30
  });
});

// Mock alerts
app.get('/api/alerts', (req, res) => {
  const mockAlerts = [
    {
      id: '1',
      title: 'High Crime Activity Alert',
      message: 'Increased theft activity reported in Kampala Central',
      alert_type: 'crime_report',
      priority: 'high',
      status: 'sent',
      created_at: new Date().toISOString()
    }
  ];

  res.json({
    alerts: mockAlerts,
    pagination: { page: 1, limit: 20, total: 1, pages: 1 }
  });
});

app.get('/api/alerts/stats/overview', (req, res) => {
  res.json({
    total: 5,
    by_type: [
      { alert_type: 'crime_report', count: 3 },
      { alert_type: 'prediction_alert', count: 2 }
    ],
    by_priority: [
      { priority: 'low', count: 1 },
      { priority: 'medium', count: 2 },
      { priority: 'high', count: 2 }
    ],
    by_status: [
      { status: 'sent', count: 4 },
      { status: 'pending', count: 1 }
    ],
    daily_trend: [
      { date: '2026-04-10', count: 1 },
      { date: '2026-04-11', count: 2 },
      { date: '2026-04-12', count: 2 }
    ],
    period_days: 30
  });
});

// Mock predictions
app.get('/api/predictions', (req, res) => {
  const mockPredictions = [
    {
      id: '1',
      model_name: 'random_forest_v1',
      model_version: '1.0.0',
      prediction_type: 'hotspot',
      confidence_score: 0.85,
      risk_level: 'high',
      prediction_start: new Date().toISOString(),
      prediction_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      time_period: 'daily',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  res.json({
    predictions: mockPredictions,
    pagination: { page: 1, limit: 20, total: 1, pages: 1 }
  });
});

app.get('/api/predictions/stats/overview', (req, res) => {
  res.json({
    total: 3,
    by_type: [
      { prediction_type: 'hotspot', count: 2 },
      { prediction_type: 'crime_type', count: 1 }
    ],
    by_risk_level: [
      { risk_level: 'low', count: 1 },
      { risk_level: 'medium', count: 1 },
      { risk_level: 'high', count: 1 }
    ],
    by_model: [
      { model_name: 'random_forest_v1', count: 3 }
    ],
    performance: {
      avg_confidence_score: 0.82,
      avg_accuracy_score: 0.78
    },
    daily_trend: [
      { date: '2026-04-10', count: 1 },
      { date: '2026-04-11', count: 1 },
      { date: '2026-04-12', count: 1 }
    ],
    period_days: 30
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n\n=== Smart Crime Prediction System API ===`);
  console.log(`\nServer running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`\nDemo Accounts:`);
  console.log(`- Admin: admin@smartcrime.ug / admin123`);
  console.log(`- Police: police@smartcrime.ug / admin123`);
  console.log(`- Citizen: citizen@smartcrime.ug / admin123`);
  console.log(`\nServer is ready for frontend connection!`);
  console.log(`=====================================\n\n`);
});

module.exports = app;
