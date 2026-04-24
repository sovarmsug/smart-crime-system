# Smart Crime Prediction & Alert System - Setup Guide

## Overview

This guide will help you set up and run the Smart Crime Prediction & Alert System for Uganda on your local development environment.

## Prerequisites

### Software Requirements
- **Node.js** 18+ 
- **PostgreSQL** 13+ with PostGIS extension
- **Python** 3.8+ (for ML models)
- **npm** or **yarn**
- **Git**

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## Database Setup

### 1. Install PostgreSQL with PostGIS

**Windows:**
```bash
# Download and install PostgreSQL from https://www.postgresql.org/download/windows/
# Make sure to include PostGIS extension during installation
```

**macOS:**
```bash
brew install postgresql
brew install postgis
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE crime_prediction;

-- Connect to the new database
\c crime_prediction

-- Enable PostGIS extension
CREATE EXTENSION postgis;

-- Create user (optional, for better security)
CREATE USER crime_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crime_prediction TO crime_user;
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crime_prediction
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Twilio Configuration (Optional - for SMS alerts)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Optional - for email alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Firebase Configuration (Optional - for push notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Run Database Migrations
```bash
npm run migrate
```

### 5. Seed Database (Optional - adds sample data)
```bash
npm run seed
```

### 6. Start Backend Server
```bash
# For development
npm run dev

# For production
npm start
```

The backend API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start Frontend Development Server
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Machine Learning Models Setup (Optional)

### 1. Navigate to ML Models Directory
```bash
cd ml-models
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Test ML Models
```bash
python test_models.py
```

## Verification

### 1. Check Backend Health
Open your browser and navigate to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Smart Crime Prediction System API is running",
  "timestamp": "2026-04-12T..."
}
```

### 2. Access Frontend
Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Test Login
Use the demo accounts created during seeding:

**Admin Account:**
- Email: `admin@smartcrime.ug`
- Password: `admin123`

**Police Account:**
- Email: `police@smartcrime.ug`
- Password: `admin123`

**Citizen Account:**
- Email: `citizen@smartcrime.ug`
- Password: `admin123`

## Features Available

### For All Users
- User registration and login
- View crime reports
- View alerts
- Profile management

### For Police Officers
- Create and manage crime reports
- Create and send alerts
- Run crime predictions
- View analytics dashboard

### For Administrators
- User management
- System configuration
- Advanced analytics
- Full system access

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify PostGIS extension is installed

**2. Migration Errors**
```
Error: relation "users" does not exist
```
- Run `npm run migrate` to create database tables
- Check database permissions

**3. Frontend Build Errors**
```
Module not found: Can't resolve 'react'
```
- Run `npm install` in frontend directory
- Clear node_modules and reinstall if needed

**4. Socket Connection Issues**
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify firewall isn't blocking connections

**5. ML Model Errors**
```
ModuleNotFoundError: No module named 'sklearn'
```
- Activate Python virtual environment
- Install required packages with `pip install -r requirements.txt`

### Port Conflicts
If ports 3000 or 5000 are already in use:

**Change Backend Port:**
```bash
# Edit .env file
PORT=5001
```

**Change Frontend Port:**
```bash
# Start with different port
PORT=3001 npm start
```

### Reset Database
If you need to reset the database:
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE crime_prediction;"
psql -U postgres -c "CREATE DATABASE crime_prediction;"
psql -U postgres -c "CREATE EXTENSION postgis;"

# Rerun migrations and seeds
npm run migrate
npm run seed
```

## Development Tips

### 1. Hot Reloading
- Backend: Use `npm run dev` for automatic restart on changes
- Frontend: Development server automatically reloads on changes

### 2. Debugging
- Backend: Use console.log statements or Node.js debugger
- Frontend: Use browser DevTools and React DevTools

### 3. Testing
- Backend: Run `npm test` for unit tests
- Frontend: Run `npm test` for component tests

### 4. Code Quality
- Backend: Use ESLint configuration
- Frontend: TypeScript provides type checking

## Production Deployment

### Environment Variables
For production, ensure all environment variables are properly set:
- Database connection strings
- JWT secrets
- API keys for external services
- SSL certificates

### Security Considerations
- Use strong JWT secrets
- Enable HTTPS
- Configure firewall rules
- Regular security updates
- Database backups

### Performance Optimization
- Enable database connection pooling
- Use CDN for static assets
- Implement caching
- Monitor system resources

## Support

For issues and questions:
1. Check this documentation first
2. Review error logs in console
3. Verify all prerequisites are met
4. Test with sample data provided

## Next Steps

After successful setup:
1. Explore the dashboard and features
2. Test crime reporting functionality
3. Try running predictions
4. Configure alert notifications
5. Customize for your specific needs
