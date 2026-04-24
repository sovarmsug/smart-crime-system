import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, crimeAPI, alertAPI, predictionAPI } from '../services/api';
import {
  UsersIcon,
  DocumentTextIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, by_role: [] },
    crimes: { total: 0, by_status: [] },
    alerts: { total: 0, by_status: [] },
    predictions: { total: 0, active: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverviewStats();
    }
  }, [activeTab]);

  const loadOverviewStats = async () => {
    try {
      setLoading(true);
      
      const [usersRes, crimesRes, alertsRes, predictionsRes] = await Promise.all([
        userAPI.getUserStats({ period: '30' }),
        crimeAPI.getCrimeStats({ period: '30' }),
        alertAPI.getAlertStats({ period: '30' }),
        predictionAPI.getPredictionStats({ period: '30' })
      ]);

      setStats({
        users: usersRes.data,
        crimes: crimesRes.data,
        alerts: alertsRes.data,
        predictions: predictionsRes.data,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'crimes', name: 'Crime Reports', icon: DocumentTextIcon },
    { id: 'alerts', name: 'Alerts', icon: BellIcon },
    { id: 'predictions', name: 'Predictions', icon: ChartBarIcon },
    { id: 'settings', name: 'System Settings', icon: CogIcon },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
        <p className="mt-1 text-sm text-gray-500">
          Admin panel is only accessible to system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-500">
                System administration and management dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-gray-50 overflow-hidden rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UsersIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Users
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">{stats.users.total}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 overflow-hidden rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Crime Reports
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">{stats.crimes.total}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 overflow-hidden rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BellIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Alerts Sent
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">{stats.alerts.total}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 overflow-hidden rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Predictions
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">{stats.predictions.total}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">User Distribution</h4>
                      <div className="space-y-3">
                        {stats.users.by_role.map((role: any) => (
                          <div key={role.role} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {role.role.replace('_', ' ')}
                            </span>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${(role.count / stats.users.total) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{role.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Crime Status Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Crime Report Status</h4>
                      <div className="space-y-3">
                        {stats.crimes.by_status.map((status: any) => (
                          <div key={status.status} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {status.status.replace('_', ' ')}
                            </span>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(status.count / stats.crimes.total) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{status.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => window.location.href = '/users'}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Manage Users
                      </button>
                      
                      <button
                        onClick={() => window.location.href = '/crimes'}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <DocumentTextIcon className="mr-2 h-4 w-4" />
                        View Reports
                      </button>
                      
                      <button
                        onClick={() => window.location.href = '/alerts'}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <BellIcon className="mr-2 h-4 w-4" />
                        Manage Alerts
                      </button>
                      
                      <button
                        onClick={() => window.location.href = '/predictions'}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ChartBarIcon className="mr-2 h-4 w-4" />
                        Predictions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <div className="text-center py-8">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      User management interface would be implemented here
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'crimes' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Crime Report Management</h3>
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Advanced crime report management would be implemented here
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Alert Management</h3>
                  <div className="text-center py-8">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Alert configuration and management would be implemented here
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Prediction Management</h3>
                  <div className="text-center py-8">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      ML model management and configuration would be implemented here
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                  <div className="text-center py-8">
                    <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      System configuration and settings would be implemented here
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
