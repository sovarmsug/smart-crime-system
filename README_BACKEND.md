# Smart Crime System - Backend Setup Guide

## Overview
Complete backend API for the Smart Crime Prediction & Alert System with real-time notifications, role management, and crime assignment features.

## Features Implemented

### 🔐 Authentication System
- JWT-based authentication
- User registration and login
- Role-based access control (Admin, Police Officer, Citizen, etc.)
- Profile management and password change

### 📋 Crime Management
- Crime report CRUD operations
- Geographic location support with PostGIS
- Evidence and witness management
- Crime statistics and analytics
- Hotspot detection

### 👥 Role Management
- User role assignment (Admin, IGP, DPCI, RPS, District Commander, etc.)
- Department management
- User status management (active, inactive, suspended)
- Bulk user operations

### 🎯 Crime Assignment System
- Officer assignment to crime reports
- Availability tracking with workload limits
- Assignment status updates
- Real-time notifications to assigned officers

### 🔔 Notification System
- Real-time notifications via Socket.io
- Role assignment notifications
- Crime assignment alerts
- Read/unread status tracking
- Priority-based notifications

### 📊 Real-time Features
- Socket.io integration
- Live updates for crime reports
- Instant role notifications
- Assignment status updates
- Admin room broadcasts

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database with PostGIS for geospatial data
- **Knex.js** - Query builder and migrations
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **UUID** - Unique identifier generation

## Database Schema

### Core Tables
- `users` - User accounts and roles
- `crime_reports` - Crime incident reports
- `crime_assignments` - Officer assignments
- `notifications` - User notifications
- `alerts` - System alerts
- `departments` - Police departments

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password
- `GET /verify` - Verify token

### Crime Reports (`/api/crimes`)
- `GET /` - Get crime reports (with pagination, filtering)
- `POST /` - Create crime report
- `GET /:id` - Get specific crime report
- `PUT /:id` - Update crime report
- `DELETE /:id` - Delete crime report
- `GET /stats/overview` - Crime statistics
- `GET /hotspots` - Crime hotspots

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /stats/overview` - User statistics
- `GET /:id` - Get specific user
- `PUT /:id` - Update user (admin only)
- `PUT /:id/status` - Update user status
- `DELETE /:id` - Delete user (admin only)
- `GET /police/by-station` - Get police officers by station

### Crime Assignments (`/api/assignments`)
- `GET /` - Get all assignments (admin only)
- `GET /officers/available` - Get available officers
- `POST /` - Assign officer to crime
- `PUT /:id/status` - Update assignment status
- `GET /my` - Get my assignments

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `GET /unread/count` - Get unread count
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification
- `POST /create` - Create notification
- `GET /stats` - Notification statistics

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ with PostGIS extension
- Git installed

### 1. Database Setup
```bash
# Create database
createdb smart_crime

# Enable PostGIS extension
psql smart_crime -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Create .env file
cp backend/.env.example backend/.env
```

### 2. Environment Configuration
Edit `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_crime
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Run Database Migrations
```bash
# Run migrations
npm run migrate

# Seed with test data
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

## Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Authentication
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "citizen"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Crime Report
```bash
curl -X POST http://localhost:5000/api/crimes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Crime Report",
    "description": "This is a test crime report",
    "crime_type": "theft",
    "severity": "medium",
    "location": {
      "latitude": 0.3476,
      "longitude": 32.5825
    },
    "address": "Test Location",
    "district": "Kampala",
    "incident_date": "2024-01-24T10:00:00Z"
  }'
```

## Socket.io Events

### Client to Server
- `join-user-room` - Join user-specific notification room
- `join-admin-room` - Join admin room (admins only)
- `new-crime` - New crime report
- `alert` - System alert

### Server to Client
- `role-assigned` - Role assignment notification
- `crime-assigned` - Crime assignment notification
- `assignment-updated` - Assignment status update
- `notification-received` - New notification
- `new-crime-report` - New crime report

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_NAME=smart_crime_prod
JWT_SECRET=production_jwt_secret
```

### Process Management
Use PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name "smart-crime-api"
pm2 startup
pm2 save
```

## API Documentation

### Response Format
All API responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Format
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify .env database credentials
   - Ensure PostGIS extension is enabled

2. **Migration Failures**
   - Drop and recreate database
   - Check for existing tables
   - Verify migration file syntax

3. **JWT Token Issues**
   - Check JWT_SECRET in .env
   - Verify token expiration
   - Check token format

4. **Socket.io Connection Issues**
   - Check CORS settings
   - Verify frontend URL
   - Check firewall settings

### Logs
Check application logs for debugging:
```bash
# Development
npm run dev

# Production
pm2 logs smart-crime-api
```

## Security Considerations

- JWT tokens are signed and verified
- Passwords are hashed with bcrypt
- Rate limiting implemented
- CORS configured
- Input validation with Joi
- SQL injection prevention with Knex.js

## Performance

- Database indexes on frequently queried fields
- Pagination for large datasets
- Connection pooling
- Caching strategies
- Optimized queries

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details.
