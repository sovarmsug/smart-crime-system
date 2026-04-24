import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { mockCrimes } from '../data/mockCrimes';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CrimeReport {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  district: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    department: string;
    phone: string;
    email: string;
  };
  assignedBy?: string;
  assignedAt?: string;
}

interface Officer {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  rank: string;
  specialization: string[];
  currentAssignments: number;
  maxAssignments: number;
  isAvailable: boolean;
  lastActive: string;
  location: string;
  phone: string;
}

interface CrimeAssignmentProps {
  className?: string;
}

const CrimeAssignment: React.FC<CrimeAssignmentProps> = ({ className }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrimeReports();
    loadOfficers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-crime-report', handleNewCrimeReport);
      socket.on('crime-assigned', handleCrimeAssigned);
      socket.on('assignment-updated', handleAssignmentUpdated);

      return () => {
        socket.off('new-crime-report', handleNewCrimeReport);
        socket.off('crime-assigned', handleCrimeAssigned);
        socket.off('assignment-updated', handleAssignmentUpdated);
      };
    }
  }, [socket]);

  const handleNewCrimeReport = (report: CrimeReport) => {
    setReports(prev => [report, ...prev]);
    toast(`New crime reported: ${report.title}`, { icon: '🚨' });
  };

  const handleCrimeAssigned = (data: { reportId: string; officer: Officer }) => {
    setReports(prev => prev.map(r => 
      r.id === data.reportId 
        ? { ...r, assignedTo: data.officer, status: 'assigned', assignedAt: new Date().toISOString() }
        : r
    ));
    toast(`Crime assigned to ${data.officer.name}`, { icon: '✅' });
  };

  const handleAssignmentUpdated = (data: { reportId: string; status: string }) => {
    setReports(prev => prev.map(r => 
      r.id === data.reportId ? { ...r, status: data.status as any } : r
    ));
  };

  const loadCrimeReports = async () => {
    setLoading(true);
    try {
      // Use real API call
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/crimes?status=reported&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch crime reports');
      }
      
      const data = await response.json();
      const reports = data.reports || data.data || [];
      
      // Transform data to match component interface
      const transformedReports = reports.map((report: any) => ({
        id: report.id,
        title: report.title,
        description: report.description,
        type: report.crime_type,
        severity: report.severity as 'low' | 'medium' | 'high' | 'critical',
        location: report.address || `${report.district}, ${report.subcounty}`,
        district: report.district,
        reportedBy: report.first_name ? `${report.first_name} ${report.last_name}` : 'Anonymous',
        reportedAt: report.created_at,
        status: report.status === 'reported' ? 'pending' : report.status
      }));
      
      setReports(transformedReports);
    } catch (error) {
      console.error('Error loading crime reports:', error);
      toast.error('Failed to load crime reports');
      
      // Fallback to mock data if API fails
      const mockReports: CrimeReport[] = [
        {
          id: 'CR001',
          title: 'Armed Robbery at Shoprite',
          description: 'Unknown assailants robbed Shoprite supermarket at gunpoint',
          type: 'Robbery',
          severity: 'critical',
          location: 'Shoprite, Lugogo',
          district: 'Kampala',
          reportedBy: 'John Citizen',
          reportedAt: '2024-01-24T14:30:00',
          status: 'pending'
        },
        {
          id: '3',
          title: 'Assault in Kabalagala',
          description: 'Physical assault during bar fight',
          type: 'Assault',
          severity: 'medium',
          location: 'Kabalagala',
          district: 'Kampala',
          reportedBy: 'Anonymous',
          reportedAt: '2024-01-24T10:45:00',
          status: 'in_progress',
          assignedTo: {
            id: 'officer2',
            name: 'Officer Grace Akena',
            role: 'police_officer',
            department: 'Kampala Metropolitan Police',
            phone: '+256712345678',
            email: 'g.akena@police.ug'
          },
          assignedBy: 'IGP Office',
          assignedAt: '2024-01-24T11:30:00'
        }
      ];
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async () => {
    try {
      // Mock officers data
      const mockOfficers: Officer[] = [
        {
          id: 'officer1',
          name: 'David Ochieng',
          email: 'd.ochieng@police.ug',
          role: 'police_officer',
          department: 'Kampala Metropolitan Police',
          rank: 'Sergeant',
          specialization: ['Robbery', 'Theft'],
          currentAssignments: 3,
          maxAssignments: 5,
          isAvailable: true,
          lastActive: '2024-01-24T08:00:00',
          location: 'Kampala Central',
          phone: '+256711345678'
        },
        {
          id: 'officer2',
          name: 'Grace Akena',
          email: 'g.akena@police.ug',
          role: 'police_officer',
          department: 'Kampala Metropolitan Police',
          rank: 'Inspector',
          specialization: ['Assault', 'Domestic Violence'],
          currentAssignments: 4,
          maxAssignments: 5,
          isAvailable: false,
          lastActive: '2024-01-24T07:30:00',
          location: 'Kampala East',
          phone: '+256712345678'
        },
        {
          id: 'officer3',
          name: 'Michael Ssenyonjo',
          email: 'm.ssenyonjo@police.ug',
          role: 'district_commander',
          department: 'Kampala Metropolitan Police',
          rank: 'Assistant Commissioner',
          specialization: ['Critical Crimes', 'Organized Crime'],
          currentAssignments: 2,
          maxAssignments: 8,
          isAvailable: true,
          lastActive: '2024-01-24T09:15:00',
          location: 'Kampala Central',
          phone: '+256713987654'
        }
      ];
      setOfficers(mockOfficers);
    } catch (error) {
      console.error('Error loading officers:', error);
    }
  };

  const assignOfficer = async () => {
    if (!selectedReport || !selectedOfficer) return;

    try {
      // Check if officer is available
      if (selectedOfficer.currentAssignments >= selectedOfficer.maxAssignments) {
        toast.error('Officer has reached maximum assignments');
        return;
      }

      // Update report with assigned officer
      const updatedReport = {
        ...selectedReport,
        assignedTo: {
          id: selectedOfficer.id,
          name: selectedOfficer.name,
          role: selectedOfficer.role,
          department: selectedOfficer.department,
          phone: selectedOfficer.phone,
          email: selectedOfficer.email
        },
        status: 'assigned' as const,
        assignedBy: user?.email,
        assignedAt: new Date().toISOString()
      };

      setReports(prev => prev.map(r => r.id === selectedReport.id ? updatedReport : r));
      
      // Update officer assignments count
      setOfficers(prev => prev.map(o => 
        o.id === selectedOfficer.id 
          ? { ...o, currentAssignments: o.currentAssignments + 1 }
          : o
      ));

      // Send notification via socket
      if (socket) {
        socket.emit('assign-crime', {
          reportId: selectedReport.id,
          officerId: selectedOfficer.id,
          assignedBy: user?.email
        });
      }

      // Send notification to assigned officer
      await notifyOfficer(selectedOfficer, selectedReport);

      setShowAssignmentModal(false);
      setSelectedReport(null);
      setSelectedOfficer(null);
      
      toast.success(`Crime assigned to ${selectedOfficer.name}`);
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast.error('Failed to assign officer');
    }
  };

  const notifyOfficer = async (officer: Officer, report: CrimeReport) => {
    try {
      // Mock notification - in real app, this would send email/SMS/push notification
      console.log(`Notifying ${officer.name} about crime assignment: ${report.title}`);
      
      // Show toast for demo
      toast(`📱 Notification sent to ${officer.name}`, {
        duration: 3000,
        icon: '📱'
      });
    } catch (error) {
      console.error('Error notifying officer:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = `${report.title} ${report.description} ${report.location}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const availableOfficers = officers.filter(officer => officer.isAvailable && officer.currentAssignments < officer.maxAssignments);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crime Assignment</h1>
            <p className="text-gray-600 mt-1">IGP - Assign officers to handle specific crime reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {reports.filter(r => r.status === 'pending').length} Pending Assignments
            </span>
            <span className="text-sm text-blue-600">
              {reports.filter(r => r.status === 'assigned').length} Assigned
            </span>
            <span className="text-sm text-yellow-600">
              {reports.filter(r => r.status === 'in_progress').length} In Progress
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search crime reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Crime Reports */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crime Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.type} • {new Date(report.reportedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Reported by: {report.reportedBy}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {report.location}
                    </div>
                    <div className="text-xs text-gray-500">
                      {report.district}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(report.severity)}`}>
                      {report.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {report.assignedTo ? (
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.assignedTo.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.assignedTo.role.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowAssignmentModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        Assign Officer
                      </button>
                    )}
                    {report.assignedTo && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setSelectedOfficer(officers.find(o => o.id === report.assignedTo?.id) || null);
                            setShowAssignmentModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Officer - {selectedReport.title}
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedReport(null);
                  setSelectedOfficer(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crime Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Crime Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Type:</span>
                    <span className="text-sm text-gray-900 ml-2">{selectedReport.type}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Severity:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedReport.severity)}`}>
                      {selectedReport.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location:</span>
                    <span className="text-sm text-gray-900 ml-2">{selectedReport.location}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedReport.description}</p>
                  </div>
                </div>
              </div>

              {/* Officer Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Available Officers</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableOfficers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No available officers at the moment</p>
                    </div>
                  ) : (
                    availableOfficers.map((officer) => (
                      <div
                        key={officer.id}
                        onClick={() => setSelectedOfficer(officer)}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedOfficer?.id === officer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {officer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {officer.rank} • {officer.department}
                              </div>
                              <div className="text-xs text-gray-400">
                                Specialization: {officer.specialization.join(', ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {officer.currentAssignments}/{officer.maxAssignments} assignments
                            </div>
                            <div className={`text-xs font-medium ${
                              officer.isAvailable ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {officer.isAvailable ? 'Available' : 'Busy'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedReport(null);
                  setSelectedOfficer(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={assignOfficer}
                disabled={!selectedOfficer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowRightIcon className="h-4 w-4 mr-2" />
                Assign to {selectedOfficer?.name || 'Selected Officer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeAssignment;
