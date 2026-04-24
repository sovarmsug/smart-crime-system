import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, Treemap, ComposedChart
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ChartData {
  [key: string]: any;
}

const DataVisualizationDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({});

  useEffect(() => {
    loadVisualizationData();
  }, [selectedTimeRange, selectedDistrict]);

  const loadVisualizationData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API calls
      const mockData = {
        crimeTrends: [
          { month: 'Jan', theft: 45, assault: 23, burglary: 18, vandalism: 12, total: 98 },
          { month: 'Feb', theft: 52, assault: 28, burglary: 22, vandalism: 15, total: 117 },
          { month: 'Mar', theft: 48, assault: 31, burglary: 25, vandalism: 18, total: 122 },
          { month: 'Apr', theft: 58, assault: 35, burglary: 20, vandalism: 14, total: 127 },
          { month: 'May', theft: 62, assault: 29, burglary: 28, vandalism: 16, total: 135 },
          { month: 'Jun', theft: 55, assault: 33, burglary: 24, vandalism: 19, total: 131 }
        ],
        districtComparison: [
          { district: 'Kampala', theft: 180, assault: 95, burglary: 78, vandalism: 62 },
          { district: 'Wakiso', theft: 120, assault: 68, burglary: 52, vandalism: 41 },
          { district: 'Mukono', theft: 85, assault: 42, burglary: 35, vandalism: 28 },
          { district: 'Entebbe', theft: 95, assault: 48, burglary: 38, vandalism: 32 },
          { district: 'Mbarara', theft: 72, assault: 35, burglary: 28, vandalism: 22 }
        ],
        crimeTypes: [
          { name: 'Theft', value: 35, color: '#3B82F6' },
          { name: 'Assault', value: 25, color: '#EF4444' },
          { name: 'Burglary', value: 20, color: '#F59E0B' },
          { name: 'Vandalism', value: 12, color: '#10B981' },
          { name: 'Fraud', value: 5, color: '#8B5CF6' },
          { name: 'Other', value: 3, color: '#6B7280' }
        ],
        severityDistribution: [
          { severity: 'Low', count: 45, percentage: 30 },
          { severity: 'Medium', count: 60, percentage: 40 },
          { severity: 'High', count: 35, percentage: 23 },
          { severity: 'Critical', count: 10, percentage: 7 }
        ],
        hourlyPattern: [
          { hour: '00', incidents: 8 },
          { hour: '02', incidents: 5 },
          { hour: '04', incidents: 3 },
          { hour: '06', incidents: 12 },
          { hour: '08', incidents: 25 },
          { hour: '10', incidents: 32 },
          { hour: '12', incidents: 28 },
          { hour: '14', incidents: 35 },
          { hour: '16', incidents: 42 },
          { hour: '18', incidents: 48 },
          { hour: '20', incidents: 38 },
          { hour: '22', incidents: 22 }
        ],
        weeklyPattern: [
          { day: 'Mon', incidents: 85 },
          { day: 'Tue', incidents: 92 },
          { day: 'Wed', incidents: 78 },
          { day: 'Thu', incidents: 88 },
          { day: 'Fri', incidents: 125 },
          { day: 'Sat', incidents: 145 },
          { day: 'Sun', incidents: 95 }
        ],
        resolutionTime: [
          { type: 'Theft', avgHours: 24, medianHours: 18 },
          { type: 'Assault', avgHours: 12, medianHours: 8 },
          { type: 'Burglary', avgHours: 36, medianHours: 28 },
          { type: 'Vandalism', avgHours: 48, medianHours: 36 },
          { type: 'Fraud', avgHours: 72, medianHours: 48 }
        ],
        predictionAccuracy: [
          { model: 'Random Forest', accuracy: 87, precision: 85, recall: 89 },
          { model: 'Neural Network', accuracy: 91, precision: 88, recall: 93 },
          { model: 'Time Series', accuracy: 84, precision: 82, recall: 86 },
          { model: 'Ensemble', accuracy: 93, precision: 91, recall: 94 }
        ],
        riskFactors: [
          { factor: 'Time of Day', impact: 85 },
          { factor: 'Location Type', impact: 78 },
          { factor: 'Weather', impact: 65 },
          { factor: 'Day of Week', impact: 72 },
          { factor: 'Previous Incidents', impact: 88 },
          { factor: 'Events', impact: 58 }
        ]
      };

      setChartData(mockData);
    } catch (error) {
      console.error('Error loading visualization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`);
  };

  const refreshData = () => {
    loadVisualizationData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crime Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive crime data visualization and analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">All Districts</option>
              <option value="kampala">Kampala</option>
              <option value="wakiso">Wakiso</option>
              <option value="mukono">Mukono</option>
              <option value="entebbe">Entebbe</option>
            </select>
            <button
              onClick={refreshData}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportData('csv')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Crime Trends Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crime Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.crimeTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="theft" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="assault" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="burglary" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="vandalism" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* District Comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">District Crime Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.districtComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="theft" fill="#3B82F6" />
              <Bar dataKey="assault" fill="#EF4444" />
              <Bar dataKey="burglary" fill="#F59E0B" />
              <Bar dataKey="vandalism" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crime Types and Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crime Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.crimeTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {chartData.crimeTypes?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.severityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Crime Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="incidents" stroke="#F59E0B" fill="#FBBF24" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Pattern */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Crime Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData.weeklyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="incidents" fill="#3B82F6" />
              <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Time Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Resolution Time (Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.resolutionTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgHours" fill="#F59E0B" name="Average" />
              <Bar dataKey="medianHours" fill="#10B981" name="Median" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Accuracy */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData.predictionAccuracy}>
              <PolarGrid />
              <PolarAngleAxis dataKey="model" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Accuracy" dataKey="accuracy" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Precision" dataKey="precision" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Radar name="Recall" dataKey="recall" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Factors Impact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors Impact Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.riskFactors} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="factor" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="impact" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">1,247</div>
            <div className="text-gray-600">Total Incidents</div>
            <div className="text-sm text-green-600">↑ 12% from last month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">87%</div>
            <div className="text-gray-600">Resolution Rate</div>
            <div className="text-sm text-green-600">↑ 5% improvement</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">4.2</div>
            <div className="text-gray-600">Avg Response Time (hrs)</div>
            <div className="text-sm text-green-600">↓ 0.8 hrs faster</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">91%</div>
            <div className="text-gray-600">Prediction Accuracy</div>
            <div className="text-sm text-green-600">↑ 3% improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationDashboard;
