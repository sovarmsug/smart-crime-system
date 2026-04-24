import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CrimeReports from './pages/CrimeReports';
import ReportCrime from './pages/ReportCrime';
import Alerts from './pages/Alerts';
import Predictions from './pages/Predictions';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import RoleManagement from './components/RoleManagement';
import CrimeAssignment from './components/CrimeAssignment';
import RoleNotifications from './components/RoleNotifications';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/crimes" element={
                <ProtectedRoute>
                  <Layout>
                    <CrimeReports />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/report-crime" element={
                <ProtectedRoute>
                  <Layout>
                    <ReportCrime />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/alerts" element={
                <ProtectedRoute allowedRoles={['police_officer', 'admin']}>
                  <Layout>
                    <Alerts />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/predictions" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Predictions />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/role-management" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <RoleManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/crime-assignment" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <CrimeAssignment />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/role-notifications" element={
                <ProtectedRoute>
                  <Layout>
                    <RoleNotifications />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
