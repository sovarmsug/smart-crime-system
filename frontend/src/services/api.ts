import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  
  changePassword: (passwordData: any) =>
    api.put('/auth/change-password', passwordData),
  
  verifyToken: () =>
    api.get('/auth/verify'),
};

// Crime Reports API
export const crimeAPI = {
  getCrimeReports: (params?: any) =>
    api.get('/crimes', { params }),
  
  getCrimeReport: (id: string) =>
    api.get(`/crimes/${id}`),
  
  createCrimeReport: (data: any) =>
    api.post('/crimes', data),
  
  updateCrimeReport: (id: string, data: any) =>
    api.put(`/crimes/${id}`, data),
  
  deleteCrimeReport: (id: string) =>
    api.delete(`/crimes/${id}`),
  
  getCrimeStats: (params?: any) =>
    api.get('/crimes/stats/overview', { params }),
  
  getCrimeHotspots: (params?: any) =>
    api.get('/crimes/hotspots', { params }),
};

// Alerts API
export const alertAPI = {
  getAlerts: (params?: any) =>
    api.get('/alerts', { params }),
  
  getAlert: (id: string) =>
    api.get(`/alerts/${id}`),
  
  createAlert: (data: any) =>
    api.post('/alerts', data),
  
  updateAlertStatus: (id: string, status: string) =>
    api.put(`/alerts/${id}/status`, { status }),
  
  deleteAlert: (id: string) =>
    api.delete(`/alerts/${id}`),
  
  getAlertStats: (params?: any) =>
    api.get('/alerts/stats/overview', { params }),
};

// Predictions API
export const predictionAPI = {
  getPredictions: (params?: any) =>
    api.get('/predictions', { params }),
  
  getPrediction: (id: string) =>
    api.get(`/predictions/${id}`),
  
  createPrediction: (data: any) =>
    api.post('/predictions', data),
  
  runPrediction: (data: any) =>
    api.post('/predictions/run-prediction', data),
  
  updatePredictionAccuracy: (id: string, data: any) =>
    api.put(`/predictions/${id}/accuracy`, data),
  
  deactivatePrediction: (id: string) =>
    api.put(`/predictions/${id}/deactivate`),
  
  deletePrediction: (id: string) =>
    api.delete(`/predictions/${id}`),
  
  getPredictionStats: (params?: any) =>
    api.get('/predictions/stats/overview', { params }),
  
  getActivePredictions: (params?: any) =>
    api.get('/predictions/map/active', { params }),
};

// Users API
export const userAPI = {
  getUsers: (params?: any) =>
    api.get('/users', { params }),
  
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  
  updateUser: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  updateUserStatus: (id: string, status: string) =>
    api.put(`/users/${id}/status`, { status }),
  
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
  
  getUserStats: (params?: any) =>
    api.get('/users/stats/overview', { params }),
  
  getPoliceOfficers: (params?: any) =>
    api.get('/users/police/by-station', { params }),
};

// Health check API
export const healthAPI = {
  check: () =>
    api.get('/health'),
};

export default api;
