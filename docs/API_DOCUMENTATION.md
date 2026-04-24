# Smart Crime Prediction & Alert System - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints (except login and register) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow this format:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+256123456789",
  "password": "password123",
  "role": "citizen"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "citizen",
    "status": "active"
  },
  "token": "jwt_token"
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token"
}
```

### GET /auth/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "citizen",
    "status": "active"
  }
}
```

### PUT /auth/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+256123456789"
}
```

### PUT /auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

## Crime Reports Endpoints

### GET /crimes
Get crime reports with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `crime_type` (string): Filter by crime type
- `severity` (string): Filter by severity level
- `status` (string): Filter by status
- `district` (string): Filter by district
- `start_date` (string): Filter by start date (YYYY-MM-DD)
- `end_date` (string): Filter by end date (YYYY-MM-DD)
- `search` (string): Search in title, description, or address

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "title": "Mobile Phone Theft",
      "description": "Phone stolen on Kampala Road",
      "crime_type": "theft",
      "severity": "medium",
      "status": "reported",
      "location": {
        "type": "Point",
        "coordinates": [32.5825, 0.3476]
      },
      "address": "Kampala Road",
      "district": "Kampala",
      "incident_date": "2026-04-10T14:30:00Z",
      "created_at": "2026-04-10T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /crimes/:id
Get single crime report by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "report": {
    "id": "uuid",
    "title": "Mobile Phone Theft",
    "description": "Phone stolen on Kampala Road",
    "crime_type": "theft",
    "severity": "medium",
    "status": "reported",
    "location": { ... },
    "evidence": ["witness_statement"],
    "witnesses": [
      {
        "name": "John Doe",
        "phone": "+256123456789",
        "statement": "I saw the incident"
      }
    ],
    "is_anonymous": false
  }
}
```

### POST /crimes
Create new crime report.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Mobile Phone Theft",
  "description": "Phone was stolen while walking",
  "crime_type": "theft",
  "severity": "medium",
  "location": {
    "latitude": 0.3476,
    "longitude": 32.5825
  },
  "address": "Kampala Road",
  "district": "Kampala",
  "county": "Kampala Central",
  "incident_date": "2026-04-10T14:30:00Z",
  "evidence": ["photos", "witness_statement"],
  "witnesses": [
    {
      "name": "John Doe",
      "phone": "+256123456789",
      "statement": "I saw the incident"
    }
  ],
  "notes": "Additional information",
  "is_anonymous": false
}
```

### PUT /crimes/:id
Update crime report (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "under_investigation",
  "notes": "Investigation started"
}
```

### DELETE /crimes/:id
Delete crime report (Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /crimes/stats/overview
Get crime statistics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (number): Number of days to analyze (default: 30)

**Response:**
```json
{
  "total": 150,
  "by_type": [
    { "crime_type": "theft", "count": 45 },
    { "crime_type": "assault", "count": 30 }
  ],
  "by_severity": [
    { "severity": "medium", "count": 60 },
    { "severity": "high", "count": 40 }
  ],
  "by_status": [
    { "status": "reported", "count": 80 },
    { "status": "resolved", "count": 50 }
  ],
  "daily_trend": [
    { "date": "2026-04-10", "count": 5 },
    { "date": "2026-04-11", "count": 8 }
  ],
  "top_districts": [
    { "district": "Kampala", "count": 80 },
    { "district": "Wakiso", "count": 40 }
  ]
}
```

### GET /crimes/hotspots
Get crime hotspots for map visualization.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (number): Number of days to analyze (default: 30)
- `district` (string): Filter by district

**Response:**
```json
{
  "hotspots": [
    {
      "crime_type": "theft",
      "severity": "medium",
      "location": {
        "latitude": 0.3476,
        "longitude": 32.5825
      },
      "timestamp": 1649692800000
    }
  ],
  "period_days": 30
}
```

## Alerts Endpoints

### GET /alerts
Get alerts with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `alert_type` (string): Filter by alert type
- `priority` (string): Filter by priority
- `status` (string): Filter by status
- `start_date` (string): Filter by start date
- `end_date` (string): Filter by end date

### GET /alerts/:id
Get single alert by ID.

**Headers:** `Authorization: Bearer <token>`

### POST /alerts
Create new alert (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "High Crime Activity Alert",
  "message": "Increased theft activity reported in Kampala Central",
  "alert_type": "crime_report",
  "priority": "high",
  "location": {
    "latitude": 0.3476,
    "longitude": 32.5825
  },
  "area_description": "Kampala Central Business District",
  "radius_km": 2.0,
  "send_sms": true,
  "send_email": true,
  "send_push": true,
  "target_role": "all"
}
```

### PUT /alerts/:id/status
Update alert status (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "sent"
}
```

### DELETE /alerts/:id
Delete alert (Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /alerts/stats/overview
Get alert statistics.

**Headers:** `Authorization: Bearer <token>`

## Predictions Endpoints

### GET /predictions
Get predictions with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

### GET /predictions/:id
Get single prediction by ID.

**Headers:** `Authorization: Bearer <token>`

### POST /predictions
Create new prediction (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

### POST /predictions/run-prediction
Run automated crime prediction (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "model_name": "random_forest_v1",
  "prediction_type": "hotspot",
  "time_period": "daily",
  "days_ahead": 7,
  "area_bounds": {
    "north": 0.40,
    "south": 0.30,
    "east": 32.65,
    "west": 32.55
  }
}
```

### PUT /predictions/:id/accuracy
Update prediction accuracy (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

### PUT /predictions/:id/deactivate
Deactivate prediction (Police and Admin only).

**Headers:** `Authorization: Bearer <token>`

### DELETE /predictions/:id
Delete prediction (Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /predictions/stats/overview
Get prediction statistics.

**Headers:** `Authorization: Bearer <token>`

### GET /predictions/map/active
Get active predictions for map visualization.

**Headers:** `Authorization: Bearer <token>`

## Users Endpoints

### GET /users
Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /users/:id
Get single user by ID (Admin only).

**Headers:** `Authorization: Bearer <token>`

### PUT /users/:id
Update user (Admin only).

**Headers:** `Authorization: Bearer <token>`

### PUT /users/:id/status
Update user status (Admin only).

**Headers:** `Authorization: Bearer <token>`

### DELETE /users/:id
Delete user (Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /users/stats/overview
Get user statistics (Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /users/police/by-station
Get police officers by station.

**Headers:** `Authorization: Bearer <token>`

## Health Check

### GET /health
Check API health status.

**Response:**
```json
{
  "status": "OK",
  "message": "Smart Crime Prediction System API is running",
  "timestamp": "2026-04-12T14:30:00.000Z"
}
```

## Error Codes

- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid or missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

## WebSocket Events

### Connection
Connect to WebSocket server at `ws://localhost:5000` (development) or `wss://your-domain.com` (production).

### Events
- `join-room` - Join a room for real-time updates
- `new-crime-report` - New crime report created
- `crime-report-updated` - Crime report updated
- `new-alert` - New alert created
- `prediction-generated` - New prediction generated

## Data Types

### Crime Types
- `theft`
- `assault`
- `burglary`
- `vandalism`
- `fraud`
- `drug_offense`
- `traffic_violation`
- `domestic_violence`
- `cyber_crime`
- `murder`
- `kidnapping`
- `other`

### Severity Levels
- `low`
- `medium`
- `high`
- `critical`

### Crime Status
- `reported`
- `under_investigation`
- `resolved`
- `false_report`

### Alert Types
- `crime_report`
- `prediction_alert`
- `emergency`
- `system`

### Priority Levels
- `low`
- `medium`
- `high`
- `critical`

### User Roles
- `citizen`
- `police_officer`
- `admin`

### Alert Status
- `pending`
- `sent`
- `failed`
- `cancelled`

### Prediction Types
- `hotspot`
- `crime_type`
- `time_based`
- `risk_level`

### Time Periods
- `hourly`
- `daily`
- `weekly`
- `monthly`

### Risk Levels
- `low`
- `medium`
- `high`
- `critical`
