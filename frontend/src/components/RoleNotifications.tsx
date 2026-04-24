import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface RoleNotification {
  id: string;
  type: 'role_assigned' | 'role_updated' | 'role_revoked' | 'department_change';
  title: string;
  message: string;
  assignedBy: string;
  assignedAt: string;
  role?: string;
  department?: string;
  location?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
}

interface RoleNotificationsProps {
  className?: string;
}

const RoleNotifications: React.FC<RoleNotificationsProps> = ({ className }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<RoleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    if (socket) {
      socket.on('role-assigned', handleRoleAssigned);
      socket.on('role-updated', handleRoleUpdated);
      socket.on('notification-received', handleNotificationReceived);

      return () => {
        socket.off('role-assigned', handleRoleAssigned);
        socket.off('role-updated', handleRoleUpdated);
        socket.off('notification-received', handleNotificationReceived);
      };
    }
  };

  const handleRoleAssigned = (data: RoleNotification) => {
    const newNotification: RoleNotification = {
      ...data,
      id: `role-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      isRead: false,
      priority: 'high'
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification
    showBrowserNotification(newNotification);
    
    // Show toast notification
    toast.success(`🎭 New Role Assigned: ${data.role}`, {
      duration: 5000,
      icon: '🎭'
    });
  };

  const handleRoleUpdated = (data: RoleNotification) => {
    const newNotification: RoleNotification = {
      ...data,
      id: `update-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      isRead: false,
      priority: 'medium'
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    showBrowserNotification(newNotification);
    toast(`🔄 Role Updated: ${data.role}`, {
      duration: 4000,
      icon: '🔄'
    });
  };

  const handleNotificationReceived = (data: RoleNotification) => {
    setNotifications(prev => [data, ...prev]);
    setUnreadCount(prev => data.isRead ? prev : prev + 1);
    
    if (!data.isRead) {
      showBrowserNotification(data);
    }
  };

  const showBrowserNotification = (notification: RoleNotification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical'
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications: RoleNotification[] = [
        {
          id: '1',
          type: 'role_assigned',
          title: 'New Role Assigned',
          message: 'You have been assigned as District Commander for Kampala Metropolitan Police',
          assignedBy: 'IGP Office',
          assignedAt: '2024-01-24T10:00:00',
          role: 'district_commander',
          department: 'Kampala Metropolitan Police',
          location: 'Kampala Central',
          isRead: false,
          priority: 'high',
          actionUrl: '/profile'
        },
        {
          id: '2',
          type: 'department_change',
          title: 'Department Assignment',
          message: 'You have been transferred to the Directorate of Criminal Investigations',
          assignedBy: 'Police Administration',
          assignedAt: '2024-01-23T15:30:00',
          department: 'Directorate of Criminal Investigations',
          isRead: true,
          priority: 'medium',
          actionUrl: '/profile'
        },
        {
          id: '3',
          type: 'role_updated',
          title: 'Role Responsibilities Updated',
          message: 'Your responsibilities as Police Officer have been updated to include crime investigation',
          assignedBy: 'Station Commander',
          assignedAt: '2024-01-22T09:15:00',
          role: 'police_officer',
          isRead: true,
          priority: 'low'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deleted = notifications.find(n => n.id === notificationId);
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'role_assigned': return <ShieldCheckIcon className="h-5 w-5 text-blue-600" />;
      case 'role_updated': return <UserGroupIcon className="h-5 w-5 text-yellow-600" />;
      case 'role_revoked': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'department_change': return <MapPinIcon className="h-5 w-5 text-green-600" />;
      default: return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-gray-50';
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

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Notifications</h1>
            <p className="text-gray-600 mt-1">View your role assignments and department notifications</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {unreadCount} unread
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll see role assignments and updates here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 rounded-lg p-4 transition-all ${
                  notification.isRead 
                    ? 'border-gray-300 bg-white' 
                    : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {/* Additional Details */}
                      <div className="space-y-1 mb-3">
                        {notification.role && (
                          <div className="flex items-center text-xs text-gray-500">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Role: <span className="font-medium ml-1">{notification.role.replace('_', ' ')}</span>
                          </div>
                        )}
                        {notification.department && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            Department: <span className="font-medium ml-1">{notification.department}</span>
                          </div>
                        )}
                        {notification.location && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            Location: <span className="font-medium ml-1">{notification.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatTimestamp(notification.assignedAt)}
                          <span className="mx-2">•</span>
                          <span>By {notification.assignedBy}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {notification.actionUrl && (
                            <button
                              onClick={() => window.location.href = notification.actionUrl!}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </button>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gray-600 hover:text-gray-700"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Role Display */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Role Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Role</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900 capitalize">
                    {user?.role?.replace('_', ' ') || 'No role assigned'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-900">
                    {(user as any)?.department || 'No department assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Information</label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {user?.email ?? 'No email'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {user?.phone_number || 'No phone number'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Status</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-900">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleNotifications;
