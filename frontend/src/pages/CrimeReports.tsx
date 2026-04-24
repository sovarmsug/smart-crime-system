import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { crimeAPI } from '../services/api';
import { CrimeReport, CrimeStats } from '../types';
import { mockCrimes } from '../data/mockCrimes';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CrimeReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [stats, setStats] = useState<CrimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    crime_type: '',
    severity: '',
    status: '',
    district: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
    loadStats();
  }, [pagination?.page, searchTerm, filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Use real API call
      const params = {
        page: pagination?.page || 1,
        limit: pagination?.limit || 20,
        search: searchTerm || undefined,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      console.log('Loading reports with params:', params);
      const response = await crimeAPI.getCrimeReports(params);
      console.log('API response:', response.data);
      
      // Handle different response structures
      if (response.data && typeof response.data === 'object') {
        // Check if response has the expected structure
        if (response.data.reports && Array.isArray(response.data.reports)) {
          setReports(response.data.reports);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setReports(response.data.data);
        } else {
          console.warn('Unexpected reports structure:', response.data);
          setReports([]);
        }

        // Handle pagination
        if (response.data.pagination && typeof response.data.pagination === 'object') {
          setPagination(response.data.pagination);
        } else {
          console.warn('No pagination data found, using defaults');
          // Keep existing pagination state
        }
      } else {
        console.error('Invalid API response structure:', response.data);
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading crime reports:', error);
      // Fallback to mock data if API fails
      console.log('Falling back to mock data...');
      setReports(mockCrimes);
      setPagination({
        page: 1,
        limit: 20,
        total: mockCrimes.length,
        pages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await crimeAPI.getCrimeStats({ period: '30' });
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'under_investigation': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_report': return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crime Reports</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all reported crime incidents
              </p>
            </div>
            {user?.role !== 'citizen' && (
              <button
                onClick={() => window.location.href = '/report-crime'}
                className="btn-primary"
              >
                <DocumentTextIcon className="mr-2 h-4 w-4" />
                Report New Crime
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Reports
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
                      High Priority
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.by_severity?.find(s => s.severity === 'high')?.count || 0}
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
                  <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-xs">!</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Under Investigation
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.by_status?.find(s => s.status === 'under_investigation')?.count || 0}
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
                      Resolved
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.by_status?.find(s => s.status === 'resolved')?.count || 0}
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
                    placeholder="Search crime reports..."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="label">Crime Type</label>
                  <select
                    className="input"
                    value={filters.crime_type}
                    onChange={(e) => handleFilterChange('crime_type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="theft">Theft</option>
                    <option value="assault">Assault</option>
                    <option value="burglary">Burglary</option>
                    <option value="vandalism">Vandalism</option>
                    <option value="fraud">Fraud</option>
                    <option value="drug_offense">Drug Offense</option>
                    <option value="traffic_violation">Traffic Violation</option>
                    <option value="domestic_violence">Domestic Violence</option>
                    <option value="cyber_crime">Cyber Crime</option>
                    <option value="murder">Murder</option>
                    <option value="kidnapping">Kidnapping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Severity</label>
                  <select
                    className="input"
                    value={filters.severity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                  >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="reported">Reported</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_report">False Report</option>
                  </select>
                </div>

                <div>
                  <label className="label">District</label>
                  <select
                    className="input"
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                  >
                    <option value="">All Districts</option>
                    <option value="Kampala">Kampala</option>
                    <option value="Wakiso">Wakiso</option>
                    <option value="Mukono">Mukono</option>
                    <option value="Entebbe">Entebbe</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Date</th>
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
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No crime reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          {report.is_anonymous && (
                            <div className="text-xs text-gray-500">Anonymous</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-900 capitalize">
                          {report.crime_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {report.district || 'Unknown'}
                          </div>
                          {report.address && (
                            <div className="text-xs text-gray-500">
                              {report.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(report.incident_date)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // View details logic
                              console.log('View report:', report.id);
                            }}
                            className="text-primary-600 hover:text-primary-900 text-sm"
                          >
                            View
                          </button>
                          {user?.role !== 'citizen' && (
                            <button
                              onClick={() => {
                                // Edit logic
                                console.log('Edit report:', report.id);
                              }}
                              className="text-gray-600 hover:text-gray-900 text-sm"
                            >
                              Edit
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
          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
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

export default CrimeReports;
