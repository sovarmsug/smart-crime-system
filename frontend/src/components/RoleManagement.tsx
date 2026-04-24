import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'police_officer' | 'citizen' | 'dpcs' | 'rpcs' | 'district_commander' | 'regional_coordinator';
  department?: string;
  station?: string;
  district?: string;
  region?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  assignedBy?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  type: 'law_enforcement' | 'administrative' | 'support';
  parentDepartment?: string;
  headOfDepartment?: string;
  stations?: string[];
}

interface RoleManagementProps {
  className?: string;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ className }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'dpcs.director@police.ug',
          firstName: 'John',
          lastName: 'Mugisha',
          role: 'dpcs',
          department: 'Directorate of Criminal Investigations',
          phone: '+256714123456',
          isActive: true,
          createdAt: '2024-01-15',
          lastLogin: '2024-01-24T10:30:00',
          assignedBy: 'admin@smartcrime.ug'
        },
        {
          id: '2',
          email: 'rpcs.commander@police.ug',
          firstName: 'Sarah',
          lastName: 'Nakato',
          role: 'rpcs',
          department: 'Regional Police Service',
          region: 'Central Region',
          phone: '+256712345678',
          isActive: true,
          createdAt: '2024-01-10',
          lastLogin: '2024-01-23T14:20:00',
          assignedBy: 'admin@smartcrime.ug'
        },
        {
          id: '3',
          email: 'district.commander@kampala.police.ug',
          firstName: 'Michael',
          lastName: 'Ssenyonjo',
          role: 'district_commander',
          department: 'Kampala Metropolitan Police',
          district: 'Kampala',
          station: 'Central Police Station',
          phone: '+256713987654',
          isActive: true,
          createdAt: '2024-01-08',
          lastLogin: '2024-01-24T09:15:00',
          assignedBy: 'dpcs.director@police.ug'
        },
        {
          id: '4',
          email: 'regional.coordinator@eastern.police.ug',
          firstName: 'Grace',
          lastName: 'Akena',
          role: 'regional_coordinator',
          department: 'Eastern Region Coordination',
          region: 'Eastern Region',
          phone: '+256715234567',
          isActive: true,
          createdAt: '2024-01-12',
          lastLogin: '2024-01-22T16:45:00',
          assignedBy: 'admin@smartcrime.ug'
        },
        {
          id: '5',
          email: 'police.officer@kampala.police.ug',
          firstName: 'David',
          lastName: 'Ochieng',
          role: 'police_officer',
          department: 'Kampala Metropolitan Police',
          district: 'Kampala',
          station: 'Central Police Station',
          phone: '+256711345678',
          isActive: true,
          createdAt: '2024-01-20',
          lastLogin: '2024-01-24T08:30:00',
          assignedBy: 'district.commander@kampala.police.ug'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      // Mock departments data
      const mockDepartments: Department[] = [
        {
          id: '1',
          name: 'Directorate of Criminal Investigations (DPCI)',
          code: 'DPCI',
          type: 'law_enforcement',
          headOfDepartment: 'John Mugisha'
        },
        {
          id: '2',
          name: 'Regional Police Service (RPS)',
          code: 'RPS',
          type: 'law_enforcement',
          parentDepartment: 'DPCI'
        },
        {
          id: '3',
          name: 'Kampala Metropolitan Police',
          code: 'KMP',
          type: 'law_enforcement',
          parentDepartment: 'RPS'
        },
        {
          id: '4',
          name: 'Traffic Police',
          code: 'TP',
          type: 'law_enforcement',
          parentDepartment: 'DPCI'
        },
        {
          id: '5',
          name: 'Police Health Services',
          code: 'PHS',
          type: 'support',
          parentDepartment: 'DPCI'
        }
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        role: userData.role!,
        department: userData.department,
        station: userData.station,
        district: userData.district,
        region: userData.region,
        phone: userData.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
        assignedBy: user?.email
      };

      setUsers(prev => [...prev, newUser]);
      setShowAddUserModal(false);
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const updatedUser = { ...selectedUser, ...userData };
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditUserModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success('User status updated');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'dpcs': return 'DPCI Director';
      case 'rpcs': return 'RPS Commander';
      case 'district_commander': return 'District Commander';
      case 'regional_coordinator': return 'Regional Coordinator';
      case 'police_officer': return 'Police Officer';
      case 'citizen': return 'Citizen';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'dpcs': return 'bg-red-100 text-red-800';
      case 'rpcs': return 'bg-orange-100 text-orange-800';
      case 'district_commander': return 'bg-blue-100 text-blue-800';
      case 'regional_coordinator': return 'bg-green-100 text-green-800';
      case 'police_officer': return 'bg-indigo-100 text-indigo-800';
      case 'citizen': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'dpcs': return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'rpcs': return <UserGroupIcon className="h-4 w-4" />;
      case 'district_commander': return <IdentificationIcon className="h-4 w-4" />;
      case 'regional_coordinator': return <MapPinIcon className="h-4 w-4" />;
      case 'police_officer': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'citizen': return <UserGroupIcon className="h-4 w-4" />;
      default: return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-1">Manage user roles and department assignments</p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="dpcs">DPCI Director</option>
            <option value="rpcs">RPS Commander</option>
            <option value="district_commander">District Commander</option>
            <option value="regional_coordinator">Regional Coordinator</option>
            <option value="police_officer">Police Officer</option>
            <option value="citizen">Citizen</option>
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.department || '-'}
                    </div>
                    {user.station && (
                      <div className="text-xs text-gray-500">
                        {user.station}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      {user.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        user.isActive ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        user.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`${
                          user.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? (
                          <XMarkIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-500">{dept.code}</p>
                  {dept.headOfDepartment && (
                    <p className="text-sm text-gray-600 mt-1">
                      Head: {dept.headOfDepartment}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  dept.type === 'law_enforcement' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {dept.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddUserModal || showEditUserModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showEditUserModal ? 'Edit User' : 'Add New User'}
            </h3>
            
            <UserForm
              user={selectedUser}
              onSubmit={showEditUserModal ? updateUser : createUser}
              onCancel={() => {
                setShowAddUserModal(false);
                setShowEditUserModal(false);
                setSelectedUser(null);
              }}
              departments={departments}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// User Form Component
interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: Partial<User>) => void;
  onCancel: () => void;
  departments: Department[];
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, departments }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'citizen',
    department: user?.department || '',
    station: user?.station || '',
    district: user?.district || '',
    region: user?.region || '',
    phone: user?.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          required
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="citizen">Citizen</option>
          <option value="police_officer">Police Officer</option>
          <option value="district_commander">District Commander</option>
          <option value="regional_coordinator">Regional Coordinator</option>
          <option value="rpcs">RPS Commander</option>
          <option value="dpcs">DPCI Director</option>
          <option value="admin">System Administrator</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <select
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Station
          </label>
          <input
            type="text"
            value={formData.station}
            onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default RoleManagement;
