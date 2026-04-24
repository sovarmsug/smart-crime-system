import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfileSwitcherProps {
  className?: string;
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Demo accounts for quick switching
  const demoAccounts = [
    {
      id: 'admin',
      email: 'admin@smartcrime.ug',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      color: 'bg-purple-600'
    },
    {
      id: 'police',
      email: 'police@smartcrime.ug',
      password: 'admin123',
      role: 'police_officer',
      name: 'Police Officer',
      color: 'bg-blue-600'
    },
    {
      id: 'citizen',
      email: 'citizen@smartcrime.ug',
      password: 'admin123',
      role: 'citizen',
      name: 'Citizen User',
      color: 'bg-green-600'
    }
  ];

  const handleSwitchAccount = async (account: typeof demoAccounts[0]) => {
    if (account.email === user?.email) {
      toast.error('Already using this account');
      return;
    }

    try {
      // Logout current user
      await logout();
      
      // Login with new account
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Reload page to update auth context
        window.location.reload();
        
        toast.success(`Switched to ${account.name}`);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Switch account error:', error);
      toast.error('Failed to switch account');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'police_officer': return <UserGroupIcon className="h-4 w-4" />;
      case 'citizen': return <UserIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className={`h-8 w-8 rounded-full ${
          user?.role === 'admin' ? 'bg-purple-600' :
          user?.role === 'police_officer' ? 'bg-blue-600' :
          'bg-green-600'
        } flex items-center justify-center`}>
          <span className="text-white text-sm font-medium">
            {user?.first_name?.[0] || 'U'}
          </span>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role?.replace('_', ' ')}
          </p>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Current User */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-full ${
                user?.role === 'admin' ? 'bg-purple-600' :
                user?.role === 'police_officer' ? 'bg-blue-600' :
                'bg-green-600'
              } flex items-center justify-center`}>
                <span className="text-white font-medium">
                  {user?.first_name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Switch Accounts */}
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Switch Account
            </p>
            {demoAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSwitchAccount(account)}
                disabled={account.email === user?.email}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  account.email === user?.email
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`h-8 w-8 rounded-full ${account.color} flex items-center justify-center`}>
                  {getRoleIcon(account.role)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.email}</p>
                </div>
                {account.email === user?.email && (
                  <span className="text-xs text-green-600 font-medium">Current</span>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <UserIcon className="h-5 w-5" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
