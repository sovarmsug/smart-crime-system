export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: 'citizen' | 'police_officer' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  badge_number?: string;
  station?: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrimeReport {
  id: string;
  reported_by?: string;
  title: string;
  description: string;
  crime_type: CrimeType;
  severity: Severity;
  status: CrimeStatus;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  district?: string;
  county?: string;
  subcounty?: string;
  parish?: string;
  village?: string;
  incident_date: string;
  reported_date: string;
  resolved_date?: string;
  evidence?: string[];
  witnesses?: Witness[];
  notes?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Alert {
  id: string;
  crime_report_id?: string;
  triggered_by?: string;
  title: string;
  message: string;
  alert_type: AlertType;
  priority: Priority;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  area_description?: string;
  radius_km?: number;
  send_sms: boolean;
  send_email: boolean;
  send_push: boolean;
  target_users?: string[];
  target_areas?: string[];
  target_role: UserRole;
  status: AlertStatus;
  expires_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  delivery_status?: DeliveryStatus;
  error_message?: string;
}

export interface Prediction {
  id: string;
  model_name: string;
  model_version: string;
  prediction_type: PredictionType;
  confidence_score: number;
  prediction_data: any;
  area?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  center_point?: {
    type: 'Point';
    coordinates: [number, number];
  };
  radius_km?: number;
  prediction_start: string;
  prediction_end: string;
  time_period: TimePeriod;
  risk_level: RiskLevel;
  risk_factors?: string[];
  recommendations?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  notes?: string;
  actual_outcome?: any;
  accuracy_score?: number;
}

export interface Witness {
  name?: string;
  phone?: string;
  statement?: string;
  statementFile?: File | null;
}

export interface DeliveryStatus {
  sms: { sent: number; failed: number; total: number };
  email: { sent: number; failed: number; total: number };
  push: { sent: number; failed: number; total: number };
}

export type CrimeType = 
  | 'theft'
  | 'assault'
  | 'burglary'
  | 'vandalism'
  | 'fraud'
  | 'drug_offense'
  | 'traffic_violation'
  | 'domestic_violence'
  | 'cyber_crime'
  | 'murder'
  | 'kidnapping'
  | 'other';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type CrimeStatus = 'reported' | 'under_investigation' | 'resolved' | 'false_report';

export type AlertType = 'crime_report' | 'prediction_alert' | 'emergency' | 'system';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type UserRole = 'all' | 'citizens' | 'police' | 'admin';

export type AlertStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export type PredictionType = 'hotspot' | 'crime_type' | 'time_based' | 'risk_level';

export type TimePeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
  role?: 'citizen' | 'police_officer' | 'admin';
}

export interface CrimeReportFormData {
  title: string;
  description: string;
  crime_type: CrimeType;
  severity: Severity;
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  district?: string;
  county?: string;
  subcounty?: string;
  parish?: string;
  village?: string;
  incident_date: string;
  evidence?: string[];
  witnesses?: Witness[];
  notes?: string;
  is_anonymous?: boolean;
}

export interface AlertFormData {
  title: string;
  message: string;
  alert_type: AlertType;
  priority: Priority;
  location?: {
    latitude: number;
    longitude: number;
  };
  area_description?: string;
  radius_km?: number;
  send_sms?: boolean;
  send_email?: boolean;
  send_push?: boolean;
  target_users?: string[];
  target_areas?: string[];
  target_role?: UserRole;
  expires_at?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface CrimeStats {
  total: number;
  by_type: Array<{ crime_type: CrimeType; count: number }>;
  by_severity: Array<{ severity: Severity; count: number }>;
  by_status: Array<{ status: CrimeStatus; count: number }>;
  daily_trend: Array<{ date: string; count: number }>;
  top_districts: Array<{ district: string; count: number }>;
  period_days: number;
}

export interface AlertStats {
  total: number;
  by_type: Array<{ alert_type: AlertType; count: number }>;
  by_priority: Array<{ priority: Priority; count: number }>;
  by_status: Array<{ status: AlertStatus; count: number }>;
  daily_trend: Array<{ date: string; count: number }>;
  period_days: number;
}

export interface PredictionStats {
  total: number;
  by_type: Array<{ prediction_type: PredictionType; count: number }>;
  by_risk_level: Array<{ risk_level: RiskLevel; count: number }>;
  by_model: Array<{ model_name: string; count: number }>;
  performance: {
    avg_confidence_score: number;
    avg_accuracy_score: number;
  };
  daily_trend: Array<{ date: string; count: number }>;
  period_days: number;
}
