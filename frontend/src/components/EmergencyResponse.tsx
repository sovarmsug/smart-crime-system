import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface EmergencyContact {
  id: string;
  name: string;
  type: 'police' | 'ambulance' | 'fire' | 'helpline';
  phone: string;
  responseTime: string;
  available: boolean;
}

interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  type: 'medical' | 'police' | 'fire' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'resolved';
  timestamp: string;
  description?: string;
  responders?: string[];
}

interface EmergencyResponseProps {
  className?: string;
}

const EmergencyResponse: React.FC<EmergencyResponseProps> = ({ className }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SOSAlert | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SOSAlert[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadEmergencyContacts();
    loadActiveAlerts();
    getCurrentLocation();

    if (socket) {
      socket.on('sos-activated', handleSOSActivated);
      socket.on('sos-updated', handleSOSUpdated);
      socket.on('emergency-broadcast', handleEmergencyBroadcast);
    }

    return () => {
      if (socket) {
        socket.off('sos-activated', handleSOSActivated);
        socket.off('sos-updated', handleSOSUpdated);
        socket.off('emergency-broadcast', handleEmergencyBroadcast);
      }
    };
  }, [socket]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSOSActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isSOSActive && countdown === 0) {
      activateSOS();
    }

    return () => clearInterval(interval);
  }, [isSOSActive, countdown]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location' // You can use reverse geocoding here
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const mockContacts: EmergencyContact[] = [
        {
          id: '1',
          name: 'Emergency Police',
          type: 'police',
          phone: '+256705499999',
          responseTime: '5-10 mins',
          available: true
        },
        {
          id: '2',
          name: 'Ambulance Service',
          type: 'ambulance',
          phone: '+256800123456',
          responseTime: '8-15 mins',
          available: true
        },
        {
          id: '3',
          name: 'Fire Department',
          type: 'fire',
          phone: '+256800789012',
          responseTime: '10-20 mins',
          available: true
        },
        {
          id: '4',
          name: 'Crime Helpline',
          type: 'helpline',
          phone: '+256800345678',
          responseTime: 'Immediate',
          available: true
        }
      ];
      setEmergencyContacts(mockContacts);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const loadActiveAlerts = async () => {
    try {
      const mockAlerts: SOSAlert[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          location: {
            lat: 0.3476,
            lng: 32.5825,
            address: 'Kampala Central, Uganda'
          },
          type: 'medical',
          severity: 'high',
          status: 'responding',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          description: 'Medical emergency - person unconscious',
          responders: ['Ambulance #12', 'Police Unit #3']
        }
      ];
      setActiveAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading active alerts:', error);
    }
  };

  const handleSOSActivated = (data: SOSAlert) => {
    setActiveAlerts(prev => [data, ...prev]);
    toast.error(`🚨 Emergency Alert: ${data.userName} needs help!`);
  };

  const handleSOSUpdated = (data: SOSAlert) => {
    setActiveAlerts(prev => 
      prev.map(alert => alert.id === data.id ? data : alert)
    );
  };

  const handleEmergencyBroadcast = (data: any) => {
    toast.error(`🚨 Emergency Broadcast: ${data.message}`);
  };

  const startSOSCountdown = () => {
    setIsSOSActive(true);
    setCountdown(5);
    getCurrentLocation();
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    setCountdown(5);
    toast.success('SOS cancelled');
  };

  const activateSOS = async () => {
    if (!location) {
      toast.error('Location required for SOS');
      setIsSOSActive(false);
      return;
    }

    try {
      const sosAlert: SOSAlert = {
        id: `sos-${Date.now()}`,
        userId: user?.id || 'anonymous',
        userName: `${user?.first_name} ${user?.last_name}` || 'Anonymous User',
        location: location,
        type: 'general',
        severity: 'critical',
        status: 'active',
        timestamp: new Date().toISOString(),
        description: 'Emergency SOS activated'
      };

      // Send SOS to server
      if (socket) {
        socket.emit('activate-sos', sosAlert);
      }

      setCurrentAlert(sosAlert);
      setActiveAlerts(prev => [sosAlert, ...prev]);
      
      // Call emergency services
      window.location.href = 'tel:+256705499999';
      
      toast.error('🚨 SOS Activated! Emergency services notified.');
    } catch (error) {
      console.error('Error activating SOS:', error);
      toast.error('Failed to activate SOS');
    } finally {
      setIsSOSActive(false);
      setCountdown(5);
    }
  };

  const callEmergencyService = (contact: EmergencyContact) => {
    window.location.href = `tel:${contact.phone}`;
    toast.success(`Calling ${contact.name}...`);
  };

  const startRecording = () => {
    setIsRecording(true);
    toast.success('Recording started for evidence');
    // Implement audio recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast.success('Recording saved');
    // Implement stop recording logic
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    toast.success('Starting video call with emergency services');
    // Implement video call logic
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'police': return <ShieldCheckIcon className="h-6 w-6" />;
      case 'ambulance': return <HomeIcon className="h-6 w-6" />;
      case 'fire': return <TruckIcon className="h-6 w-6" />;
      default: return <PhoneIcon className="h-6 w-6" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'responding': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isSOSActive ? (
          <button
            onClick={startSOSCountdown}
            className="bg-red-600 text-white p-6 rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 animate-pulse"
          >
            <div className="text-center">
              <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
              <span className="text-xs font-bold">SOS</span>
            </div>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl p-6 w-80">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{countdown}</div>
              <p className="text-gray-700 mb-4">Activating Emergency SOS...</p>
              <div className="flex space-x-2">
                <button
                  onClick={cancelSOS}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={activateSOS}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Activate Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${contact.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {getEmergencyIcon(contact.type)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.responseTime}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${contact.available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <button
                onClick={() => callEmergencyService(contact)}
                disabled={!contact.available}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  contact.available 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {contact.available ? 'Call Now' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Emergency Alerts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Emergency Alerts</h2>
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active emergency alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </div>
                    <div className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{alert.userName}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {alert.location.address}
                    </div>
                  </div>
                  <div>
                    {alert.responders && alert.responders.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Responders:</p>
                        <div className="space-y-1">
                          {alert.responders.map((responder, index) => (
                            <div key={index} className="text-sm text-gray-600">• {responder}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Tools */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-lg border-2 transition-colors ${
              isRecording 
                ? 'border-red-500 bg-red-50 text-red-600' 
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <MicrophoneIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">{isRecording ? 'Stop Recording' : 'Record Evidence'}</p>
          </button>
          
          <button
            onClick={startVideoCall}
            className="p-4 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <VideoCameraIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Video Call</p>
          </button>
          
          <button
            className="p-4 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Live Chat</p>
          </button>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Emergency Safety Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">During Emergency:</p>
            <ul className="space-y-1">
              <li>• Stay calm and assess the situation</li>
              <li>• Call emergency services immediately</li>
              <li>• Move to a safe location if possible</li>
              <li>• Follow instructions from emergency responders</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Before Emergency:</p>
            <ul className="space-y-1">
              <li>• Save emergency contacts in your phone</li>
              <li>• Know your location and address</li>
              <li>• Keep emergency kit ready</li>
              <li>• Share your location with trusted contacts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponse;
