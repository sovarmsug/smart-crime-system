-- Smart Crime System Database Setup for Supabase
-- Run this in the Supabase SQL Editor

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'police_officer', 'admin', 'igp')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crime_reports table
CREATE TABLE IF NOT EXISTS crime_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    district VARCHAR(100),
    county VARCHAR(100),
    subcounty VARCHAR(100),
    parish VARCHAR(100),
    village VARCHAR(100),
    incident_date TIMESTAMP WITH TIME ZONE,
    evidence JSONB DEFAULT '[]',
    witnesses JSONB DEFAULT '[]',
    notes TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'reported' CHECK (status IN ('reported', 'pending', 'assigned', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('crime_alert', 'prediction_alert', 'system_alert')),
    location GEOGRAPHY(POINT, 4326),
    affected_areas JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    predicted_crime_types JSONB DEFAULT '[]',
    time_period VARCHAR(50) NOT NULL,
    model_version VARCHAR(50),
    factors JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crime_report_id UUID REFERENCES crime_reports(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_crime_reports_status ON crime_reports(status);
CREATE INDEX IF NOT EXISTS idx_crime_reports_severity ON crime_reports(severity);
CREATE INDEX IF NOT EXISTS idx_crime_reports_incident_date ON crime_reports(incident_date);
CREATE INDEX IF NOT EXISTS idx_crime_reports_location ON crime_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_predictions_active ON predictions(is_active);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_score ON predictions(risk_score);
CREATE INDEX IF NOT EXISTS idx_assignments_officer ON assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crime_reports_updated_at BEFORE UPDATE ON crime_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password_hash, role) 
VALUES ('System', 'Administrator', 'admin@smartcrime.ug', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crime_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed for your security requirements)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (role = 'admin');
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (role = 'admin');

CREATE POLICY "Anyone can view crime reports" ON crime_reports FOR SELECT USING (true);
CREATE POLICY "Users can create crime reports" ON crime_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and officers can update crime reports" ON crime_reports FOR UPDATE USING (role IN ('admin', 'police_officer', 'igp'));

CREATE POLICY "Anyone can view active alerts" ON alerts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage alerts" ON alerts FOR ALL USING (role = 'admin');

CREATE POLICY "Anyone can view predictions" ON predictions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage predictions" ON predictions FOR ALL USING (role = 'admin');

CREATE POLICY "Users can view own assignments" ON assignments FOR SELECT USING (assigned_to = auth.uid()::text);
CREATE POLICY "Admins can view all assignments" ON assignments FOR SELECT USING (role IN ('admin', 'igp'));
CREATE POLICY "Admins can manage assignments" ON assignments FOR ALL USING (role IN ('admin', 'igp'));

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()::text);

-- Create API keys for external services (optional)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample API keys (replace with actual keys)
INSERT INTO api_keys (service_name, api_key) 
VALUES ('twilio', 'your-twilio-key'),
       ('firebase', 'your-firebase-key'),
       ('email', 'your-email-service-key')
ON CONFLICT (service_name) DO NOTHING;

COMMIT;
