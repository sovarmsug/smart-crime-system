import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import ProfileSwitcher from './ProfileSwitcher';
import RoleManagement from './RoleManagement';
import CrimeAssignment from './CrimeAssignment';
import RoleNotifications from './RoleNotifications';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  BellIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UsersIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavigationForRole = (role?: string) => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/app', icon: HomeIcon, current: location.pathname === '/app' },
      { 
        name: 'Crime Reports', 
        href: '/crimes', 
        icon: DocumentTextIcon, 
        current: location.pathname === '/crimes' 
      },
    ];

    const roleSpecificNavigation = [];

    // All users can report crimes
    if (role === 'citizen' || role === 'police_officer' || role === 'admin') {
      roleSpecificNavigation.push({
        name: 'Report Crime', 
        href: '/report-crime', 
        icon: PlusCircleIcon, 
        current: location.pathname === '/report-crime' 
      });
    }

    // Police and admin can view alerts
    if (role === 'police_officer' || role === 'admin') {
      roleSpecificNavigation.push({
        name: 'Alerts', 
        href: '/alerts', 
        icon: BellIcon, 
        current: location.pathname === '/alerts' 
      });
    }

    // Admin can access predictions
    if (role === 'admin') {
      roleSpecificNavigation.push({
        name: 'Predictions', 
        href: '/predictions', 
        icon: ChartBarIcon, 
        current: location.pathname === '/predictions' 
      });
    }

    return [...baseNavigation, ...roleSpecificNavigation];
  };

  const navigation = getNavigationForRole(user?.role);

  const adminNavigation = [
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: CogIcon, 
      current: location.pathname === '/admin' 
    },
    { 
      name: 'Role Management', 
      href: '/role-management', 
      icon: UserGroupIcon, 
      current: location.pathname === '/role-management' 
    },
    { 
      name: 'Crime Assignment', 
      href: '/crime-assignment', 
      icon: ShieldCheckIcon, 
      current: location.pathname === '/crime-assignment' 
    },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Role Notifications', href: '/role-notifications', icon: BellIcon },
    { name: 'Logout', href: '#', icon: ArrowRightOnRectangleIcon, action: logout },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Smart Crime</h1>
                  <p className="text-xs text-gray-500">Prediction & Alert System</p>
                </div>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    item.current
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {user?.role === 'admin' && adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    item.current
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              <ProfileSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
            <span className="ml-2 text-white font-bold text-lg">Smart Crime</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-md text-white hover:bg-blue-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                      ${item.current
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Admin navigation */}
            {user?.role === 'admin' && (
              <div className="mt-8">
                <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </div>
                <div className="mt-3 space-y-1">
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`
                          group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                          ${item.current
                            ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User section */}
        <div className="border-t border-gray-200 p-4">
          <ProfileSwitcher className="w-full" />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <div className={`
              h-2 w-2 rounded-full mr-2
              ${connected ? 'bg-green-400' : 'bg-gray-400'}
            `}></div>
            {connected ? 'Connected' : 'Offline'}
          </div>
        </div>

        {/* Page content */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
