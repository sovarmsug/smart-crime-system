import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CpuChipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PredictionModel {
  id: string;
  name: string;
  type: 'random_forest' | 'neural_network' | 'time_series';
  accuracy: number;
  lastTrained: string;
  status: 'active' | 'training' | 'inactive';
  predictions: any[];
}

interface CrimePrediction {
  id: string;
  location: string;
  crimeType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timeWindow: string;
  factors: string[];
  predictedIncidents: number;
}

const AdvancedPredictionDashboard: React.FC = () => {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<CrimePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [timeRange, setTimeRange] = useState('7d');
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadPredictionData();
  }, []);

  const loadPredictionData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - replace with actual API calls
      const mockModels: PredictionModel[] = [
        {
          id: 'rf-001',
          name: 'Random Forest Classifier',
          type: 'random_forest',
          accuracy: 87.5,
          lastTrained: '2024-01-15',
          status: 'active',
          predictions: []
        },
        {
          id: 'nn-002',
          name: 'Neural Network Predictor',
          type: 'neural_network',
          accuracy: 91.2,
          lastTrained: '2024-01-14',
          status: 'active',
          predictions: []
        },
        {
          id: 'ts-003',
          name: 'Time Series Analysis',
          type: 'time_series',
          accuracy: 83.8,
          lastTrained: '2024-01-13',
          status: 'training',
          predictions: []
        }
      ];

      const mockPredictions: CrimePrediction[] = [
        {
          id: 'pred-001',
          location: 'Kampala Central',
          crimeType: 'theft',
          riskLevel: 'high',
          confidence: 0.85,
          timeWindow: 'Next 24 hours',
          factors: ['Weekend', 'Commercial area', 'Previous incidents'],
          predictedIncidents: 3
        },
        {
          id: 'pred-002',
          location: 'Wakiso District',
          crimeType: 'burglary',
          riskLevel: 'medium',
          confidence: 0.72,
          timeWindow: 'Next 48 hours',
          factors: ['Residential area', 'Night hours'],
          predictedIncidents: 2
        },
        {
          id: 'pred-003',
          location: 'Entebbe Town',
          crimeType: 'assault',
          riskLevel: 'critical',
          confidence: 0.92,
          timeWindow: 'Next 12 hours',
          factors: ['Event venue', 'Late night', 'Alcohol establishments'],
          predictedIncidents: 5
        }
      ];

      setModels(mockModels);
      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Error loading prediction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async (modelId: string) => {
    setIsTraining(true);
    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 3000));
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'active', lastTrained: new Date().toISOString().split('T')[0] }
          : model
      ));
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    try {
      // Simulate running prediction
      await new Promise(resolve => setTimeout(resolve, 2000));
      loadPredictionData();
    } catch (error) {
      console.error('Error running prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const accuracyData = [
    { name: 'Mon', actual: 12, predicted: 11 },
    { name: 'Tue', actual: 15, predicted: 14 },
    { name: 'Wed', actual: 8, predicted: 9 },
    { name: 'Thu', actual: 18, predicted: 16 },
    { name: 'Fri', actual: 22, predicted: 20 },
    { name: 'Sat', actual: 25, predicted: 23 },
    { name: 'Sun', actual: 10, predicted: 11 }
  ];

  const crimeTypeData = [
    { name: 'Theft', value: 35, color: '#3B82F6' },
    { name: 'Assault', value: 25, color: '#EF4444' },
    { name: 'Burglary', value: 20, color: '#F59E0B' },
    { name: 'Vandalism', value: 12, color: '#10B981' },
    { name: 'Other', value: 8, color: '#6B7280' }
  ];

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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advanced Crime Prediction</h1>
            <p className="text-purple-100">AI-powered crime forecasting and risk assessment</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={runPrediction}
              disabled={loading}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Run Prediction
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CpuChipIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-500">{model.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                model.status === 'active' ? 'bg-green-100 text-green-800' :
                model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {model.status}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="font-semibold text-lg">{model.accuracy}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${model.accuracy}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last trained</span>
                <span>{model.lastTrained}</span>
              </div>
              
              <button
                onClick={() => trainModel(model.id)}
                disabled={isTraining || model.status === 'training'}
                className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isTraining ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    Training...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Retrain Model
                  </div>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Current Predictions</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          >
            <option value="24h">Next 24 hours</option>
            <option value="48h">Next 48 hours</option>
            <option value="7d">Next 7 days</option>
            <option value="30d">Next 30 days</option>
          </select>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-semibold text-gray-900">{prediction.location}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600 capitalize">{prediction.crimeType.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.riskLevel)}`}>
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(prediction.confidence * 100)}% confidence</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{prediction.timeWindow}</span>
                </div>
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{prediction.predictedIncidents} incidents predicted</span>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{prediction.factors.length} risk factors</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm text-gray-500 mb-1">Risk Factors:</div>
                <div className="flex flex-wrap gap-2">
                  {prediction.factors.map((factor, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Accuracy */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Accuracy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crime Type Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Predicted Crime Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={crimeTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {crimeTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPredictionDashboard;
