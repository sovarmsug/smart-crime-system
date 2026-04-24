const Joi = require('joi');

// User registration validation
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().pattern(/^\+256\d{9}$|^0\d{9}$/).optional(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('citizen', 'police_officer', 'admin').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// User login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// Crime report validation
const validateCrimeReport = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    crime_type: Joi.string().valid(
      'theft', 'assault', 'burglary', 'vandalism', 'fraud', 
      'drug_offense', 'traffic_violation', 'domestic_violence', 
      'cyber_crime', 'murder', 'kidnapping', 'other'
    ).required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    address: Joi.string().max(500).optional(),
    district: Joi.string().max(100).optional(),
    county: Joi.string().max(100).optional(),
    subcounty: Joi.string().max(100).optional(),
    parish: Joi.string().max(100).optional(),
    village: Joi.string().max(100).optional(),
    incident_date: Joi.date().required(),
    evidence: Joi.array().items(Joi.string()).optional(),
    witnesses: Joi.array().items(Joi.object({
      name: Joi.string().max(100),
      phone: Joi.string().max(20),
      statement: Joi.string().max(500)
    })).optional(),
    notes: Joi.string().max(1000).optional(),
    is_anonymous: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// Alert validation
const validateAlert = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    message: Joi.string().min(10).max(1000).required(),
    alert_type: Joi.string().valid('crime_report', 'prediction_alert', 'emergency', 'system').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).optional(),
    area_description: Joi.string().max(500).optional(),
    radius_km: Joi.number().min(0.1).max(50).optional(),
    send_sms: Joi.boolean().optional(),
    send_email: Joi.boolean().optional(),
    send_push: Joi.boolean().optional(),
    target_users: Joi.array().items(Joi.string().uuid()).optional(),
    target_areas: Joi.array().items(Joi.string()).optional(),
    target_role: Joi.string().valid('all', 'citizens', 'police', 'admin').optional(),
    expires_at: Joi.date().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// Prediction validation
const validatePrediction = (req, res, next) => {
  const schema = Joi.object({
    model_name: Joi.string().required(),
    model_version: Joi.string().required(),
    prediction_type: Joi.string().valid('hotspot', 'crime_type', 'time_based', 'risk_level').required(),
    confidence_score: Joi.number().min(0).max(1).required(),
    prediction_data: Joi.object().required(),
    area: Joi.object({
      coordinates: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()))).required(),
      type: Joi.string().valid('Polygon').required()
    }).optional(),
    center_point: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).optional(),
    radius_km: Joi.number().min(0.1).max(50).optional(),
    prediction_start: Joi.date().required(),
    prediction_end: Joi.date().required(),
    time_period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly').required(),
    risk_level: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    risk_factors: Joi.array().items(Joi.string()).optional(),
    recommendations: Joi.string().max(1000).optional(),
    notes: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCrimeReport,
  validateAlert,
  validatePrediction
};
