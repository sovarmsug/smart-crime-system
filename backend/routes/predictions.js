const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validatePrediction } = require('../utils/validation');
const { runCrimePrediction } = require('../utils/ml-predictions');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all predictions with filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      prediction_type,
      risk_level,
      model_name,
      start_date,
      end_date,
      active_only = false
    } = req.query;

    let query = db('predictions')
      .select([
        'predictions.*'
      ])
      .orderBy('predictions.created_at', 'desc');

    // Apply filters
    if (prediction_type) {
      query = query.where('predictions.prediction_type', prediction_type);
    }
    if (risk_level) {
      query = query.where('predictions.risk_level', risk_level);
    }
    if (model_name) {
      query = query.where('predictions.model_name', model_name);
    }
    if (start_date) {
      query = query.where('predictions.prediction_start', '>=', start_date);
    }
    if (end_date) {
      query = query.where('predictions.prediction_end', '<=', end_date);
    }
    if (active_only === 'true') {
      query = query.where('predictions.is_active', true)
                  .where('predictions.prediction_end', '>=', new Date());
    }

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const predictions = await query.limit(limit).offset(offset);

    // Format geographic data
    const formattedPredictions = predictions.map(prediction => ({
      ...prediction,
      area: prediction.area ? {
        type: 'Polygon',
        coordinates: JSON.parse(prediction.area).coordinates
      } : null,
      center_point: prediction.center_point ? {
        type: 'Point',
        coordinates: [prediction.center_point.x, prediction.center_point.y]
      } : null
    }));

    res.json({
      predictions: formattedPredictions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get single prediction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const prediction = await db('predictions').where({ id }).first();

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    // Format geographic data
    if (prediction.area) {
      prediction.area = {
        type: 'Polygon',
        coordinates: JSON.parse(prediction.area).coordinates
      };
    }

    if (prediction.center_point) {
      prediction.center_point = {
        type: 'Point',
        coordinates: [prediction.center_point.x, prediction.center_point.y]
      };
    }

    res.json({ prediction });
  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

// Create new prediction (police and admin only)
router.post('/', authMiddleware, roleMiddleware('police_officer', 'admin'), validatePrediction, async (req, res) => {
  try {
    const {
      model_name,
      model_version,
      prediction_type,
      confidence_score,
      prediction_data,
      area,
      center_point,
      radius_km,
      prediction_start,
      prediction_end,
      time_period,
      risk_level,
      risk_factors,
      recommendations,
      notes
    } = req.body;

    // Create prediction
    const [prediction] = await db('predictions')
      .insert({
        id: uuidv4(),
        model_name,
        model_version,
        prediction_type,
        confidence_score,
        prediction_data,
        area: area ? db.raw(`ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)`, [JSON.stringify(area)]) : null,
        center_point: center_point ? db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [center_point.longitude, center_point.latitude]) : null,
        radius_km,
        prediction_start,
        prediction_end,
        time_period,
        risk_level,
        risk_factors: risk_factors || [],
        recommendations,
        notes
      })
      .returning('*');

    // Emit real-time prediction update
    req.app.get('io').emit('new-prediction', {
      id: prediction.id,
      model_name: prediction.model_name,
      prediction_type: prediction.prediction_type,
      risk_level: prediction.risk_level,
      confidence_score: prediction.confidence_score,
      center_point: center_point || null,
      prediction_start: prediction.prediction_start,
      prediction_end: prediction.prediction_end
    });

    res.status(201).json({
      message: 'Prediction created successfully',
      prediction
    });
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ error: 'Failed to create prediction' });
  }
});

// Run automated crime prediction
router.post('/run-prediction', authMiddleware, roleMiddleware('police_officer', 'admin'), async (req, res) => {
  try {
    const {
      model_name = 'random_forest_v1',
      prediction_type = 'hotspot',
      time_period = 'daily',
      days_ahead = 7,
      area_bounds // { north, south, east, west }
    } = req.body;

    // Run the ML prediction
    const predictionResult = await runCrimePrediction({
      model_name,
      prediction_type,
      time_period,
      days_ahead,
      area_bounds
    });

    if (!predictionResult.success) {
      return res.status(500).json({ 
        error: 'Prediction failed', 
        details: predictionResult.error 
      });
    }

    // Save prediction to database
    const [prediction] = await db('predictions')
      .insert({
        id: uuidv4(),
        model_name: predictionResult.model_name,
        model_version: predictionResult.model_version,
        prediction_type: predictionResult.prediction_type,
        confidence_score: predictionResult.confidence_score,
        prediction_data: predictionResult.prediction_data,
        area: predictionResult.area ? db.raw(`ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)`, [JSON.stringify(predictionResult.area)]) : null,
        center_point: predictionResult.center_point ? db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [predictionResult.center_point.longitude, predictionResult.center_point.latitude]) : null,
        radius_km: predictionResult.radius_km,
        prediction_start: predictionResult.prediction_start,
        prediction_end: predictionResult.prediction_end,
        time_period: predictionResult.time_period,
        risk_level: predictionResult.risk_level,
        risk_factors: predictionResult.risk_factors,
        recommendations: predictionResult.recommendations
      })
      .returning('*');

    // Emit real-time prediction
    req.app.get('io').emit('prediction-generated', {
      id: prediction.id,
      model_name: prediction.model_name,
      prediction_type: prediction.prediction_type,
      risk_level: prediction.risk_level,
      confidence_score: prediction.confidence_score,
      area: predictionResult.area,
      prediction_start: prediction.prediction_start,
      prediction_end: prediction.prediction_end
    });

    res.status(201).json({
      message: 'Crime prediction generated successfully',
      prediction
    });
  } catch (error) {
    console.error('Error running prediction:', error);
    res.status(500).json({ error: 'Failed to run crime prediction' });
  }
});

// Update prediction accuracy (when actual outcomes are known)
router.put('/:id/accuracy', authMiddleware, roleMiddleware('police_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_outcome, accuracy_score } = req.body;

    const prediction = await db('predictions').where({ id }).first();
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    const updateData = {};
    if (actual_outcome !== undefined) {
      updateData.actual_outcome = actual_outcome;
    }
    if (accuracy_score !== undefined) {
      updateData.accuracy_score = accuracy_score;
    }
    updateData.updated_at = new Date();

    const [updatedPrediction] = await db('predictions')
      .where({ id })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Prediction accuracy updated successfully',
      prediction: updatedPrediction
    });
  } catch (error) {
    console.error('Error updating prediction accuracy:', error);
    res.status(500).json({ error: 'Failed to update prediction accuracy' });
  }
});

// Deactivate prediction
router.put('/:id/deactivate', authMiddleware, roleMiddleware('police_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedPrediction] = await db('predictions')
      .where({ id })
      .update({
        is_active: false,
        updated_at: new Date()
      })
      .returning('*');

    if (!updatedPrediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({
      message: 'Prediction deactivated successfully',
      prediction: updatedPrediction
    });
  } catch (error) {
    console.error('Error deactivating prediction:', error);
    res.status(500).json({ error: 'Failed to deactivate prediction' });
  }
});

// Delete prediction (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db('predictions').where({ id }).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({ message: 'Prediction deleted successfully' });
  } catch (error) {
    console.error('Error deleting prediction:', error);
    res.status(500).json({ error: 'Failed to delete prediction' });
  }
});

// Get prediction statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query; // period in days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total predictions
    const totalPredictions = await db('predictions')
      .where('created_at', '>=', startDate)
      .count('* as count')
      .first();

    // Get predictions by type
    const byType = await db('predictions')
      .select('prediction_type')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('prediction_type')
      .orderBy('count', 'desc');

    // Get predictions by risk level
    const byRiskLevel = await db('predictions')
      .select('risk_level')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('risk_level')
      .orderBy('count', 'desc');

    // Get predictions by model
    const byModel = await db('predictions')
      .select('model_name')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('model_name')
      .orderBy('count', 'desc');

    // Get average confidence score
    const avgConfidence = await db('predictions')
      .where('created_at', '>=', startDate)
      .avg('confidence_score as avg_confidence')
      .first();

    // Get average accuracy score (for predictions with actual outcomes)
    const avgAccuracy = await db('predictions')
      .where('created_at', '>=', startDate)
      .whereNotNull('accuracy_score')
      .avg('accuracy_score as avg_accuracy')
      .first();

    // Get daily trend
    const dailyTrend = await db('predictions')
      .select(
        db.raw('DATE(created_at) as date'),
        db.raw('COUNT(*) as count')
      )
      .where('created_at', '>=', startDate)
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    res.json({
      total: parseInt(totalPredictions.count),
      by_type: byType,
      by_risk_level: byRiskLevel,
      by_model: byModel,
      performance: {
        avg_confidence_score: parseFloat(avgConfidence.avg_confidence) || 0,
        avg_accuracy_score: parseFloat(avgAccuracy.avg_accuracy) || 0
      },
      daily_trend: dailyTrend,
      period_days: parseInt(period)
    });
  } catch (error) {
    console.error('Error fetching prediction statistics:', error);
    res.status(500).json({ error: 'Failed to fetch prediction statistics' });
  }
});

// Get active predictions for map visualization
router.get('/map/active', authMiddleware, async (req, res) => {
  try {
    const { risk_level } = req.query;

    let query = db('predictions')
      .select([
        'id',
        'model_name',
        'prediction_type',
        'risk_level',
        'confidence_score',
        'area',
        'center_point',
        'radius_km',
        'prediction_start',
        'prediction_end',
        'risk_factors',
        'recommendations'
      ])
      .where('is_active', true)
      .where('prediction_end', '>=', new Date());

    if (risk_level) {
      query = query.where('risk_level', risk_level);
    }

    const predictions = await query;

    // Format for map visualization
    const formattedPredictions = predictions.map(prediction => ({
      id: prediction.id,
      model_name: prediction.model_name,
      prediction_type: prediction.prediction_type,
      risk_level: prediction.risk_level,
      confidence_score: prediction.confidence_score,
      area: prediction.area ? {
        type: 'Polygon',
        coordinates: JSON.parse(prediction.area).coordinates
      } : null,
      center_point: prediction.center_point ? {
        type: 'Point',
        coordinates: [prediction.center_point.x, prediction.center_point.y]
      } : null,
      radius_km: prediction.radius_km,
      prediction_start: prediction.prediction_start,
      prediction_end: prediction.prediction_end,
      risk_factors: prediction.risk_factors,
      recommendations: prediction.recommendations
    }));

    res.json({ predictions: formattedPredictions });
  } catch (error) {
    console.error('Error fetching active predictions for map:', error);
    res.status(500).json({ error: 'Failed to fetch active predictions' });
  }
});

module.exports = router;
