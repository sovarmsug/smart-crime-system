import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface UserAnalytics {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  averageResponseTime: number;
  communityScore: number;
  lastActivity: string;
  joinDate: string;
  reportsByMonth: Array<{ month: string; count: number }>;
  reportsByType: Array<{ type: string; count: number; color: string }>;
  activityHeatmap: Array<{ date: string; count: number }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress: number;
    total: number;
  }>;
}

interface UserAnalyticsProps {
  className?: string;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ className }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('reports');

  useEffect(() => {
    loadUserAnalytics();
  }, [selectedPeriod]);

  const loadUserAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with actual API calls
      const mockAnalytics: UserAnalytics = {
        totalReports: 47,
        resolvedReports: 38,
        pendingReports: 9,
        averageResponseTime: 2.4,
        communityScore: 8.7,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        joinDate: '2023-06-15',
        reportsByMonth: [
          { month: 'Jan', count: 8 },
          { month: 'Feb', count: 12 },
          { month: 'Mar', count: 6 },
          { month: 'Apr', count: 9 },
          { month: 'May', count: 7 },
          { month: 'Jun', count: 5 }
        ],
        reportsByType: [
          { type: 'Theft', count: 18, color: '#3B82F6' },
          { type: 'Assault', count: 12, color: '#EF4444' },
          { type: 'Burglary', count: 8, color: '#F59E0B' },
          { type: 'Vandalism', count: 6, color: '#10B981' },
          { type: 'Other', count: 3, color: '#6B7280' }
        ],
        activityHeatmap: generateHeatmapData(),
        achievements: [
          {
            id: 'first-report',
            name: 'First Report',
            description: 'Submitted your first crime report',
            icon: '📝',
            unlockedAt: '2023-06-15',
            progress: 1,
            total: 1
          },
          {
            id: 'community-helper',
            name: 'Community Helper',
            description: 'Helped resolve 10 crime reports',
            icon: '🤝',
            unlockedAt: '2023-08-20',
            progress: 10,
            total: 10
          },
          {
            id: 'vigilant-citizen',
            name: 'Vigilant Citizen',
            description: 'Submitted 25 crime reports',
            icon: '👁️',
            unlockedAt: '2023-11-10',
            progress: 25,
            total: 25
          },
          {
            id: 'quick-responder',
            name: 'Quick Responder',
            description: 'Average response time under 3 hours',
            icon: '⚡',
            unlockedAt: '2023-09-15',
            progress: 1,
            total: 1
          },
          {
            id: 'crime-fighter',
            name: 'Crime Fighter',
            description: 'Submitted 50 crime reports',
            icon: '🦸',
            unlockedAt: undefined,
            progress: 47,
            total: 50
          }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const count = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
      data.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }
    
    return data;
  };

  const exportReport = (format: 'pdf' | 'csv' | 'json') => {
    // Implement export functionality
    console.log(`Exporting user report as ${format}`);
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case '📝': return <DocumentTextIcon className="h-8 w-8" />;
      case '🤝': return <UserIcon className="h-8 w-8" />;
      case '👁️': return <ExclamationTriangleIcon className="h-8 w-8" />;
      case '⚡': return <ClockIcon className="h-8 w-8" />;
      case '🦸': return <StarIcon className="h-8 w-8" />;
      default: return <CheckCircleIcon className="h-8 w-8" />;
    }
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-400';
    if (count === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
            <p className="text-gray-600 mt-1">Your contribution to community safety</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={loadUserAnalytics}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                PDF Report
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Reports</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalReports}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 text-sm text-blue-700">
              {analytics.resolvedReports} resolved
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round((analytics.resolvedReports / analytics.totalReports) * 100)}%
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 text-sm text-green-700">
              Above average
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Community Score</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.communityScore}</p>
              </div>
              <StarIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-purple-700">
              Top contributor
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg Response</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.averageResponseTime}h</p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-sm text-orange-700">
              Very responsive
            </div>
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.reportsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#93BBFC" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reports by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.reportsByType}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ type, count }) => `${type}: ${count}`}
              >
                {analytics.reportsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Heatmap (Last Year)</h3>
        <div className="grid grid-cols-52 gap-1 text-xs">
          {analytics.activityHeatmap.map((day, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)}`}
              title={`${day.date}: ${day.count} activities`}
            />
          ))}
        </div>
        <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border rounded-lg p-4 ${
                achievement.unlockedAt
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  achievement.unlockedAt ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {achievement.icon ? (
                    <span className="text-2xl">{achievement.icon}</span>
                  ) : (
                    getAchievementIcon(achievement.icon)
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  {achievement.unlockedAt ? (
                    <p className="text-xs text-yellow-600 mt-2">
                      Unlocked on {formatDate(achievement.unlockedAt)}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-semibold text-gray-900">{formatDate(analytics.joinDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Activity</p>
            <p className="font-semibold text-gray-900">{formatDate(analytics.lastActivity)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Reports</p>
            <p className="font-semibold text-gray-900">{analytics.pendingReports}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. Daily Activity</p>
            <p className="font-semibold text-gray-900">
              {(analytics.totalReports / Math.max(1, Math.floor((Date.now() - new Date(analytics.joinDate).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
