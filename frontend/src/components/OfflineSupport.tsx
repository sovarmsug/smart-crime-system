import React, { useState, useEffect } from 'react';
import {
  WifiIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface OfflineSupportProps {
  className?: string;
}

interface QueuedAction {
  id: string;
  type: 'crime_report' | 'alert' | 'comment' | 'like';
  data: any;
  timestamp: string;
  retryCount: number;
}

const OfflineSupport: React.FC<OfflineSupportProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
      toast.success('Connection restored!');
      syncQueuedActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
      toast.error('Connection lost. Working in offline mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queued actions from localStorage
    loadQueuedActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadQueuedActions = () => {
    try {
      const stored = localStorage.getItem('queued-actions');
      if (stored) {
        setQueuedActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading queued actions:', error);
    }
  };

  const saveQueuedActions = (actions: QueuedAction[]) => {
    try {
      localStorage.setItem('queued-actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving queued actions:', error);
    }
  };

  const queueAction = (type: string, data: any) => {
    const action: QueuedAction = {
      id: `action-${Date.now()}-${Math.random()}`,
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    const updatedActions = [...queuedActions, action];
    setQueuedActions(updatedActions);
    saveQueuedActions(updatedActions);

    toast.success('Action queued for when you\'re back online');
  };

  const syncQueuedActions = async () => {
    if (!isOnline || queuedActions.length === 0) return;

    setSyncInProgress(true);

    try {
      const successful: string[] = [];
      const failed: QueuedAction[] = [];

      for (const action of queuedActions) {
        try {
          // Simulate API call - replace with actual API calls
          await simulateAPICall(action);
          successful.push(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          action.retryCount++;
          if (action.retryCount < 3) {
            failed.push(action);
          }
        }
      }

      // Update queued actions
      const updatedActions = queuedActions.filter(action => 
        !successful.includes(action.id)
      );
      setQueuedActions(updatedActions);
      saveQueuedActions(updatedActions);

      setLastSyncTime(new Date());

      if (successful.length > 0) {
        toast.success(`Synced ${successful.length} actions successfully`);
      }
      if (failed.length > 0) {
        toast(`${failed.length} actions failed to sync`, { icon: '⚠️' });
      }
    } catch (error) {
      console.error('Error during sync:', error);
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncInProgress(false);
    }
  };

  const simulateAPICall = (action: QueuedAction): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('API call failed'));
        }
      }, 1000);
    });
  };

  const clearQueuedActions = () => {
    setQueuedActions([]);
    saveQueuedActions([]);
    toast('Queued actions cleared', { icon: 'ℹ️' });
  };

  const retryFailedActions = () => {
    syncQueuedActions();
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'crime_report': return 'Crime Report';
      case 'alert': return 'Alert';
      case 'comment': return 'Comment';
      case 'like': return 'Like';
      default: return 'Action';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status Indicator */}
      <div className={`fixed top-4 right-4 z-50 ${isOnline ? 'hidden' : ''}`}>
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span className="font-medium">Offline Mode</span>
        </div>
      </div>

      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-800">You're offline</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Some features may be limited. Your actions will be queued and synced when you're back online.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOfflineNotice(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
              {isOnline ? (
                <WifiIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isOnline ? 'Connected' : 'Offline Mode'}
              </h3>
              <p className="text-sm text-gray-500">
                {isOnline ? 'All features available' : 'Limited functionality'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {lastSyncTime && (
              <span className="text-sm text-gray-500">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
            {isOnline && queuedActions.length > 0 && (
              <button
                onClick={syncQueuedActions}
                disabled={syncInProgress}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {syncInProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Queued Actions */}
        {queuedActions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                Queued Actions ({queuedActions.length})
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={retryFailedActions}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Retry All
                </button>
                <button
                  onClick={clearQueuedActions}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {queuedActions.map((action) => (
                <div key={action.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getActionTypeLabel(action.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(action.timestamp)}
                          {action.retryCount > 0 && ` • Retry ${action.retryCount}`}
                        </p>
                      </div>
                    </div>
                    {action.retryCount >= 3 && (
                      <span className="text-xs text-red-600 font-medium">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Offline Features Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Offline Features</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
            View previously loaded crime reports and alerts
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
            Create new crime reports (queued for sync)
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
            Access emergency SOS and call services
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
            View cached maps and location data
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OfflineSupport;
