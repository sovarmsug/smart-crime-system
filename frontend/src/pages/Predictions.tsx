import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { predictionAPI } from '../services/api';
import { Prediction, PredictionStats } from '../types';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Predictions: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    prediction_type: '',
    risk_level: '',
    model_name: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showRunPrediction, setShowRunPrediction] = useState(false);
  const [runningPrediction, setRunningPrediction] = useState(false);

  useEffect(() => {
    loadPredictions();
    loadStats();
  }, [pagination.page, searchTerm, filters]);

  useEffect(() => {
    if (socket) {
      socket.on('prediction-generated', (data) => {
        console.log('New prediction generated:', data);
        loadPredictions(); // Refresh predictions
        loadStats(); // Refresh stats
      });

      return () => {
        socket.off('prediction-generated');
      };
    }
  }, [socket]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      const response = await predictionAPI.getPredictions(params);
      setPredictions(response.data.predictions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await predictionAPI.getPredictionStats({ period: '30' });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const runPrediction = async (predictionData: any) => {
    try {
      setRunningPrediction(true);
      const response = await predictionAPI.runPrediction(predictionData);
      console.log('Prediction completed:', response.data);
      setShowRunPrediction(false);
      loadPredictions(); // Refresh the list
    } catch (error) {
      console.error('Error running prediction:', error);
    } finally {
      setRunningPrediction(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPredictionTypeColor = (type: string) => {
    switch (type) {
      case 'hotspot': return 'bg-purple-100 text-purple-800';
      case 'crime_type': return 'bg-indigo-100 text-indigo-800';
      case 'time_based': return 'bg-blue-100 text-blue-800';
      case 'risk_level': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const deactivatePrediction = async (predictionId: string) => {
    try {
      await predictionAPI.deactivatePrediction(predictionId);
      loadPredictions(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating prediction:', error);
    }
  };

  if (user?.role === 'citizen') {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
        <p className="mt-1 text-sm text-gray-500">
          Crime prediction features are only available to police officers and administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crime Predictions</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage AI-powered crime predictions
              </p>
            </div>
            <button
              onClick={() => setShowRunPrediction(!showRunPrediction)}
              className="btn-primary"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              Run Prediction
            </button>
          </div>
        </div>
      </div>

      {/* Run Prediction Form */}
      {showRunPrediction && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Run Crime Prediction</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Prediction Type</label>
                  <select className="input">
                    <option value="hotspot">Crime Hotspot Analysis</option>
                    <option value="crime_type">Crime Type Prediction</option>
                    <option value="time_based">Time-based Analysis</option>
                    <option value="risk_level">Risk Level Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="label">Time Period</label>
                  <select className="input">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Days Ahead</label>
                  <input type="number" className="input" placeholder="7" min="1" max="30" />
                </div>
                <div>
                  <label className="label">Model</label>
                  <select className="input">
                    <option value="random_forest_v1">Random Forest v1.0</option>
                    <option value="kmeans_v1">K-Means Clustering v1.0</option>
                    <option value="ensemble_v1">Ensemble Model v1.0</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="label">Area Bounds (Optional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input type="number" className="input" placeholder="North" step="any" />
                  <input type="number" className="input" placeholder="South" step="any" />
                  <input type="number" className="input" placeholder="East" step="any" />
                  <input type="number" className="input" placeholder="West" step="any" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRunPrediction(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => runPrediction({
                    prediction_type: 'hotspot',
                    time_period: 'daily',
                    days_ahead: 7,
                    model_name: 'random_forest_v1'
                  })}
                  disabled={runningPrediction}
                  className="btn-primary"
                >
                  {runningPrediction ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="mr-2 h-4 w-4" />
                      Run Prediction
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Predictions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      High Risk Areas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.by_risk_level?.find(r => r.risk_level === 'high')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">!</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Confidence
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.performance.avg_confidence_score.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Accuracy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.performance.avg_accuracy_score.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search predictions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <FunnelIcon className="mr-2 h-4 w-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="label">Prediction Type</label>
                  <select
                    className="input"
                    value={filters.prediction_type}
                    onChange={(e) => handleFilterChange('prediction_type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="hotspot">Hotspot</option>
                    <option value="crime_type">Crime Type</option>
                    <option value="time_based">Time Based</option>
                    <option value="risk_level">Risk Level</option>
                  </select>
                </div>

                <div>
                  <label className="label">Risk Level</label>
                  <select
                    className="input"
                    value={filters.risk_level}
                    onChange={(e) => handleFilterChange('risk_level', e.target.value)}
                  >
                    <option value="">All Risk Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">Model</label>
                  <select
                    className="input"
                    value={filters.model_name}
                    onChange={(e) => handleFilterChange('model_name', e.target.value)}
                  >
                    <option value="">All Models</option>
                    <option value="random_forest_v1">Random Forest v1</option>
                    <option value="kmeans_v1">K-Means v1</option>
                    <option value="ensemble_v1">Ensemble v1</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Confidence</th>
                  <th>Time Period</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : predictions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No predictions found
                    </td>
                  </tr>
                ) : (
                  predictions.map((prediction) => (
                    <tr key={prediction.id}>
                      <td>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prediction.model_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            v{prediction.model_version}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getPredictionTypeColor(prediction.prediction_type)}`}>
                          {prediction.prediction_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getRiskLevelColor(prediction.risk_level)}`}>
                          {prediction.risk_level}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {(prediction.confidence_score * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900 capitalize">
                          {prediction.time_period}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(prediction.prediction_end)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // View details logic
                              console.log('View prediction:', prediction.id);
                            }}
                            className="text-primary-600 hover:text-primary-900 text-sm"
                          >
                            View
                          </button>
                          {prediction.is_active && user?.role === 'admin' && (
                            <button
                              onClick={() => deactivatePrediction(prediction.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
