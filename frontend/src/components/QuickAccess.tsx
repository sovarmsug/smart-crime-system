import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  BellIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface QuickAccessProps {
  isVisible: boolean;
}

const QuickAccess: React.FC<QuickAccessProps> = ({ isVisible }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: HomeIcon,
      label: 'Home',
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      color: 'bg-blue-500'
    },
    {
      icon: DocumentTextIcon,
      label: 'Report Crime',
      action: () => navigate('/report-crime'),
      color: 'bg-red-500'
    },
    {
      icon: BellIcon,
      label: 'View Alerts',
      action: () => navigate('/alerts'),
      color: 'bg-orange-500'
    },
    {
      icon: ChartBarIcon,
      label: 'Run Prediction',
      action: () => navigate('/predictions'),
      color: 'bg-green-500'
    },
    {
      icon: UserGroupIcon,
      label: 'Community',
      action: () => window.location.href = '/login',
      color: 'bg-purple-500'
    },
    {
      icon: ShieldCheckIcon,
      label: 'Security',
      action: () => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' }),
      color: 'bg-indigo-500'
    },
    {
      icon: PhoneIcon,
      label: 'Call Us',
      action: () => window.location.href = 'tel:+256123456789',
      color: 'bg-pink-500'
    },
    {
      icon: EnvelopeIcon,
      label: 'Contact',
      action: () => window.location.href = 'mailto:info@smartcrime.ug',
      color: 'bg-yellow-500'
    },
    {
      icon: DocumentTextIcon,
      label: 'View Reports',
      action: () => navigate('/crimes'),
      color: 'bg-indigo-500'
    },
    {
      icon: DocumentTextIcon,
      label: 'Edit Reports',
      action: () => navigate('/crimes?edit=true'),
      color: 'bg-purple-500'
    }
  ];

  const emergencyActions = [
    {
      label: 'Report Emergency',
      action: () => window.location.href = 'tel:+256705499999',
      color: 'bg-red-600',
      description: 'Call emergency services'
    },
    {
      label: 'Quick Report',
      action: () => navigate('/report-crime'),
      color: 'bg-orange-600',
      description: 'File immediate report'
    },
    {
      label: 'Find Help',
      action: () => navigate('/help'),
      color: 'bg-blue-600',
      description: 'Get assistance now'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed left-6 bottom-6 z-40">
      {!isExpanded ? (
        <div className="relative">
          {/* Ring animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping animation-delay-200"></div>
          <button
            onClick={() => setIsExpanded(true)}
            className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 animate-fade-in-up"
            title="Quick Access"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl p-4 w-64 animate-fade-in-up">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Quick Access</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Emergency Section */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-red-600 mb-2">Emergency</h4>
            <div className="space-y-2">
              {emergencyActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full ${action.color} text-white p-2 rounded-lg hover:opacity-90 transition-opacity text-left`}
                >
                  <div className="font-semibold text-sm">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-4 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-2 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105`}
                  title={action.label}
                >
                  <action.icon className="h-4 w-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Navigation</h4>
            <div className="space-y-1">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowUpIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Scroll to Top</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickAccess;
