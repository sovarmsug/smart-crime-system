import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { crimeAPI, alertAPI, predictionAPI } from '../services/api';
import { CrimeStats, AlertStats, PredictionStats } from '../types';
import CrimeRiskMap from '../components/CrimeRiskMap';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BellIcon,
  PlusCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [crimeStats, setCrimeStats] = useState<CrimeStats | null>(null);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [predictionStats, setPredictionStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCrimes, setRecentCrimes] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on('new-crime-report', (data) => {
        console.log('New crime report:', data);
        loadDashboardData(); // Refresh data
      });

      socket.on('new-alert', (data) => {
        console.log('New alert:', data);
        loadDashboardData(); // Refresh data
      });

      socket.on('prediction-generated', (data) => {
        console.log('New prediction:', data);
        loadDashboardData(); // Refresh data
      });

      return () => {
        socket.off('new-crime-report');
        socket.off('new-alert');
        socket.off('prediction-generated');
      };
    }
  }, [socket]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const [crimeRes, alertRes, predictionRes] = await Promise.all([
        crimeAPI.getCrimeStats({ period: '30' }),
        alertAPI.getAlertStats({ period: '30' }),
        predictionAPI.getPredictionStats({ period: '30' })
      ]);

      setCrimeStats(crimeRes.data);
      setAlertStats(alertRes.data);
      setPredictionStats(predictionRes.data);

      // Load recent data
      const [recentCrimesRes, recentAlertsRes] = await Promise.all([
        crimeAPI.getCrimeReports({ limit: 5 }),
        alertAPI.getAlerts({ limit: 5 })
      ]);

      setRecentCrimes(recentCrimesRes.data.reports || []);
      setRecentAlerts(recentAlertsRes.data.alerts || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-gray-200 p-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">
                {user?.first_name?.[0] || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Monitor and predict crime patterns across Uganda with intelligent insights
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Crime Reports
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {crimeStats?.total || 0}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                {crimeStats?.by_status?.find(s => s.status === 'reported')?.count || 0}
              </span>
              {' '}new this month
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <BellIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Alerts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {alertStats?.total || 0}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
            <div className="text-sm">
              <span className="text-red-600 font-medium">
                {alertStats?.by_priority?.find(p => p.priority === 'critical')?.count || 0}
              </span>
              {' '}critical alerts
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Predictions Generated
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {predictionStats?.total || 0}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
            <div className="text-sm">
              <span className="text-yellow-600 font-medium">
                {predictionStats?.by_risk_level?.find(r => r.risk_level === 'high')?.count || 0}
              </span>
              {' '}high-risk areas
            </div>
          </div>
        </div>
      </div>

      {/* Live Crime Risk Map */}
      <div className="col-span-full">
        <CrimeRiskMap height="500px" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Crime Reports */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Crime Reports</h3>
            <p className="text-sm text-gray-500">Latest incidents reported</p>
          </div>
          <div className="space-y-3">
            {recentCrimes.map((crime: any) => (
              <div key={crime.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{crime.type}</p>
                    <p className="text-xs text-gray-500">
                      {typeof crime.location === 'string' ? crime.location : 
                       crime.location?.district || crime.location?.address || 'Location data'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(crime.severity)}`}>
                    {crime.severity}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(crime.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <p className="text-sm text-gray-500">Latest security alerts</p>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500">{alert.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                    {alert.priority}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(alert.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role === 'citizen' ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Report crimes and stay informed</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button 
              onClick={() => navigate('/report-crime')}
              className="btn-primary"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Report Crime
            </button>
            <button 
              onClick={() => navigate('/crimes')}
              className="btn-secondary"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              View Reports
            </button>
            <button 
              onClick={() => navigate('/community')}
              className="btn-outline"
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Community
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => navigate('/report-crime')}
              className="btn-primary"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Report Crime
            </button>
            {(user?.role === 'police_officer' || user?.role === 'admin') && (
              <button 
                onClick={() => navigate('/alerts')}
                className="btn-outline"
              >
                <BellIcon className="h-5 w-5 mr-2" />
                Create Alert
              </button>
            )}
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/predictions')}
                className="btn-outline"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Run Prediction
              </button>
            )}
            <button 
              onClick={() => navigate('/crimes')}
              className="btn-secondary"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              View Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
