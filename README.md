# Smart Crime Prediction & Alert System for Uganda

A web-based intelligent crime prediction and alert system designed to enhance crime prevention and response in Uganda through machine learning and geospatial analysis.

## Project Overview

This system provides:
- Real-time crime reporting and monitoring
- Machine learning-based crime hotspot prediction
- Multi-channel alert notifications (SMS, email, push)
- Interactive crime visualization maps
- Role-based access control for citizens, police, and administrators

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Leaflet for interactive maps
- Axios for API communication

### Backend
- Node.js with Express
- PostgreSQL with PostGIS for spatial data
- JWT authentication
- Socket.io for real-time updates

### Machine Learning
- Python with Scikit-learn
- Random Forest and K-Means clustering
- Crime pattern analysis and prediction

### External Services
- Twilio for SMS notifications
- Firebase for push notifications
- Email service integration

## Project Structure

```
SMART CRIME/
├── backend/          # Node.js API server
├── frontend/         # React web application
├── ml-models/        # Python machine learning models
├── docs/            # Documentation
└── README.md        # This file
```

## Features

1. **Crime Reporting**: Web-based forms for citizens and police to report incidents
2. **Real-time Dashboard**: Live monitoring of crime data and statistics
3. **Predictive Analytics**: ML models to predict crime hotspots
4. **Alert System**: Automated notifications for high-risk areas
5. **Interactive Maps**: Geographic visualization of crime patterns
6. **User Management**: Secure authentication with role-based access

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL with PostGIS extension
- Python 3.8+
- npm or yarn

### Quick Start

1. Clone the repository
2. Set up the database:
   ```bash
   createdb crime_prediction
   psql crime_prediction -c "CREATE EXTENSION postgis;"
   ```
3. Install dependencies:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   
   # ML Models
   cd ../ml-models && pip install -r requirements.txt
   ```
4. Configure environment variables
5. Run the development servers

## Development

This project follows Agile methodology with regular sprints and testing cycles.

## License

© 2026 Management Training and Advisory Centre (MTAC) - National Diploma Project
