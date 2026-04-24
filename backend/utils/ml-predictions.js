const { db } = require('../config/database');

/**
 * Mock ML prediction function
 * In a real implementation, this would interface with Python ML models
 * For now, we'll simulate predictions based on historical data patterns
 */
async function runCrimePrediction(options = {}) {
  try {
    const {
      model_name = 'random_forest_v1',
      prediction_type = 'hotspot',
      time_period = 'daily',
      days_ahead = 7,
      area_bounds = null // { north, south, east, west }
    } = options;

    console.log(`Running ${prediction_type} prediction with model: ${model_name}`);

    // Get historical crime data for training/prediction
    let query = db('crime_reports')
      .select([
        'crime_type',
        'severity',
        db.raw('ST_X(location) as longitude'),
        db.raw('ST_Y(location) as latitude'),
        'incident_date',
        'district',
        'county'
      ])
      .whereNotNull('location')
      .where('incident_date', '>=', db.raw("CURRENT_DATE - INTERVAL '90 days'"));

    // Apply geographic bounds if provided
    if (area_bounds) {
      query = query.whereRaw(`
        ST_Within(
          location, 
          ST_MakeEnvelope(?, ?, ?, ?, 4326)
        )
      `, [area_bounds.west, area_bounds.south, area_bounds.east, area_bounds.north]);
    }

    const historicalData = await query;

    if (historicalData.length < 10) {
      return {
        success: false,
        error: 'Insufficient historical data for prediction'
      };
    }

    // Simulate ML prediction based on patterns
    const predictionResult = await generatePrediction(historicalData, {
      model_name,
      prediction_type,
      time_period,
      days_ahead,
      area_bounds
    });

    return {
      success: true,
      ...predictionResult
    };
  } catch (error) {
    console.error('Error running crime prediction:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate prediction based on historical patterns
 */
async function generatePrediction(historicalData, options) {
  const {
    model_name,
    prediction_type,
    time_period,
    days_ahead,
    area_bounds
  } = options;

  // Analyze crime patterns from historical data
  const crimePatterns = analyzeCrimePatterns(historicalData);

  // Generate prediction based on patterns
  let predictionData = {};
  let riskLevel = 'low';
  let confidenceScore = 0.75;
  let centerPoint = null;
  let radiusKm = 5;
  let area = null;

  switch (prediction_type) {
    case 'hotspot':
      // Identify high-crime areas
      const hotspots = identifyHotspots(historicalData);
      if (hotspots.length > 0) {
        const topHotspot = hotspots[0];
        centerPoint = {
          latitude: topHotspot.latitude,
          longitude: topHotspot.longitude
        };
        radiusKm = topHotspot.radius_km || 3;
        riskLevel = calculateRiskLevel(topHotspot.crime_count, topHotspot.severity_score);
        confidenceScore = Math.min(0.95, 0.6 + (topHotspot.crime_count / 100));
        
        predictionData = {
          hotspot_type: 'concentrated',
          crime_types: topHotspot.crime_types,
          peak_hours: topHotspot.peak_hours,
          contributing_factors: topHotspot.factors
        };
      }
      break;

    case 'crime_type':
      // Predict likely crime types for areas
      const crimeTypePredictions = predictCrimeTypes(historicalData);
      if (crimeTypePredictions.length > 0) {
        const topPrediction = crimeTypePredictions[0];
        centerPoint = {
          latitude: topPrediction.latitude,
          longitude: topPrediction.longitude
        };
        radiusKm = topPrediction.radius_km || 4;
        riskLevel = calculateRiskLevel(topPrediction.frequency, topPrediction.avg_severity);
        confidenceScore = topPrediction.confidence;
        
        predictionData = {
          predicted_crime_type: topPrediction.crime_type,
          probability: topPrediction.probability,
          historical_frequency: topPrediction.frequency,
          risk_factors: topPrediction.risk_factors
        };
      }
      break;

    case 'time_based':
      // Predict crime timing patterns
      const timePatterns = analyzeTimePatterns(historicalData);
      if (timePatterns.length > 0) {
        const topPattern = timePatterns[0];
        centerPoint = {
          latitude: topPattern.latitude,
          longitude: topPattern.longitude
        };
        radiusKm = topPattern.radius_km || 6;
        riskLevel = calculateRiskLevel(topPattern.expected_crimes, topPattern.avg_severity);
        confidenceScore = topPattern.confidence;
        
        predictionData = {
          peak_times: topPattern.peak_times,
          expected_crimes: topPattern.expected_crimes,
          time_windows: topPattern.time_windows,
          seasonal_factors: topPattern.seasonal_factors
        };
      }
      break;

    case 'risk_level':
      // Comprehensive risk assessment
      const riskAssessment = assessOverallRisk(historicalData);
      if (riskAssessment.length > 0) {
        const topRisk = riskAssessment[0];
        centerPoint = {
          latitude: topRisk.latitude,
          longitude: topRisk.longitude
        };
        radiusKm = topRisk.radius_km || 8;
        riskLevel = topRisk.overall_risk;
        confidenceScore = topRisk.confidence;
        
        predictionData = {
          risk_factors: topRisk.risk_factors,
          vulnerability_score: topRisk.vulnerability_score,
          threat_level: topRisk.threat_level,
          mitigation_recommendations: topRisk.recommendations
        };
      }
      break;
  }

  // Create prediction area (circular buffer around center point)
  if (centerPoint) {
    area = {
      type: 'Polygon',
      coordinates: [[
        [centerPoint.longitude - radiusKm * 0.01, centerPoint.latitude - radiusKm * 0.01],
        [centerPoint.longitude + radiusKm * 0.01, centerPoint.latitude - radiusKm * 0.01],
        [centerPoint.longitude + radiusKm * 0.01, centerPoint.latitude + radiusKm * 0.01],
        [centerPoint.longitude - radiusKm * 0.01, centerPoint.latitude + radiusKm * 0.01],
        [centerPoint.longitude - radiusKm * 0.01, centerPoint.latitude - radiusKm * 0.01]
      ]]
    };
  }

  // Generate recommendations based on risk level
  const recommendations = generateRecommendations(riskLevel, prediction_type, predictionData);

  // Set prediction time period
  const predictionStart = new Date();
  const predictionEnd = new Date();
  predictionEnd.setDate(predictionEnd.getDate() + days_ahead);

  return {
    model_name,
    model_version: '1.0.0',
    prediction_type,
    confidence_score: confidenceScore,
    prediction_data: predictionData,
    area,
    center_point: centerPoint,
    radius_km: radiusKm,
    prediction_start: predictionStart,
    prediction_end: predictionEnd,
    time_period,
    risk_level: riskLevel,
    risk_factors: predictionData.risk_factors || [],
    recommendations
  };
}

/**
 * Analyze crime patterns from historical data
 */
function analyzeCrimePatterns(data) {
  const patterns = {
    byType: {},
    bySeverity: {},
    byLocation: {},
    byTime: {}
  };

  data.forEach(crime => {
    // Count by crime type
    patterns.byType[crime.crime_type] = (patterns.byType[crime.crime_type] || 0) + 1;
    
    // Count by severity
    patterns.bySeverity[crime.severity] = (patterns.bySeverity[crime.severity] || 0) + 1;
    
    // Group by location (simplified grid)
    const latGrid = Math.floor(crime.latitude * 100) / 100;
    const lngGrid = Math.floor(crime.longitude * 100) / 100;
    const locationKey = `${latGrid},${lngGrid}`;
    
    if (!patterns.byLocation[locationKey]) {
      patterns.byLocation[locationKey] = {
        latitude: latGrid,
        longitude: lngGrid,
        crimes: [],
        crime_types: {},
        severities: []
      };
    }
    
    patterns.byLocation[locationKey].crimes.push(crime);
    patterns.byLocation[locationKey].crime_types[crime.crime_type] = 
      (patterns.byLocation[locationKey].crime_types[crime.crime_type] || 0) + 1;
    patterns.byLocation[locationKey].severities.push(crime.severity);
  });

  return patterns;
}

/**
 * Identify crime hotspots
 */
function identifyHotspots(data) {
  const patterns = analyzeCrimePatterns(data);
  const hotspots = [];

  Object.values(patterns.byLocation).forEach(location => {
    if (location.crimes.length >= 5) { // Minimum threshold for hotspot
      const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
      const severityScore = location.severities.reduce((sum, sev) => 
        sum + (severityScores[sev] || 1), 0) / location.severities.length;
      
      hotspots.push({
        latitude: location.latitude,
        longitude: location.longitude,
        crime_count: location.crimes.length,
        severity_score: severityScore,
        crime_types: Object.keys(location.crime_types),
        peak_hours: calculatePeakHours(location.crimes),
        radius_km: Math.min(10, Math.max(2, location.crimes.length / 5)),
        factors: identifyRiskFactors(location.crimes)
      });
    }
  });

  return hotspots.sort((a, b) => b.crime_count - a.crime_count);
}

/**
 * Predict crime types for areas
 */
function predictCrimeTypes(data) {
  const patterns = analyzeCrimePatterns(data);
  const predictions = [];

  Object.values(patterns.byLocation).forEach(location => {
    const totalCrimes = location.crimes.length;
    if (totalCrimes >= 3) {
      Object.entries(location.crime_types).forEach(([crimeType, count]) => {
        const probability = count / totalCrimes;
        if (probability >= 0.3) { // Significant probability
          predictions.push({
            latitude: location.latitude,
            longitude: location.longitude,
            crime_type: crimeType,
            probability: probability,
            frequency: count,
            confidence: Math.min(0.9, 0.5 + probability),
            avg_severity: calculateAverageSeverity(location.severities),
            radius_km: 4,
            risk_factors: identifyRiskFactors(location.crimes)
          });
        }
      });
    }
  });

  return predictions.sort((a, b) => b.probability - a.probability);
}

/**
 * Analyze time-based patterns
 */
function analyzeTimePatterns(data) {
  const patterns = analyzeCrimePatterns(data);
  const timePatterns = [];

  Object.values(patterns.byLocation).forEach(location => {
    if (location.crimes.length >= 5) {
      const hourCounts = {};
      location.crimes.forEach(crime => {
        const hour = new Date(crime.incident_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      timePatterns.push({
        latitude: location.latitude,
        longitude: location.longitude,
        peak_times: peakHours,
        expected_crimes: location.crimes.length,
        confidence: Math.min(0.85, 0.6 + (location.crimes.length / 50)),
        avg_severity: calculateAverageSeverity(location.severities),
        radius_km: 6,
        time_windows: generateTimeWindows(peakHours),
        seasonal_factors: analyzeSeasonalFactors(location.crimes)
      });
    }
  });

  return timePatterns.sort((a, b) => b.expected_crimes - a.expected_crimes);
}

/**
 * Assess overall risk level
 */
function assessOverallRisk(data) {
  const patterns = analyzeCrimePatterns(data);
  const riskAssessments = [];

  Object.values(patterns.byLocation).forEach(location => {
    if (location.crimes.length >= 3) {
      const riskFactors = identifyRiskFactors(location.crimes);
      const vulnerabilityScore = calculateVulnerabilityScore(location.crimes, riskFactors);
      const threatLevel = calculateThreatLevel(location.crimes);
      const overallRisk = calculateOverallRisk(vulnerabilityScore, threatLevel);

      riskAssessments.push({
        latitude: location.latitude,
        longitude: location.longitude,
        overall_risk: overallRisk,
        vulnerability_score: vulnerabilityScore,
        threat_level: threatLevel,
        confidence: Math.min(0.9, 0.5 + (location.crimes.length / 30)),
        risk_factors: riskFactors,
        recommendations: generateRiskMitigation(overallRisk, riskFactors),
        radius_km: 8
      });
    }
  });

  return riskAssessments.sort((a, b) => {
    const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return riskOrder[b.overall_risk] - riskOrder[a.overall_risk];
  });
}

/**
 * Helper functions
 */
function calculateRiskLevel(crimeCount, severityScore) {
  if (crimeCount >= 20 && severityScore >= 3) return 'critical';
  if (crimeCount >= 10 && severityScore >= 2.5) return 'high';
  if (crimeCount >= 5 && severityScore >= 2) return 'medium';
  return 'low';
}

function calculateAverageSeverity(severities) {
  const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
  const total = severities.reduce((sum, sev) => sum + (severityScores[sev] || 1), 0);
  return total / severities.length;
}

function calculatePeakHours(crimes) {
  const hourCounts = {};
  crimes.forEach(crime => {
    const hour = new Date(crime.incident_date).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  return Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
}

function identifyRiskFactors(crimes) {
  const factors = [];
  const crimeTypes = [...new Set(crimes.map(c => c.crime_type))];
  
  if (crimeTypes.includes('theft') || crimeTypes.includes('burglary')) {
    factors.push('property_crime_hotspot');
  }
  if (crimeTypes.includes('assault') || crimeTypes.includes('domestic_violence')) {
    factors.push('violent_crime_area');
  }
  if (crimeTypes.includes('drug_offense')) {
    factors.push('drug_activity_zone');
  }
  if (crimes.length > 15) {
    factors.push('high_crime_density');
  }
  
  return factors;
}

function generateTimeWindows(peakHours) {
  return peakHours.map(hour => ({
    start: Math.max(0, hour - 2),
    end: Math.min(23, hour + 2),
    risk_level: hour >= 20 || hour <= 6 ? 'high' : 'medium'
  }));
}

function analyzeSeasonalFactors(crimes) {
  // Simplified seasonal analysis
  const monthCounts = {};
  crimes.forEach(crime => {
    const month = new Date(crime.incident_date).getMonth();
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  
  const peakMonth = Object.entries(monthCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    peak_month: peakMonth ? parseInt(peakMonth[0]) : null,
    seasonal_trend: peakMonth ? 'increasing' : 'stable'
  };
}

function calculateVulnerabilityScore(crimes, riskFactors) {
  let score = 0.5; // Base vulnerability
  
  if (crimes.length > 10) score += 0.2;
  if (riskFactors.includes('high_crime_density')) score += 0.2;
  if (riskFactors.includes('violent_crime_area')) score += 0.15;
  if (riskFactors.includes('drug_activity_zone')) score += 0.1;
  
  return Math.min(1.0, score);
}

function calculateThreatLevel(crimes) {
  const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
  const avgSeverity = crimes.reduce((sum, crime) => 
    sum + (severityScores[crime.severity] || 1), 0) / crimes.length;
  
  return avgSeverity / 4; // Normalize to 0-1
}

function calculateOverallRisk(vulnerability, threat) {
  const riskScore = (vulnerability + threat) / 2;
  if (riskScore >= 0.8) return 'critical';
  if (riskScore >= 0.6) return 'high';
  if (riskScore >= 0.4) return 'medium';
  return 'low';
}

function generateRiskMitigation(riskLevel, riskFactors) {
  const recommendations = [];
  
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('increased_police_patrols');
    recommendations.push('community_awareness_campaigns');
  }
  if (riskFactors.includes('property_crime_hotspot')) {
    recommendations.push('improved_lighting');
    recommendations.push('security_cameras');
  }
  if (riskFactors.includes('violent_crime_area')) {
    recommendations.push('emergency_response_stations');
    recommendations.push('community_watch_programs');
  }
  
  return recommendations;
}

function generateRecommendations(riskLevel, predictionType, predictionData) {
  const baseRecommendations = {
    low: 'Continue normal monitoring and community engagement',
    medium: 'Increase patrols during peak hours and enhance community awareness',
    high: 'Deploy additional resources and implement preventive measures',
    critical: 'Immediate response required, emergency protocols activated'
  };

  let recommendations = [baseRecommendations[riskLevel]];

  // Add specific recommendations based on prediction type
  if (predictionType === 'hotspot' && predictionData.crime_types) {
    recommendations.push(`Focus on ${predictionData.crime_types.join(', ')} prevention`);
  }
  if (predictionType === 'time_based' && predictionData.peak_times) {
    recommendations.push(`Increase presence during ${predictionData.peak_times.join(', ')} hours`);
  }

  return recommendations.join('. ');
}

module.exports = {
  runCrimePrediction,
  generatePrediction,
  analyzeCrimePatterns,
  identifyHotspots,
  predictCrimeTypes,
  analyzeTimePatterns,
  assessOverallRisk
};
