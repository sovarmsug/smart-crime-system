import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  BellIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'crime_report' | 'alert' | 'prediction' | 'system' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    url: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface NotificationSystemProps {
  className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }

    // Load initial notifications
    loadNotifications();

    // Set up socket listeners
    if (socket) {
      socket.on('new-crime-report', handleCrimeReport);
      socket.on('new-alert', handleAlert);
      socket.on('prediction-generated', handlePrediction);
      socket.on('emergency-alert', handleEmergency);
      socket.on('system-notification', handleSystemNotification);
    }

    return () => {
      if (socket) {
        socket.off('new-crime-report', handleCrimeReport);
        socket.off('new-alert', handleAlert);
        socket.off('prediction-generated', handlePrediction);
        socket.off('emergency-alert', handleEmergency);
        socket.off('system-notification', handleSystemNotification);
      }
    };
  }, [socket]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      // Simulate loading notifications from API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'crime_report',
          title: 'New Crime Report',
          message: 'Theft reported in Kampala Central',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          read: false,
          priority: 'medium',
          action: {
            label: 'View Report',
            url: '/crimes'
          },
          location: {
            lat: 0.3476,
            lng: 32.5825,
            address: 'Kampala Central, Uganda'
          }
        },
        {
          id: '2',
          type: 'alert',
          title: 'High Risk Alert',
          message: 'Increased crime activity detected in Entebbe',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
          priority: 'high',
          action: {
            label: 'View Details',
            url: '/alerts'
          }
        },
        {
          id: '3',
          type: 'prediction',
          title: 'Prediction Update',
          message: 'New crime hotspot prediction available',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: true,
          priority: 'low',
          action: {
            label: 'View Prediction',
            url: '/predictions'
          }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const showBrowserNotification = useCallback((notification: Notification) => {
    if (permission === 'granted' && !document.hidden) {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical'
      });

      browserNotification.onclick = () => {
        if (notification.action) {
          window.location.href = notification.action.url;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.priority !== 'critical') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }, [permission]);

  const handleCrimeReport = (data: any) => {
    const notification: Notification = {
      id: `crime-${Date.now()}`,
      type: 'crime_report',
      title: 'New Crime Report',
      message: `${data.crimeType} reported in ${data.location}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: data.severity === 'critical' ? 'critical' : data.severity === 'high' ? 'high' : 'medium',
      action: {
        label: 'View Report',
        url: '/crimes'
      },
      location: data.location
    };

    setNotifications(prev => [notification, ...prev]);
    toast.error(notification.message);
    showBrowserNotification(notification);
  };

  const handleAlert = (data: any) => {
    const notification: Notification = {
      id: `alert-${Date.now()}`,
      type: 'alert',
      title: 'Security Alert',
      message: data.message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: data.priority,
      action: {
        label: 'View Alert',
        url: '/alerts'
      }
    };

    setNotifications(prev => [notification, ...prev]);
    toast.error(notification.message);
    showBrowserNotification(notification);
  };

  const handlePrediction = (data: any) => {
    const notification: Notification = {
      id: `pred-${Date.now()}`,
      type: 'prediction',
      title: 'Prediction Update',
      message: `New prediction for ${data.location}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      action: {
        label: 'View Prediction',
        url: '/predictions'
      }
    };

    setNotifications(prev => [notification, ...prev]);
    toast.success(notification.message);
    showBrowserNotification(notification);
  };

  const handleEmergency = (data: any) => {
    const notification: Notification = {
      id: `emergency-${Date.now()}`,
      type: 'emergency',
      title: '🚨 EMERGENCY ALERT',
      message: data.message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'critical',
      action: {
        label: 'View Details',
        url: '/alerts'
      }
    };

    setNotifications(prev => [notification, ...prev]);
    toast.error(notification.message, { duration: 10000 });
    showBrowserNotification(notification);
  };

  const handleSystemNotification = (data: any) => {
    const notification: Notification = {
      id: `system-${Date.now()}`,
      type: 'system',
      title: 'System Update',
      message: data.message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low'
    };

    setNotifications(prev => [notification, ...prev]);
    toast(notification.message);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'crime_report': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'alert': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'prediction': return <ClockIcon className="h-5 w-5" />;
      case 'emergency': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.action) {
                      window.location.href = notification.action.url;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.location && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {notification.location.address}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.action && (
                          <span className="text-xs text-blue-600 hover:text-blue-700">
                            {notification.action.label} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => window.location.href = '/notifications'}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
