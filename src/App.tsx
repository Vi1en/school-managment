import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Login from '@/features/auth/Login';
import Dashboard from '@/features/dashboard/Dashboard';
import GenerateMarksheet from '@/features/marksheets/GenerateMarksheet';

// Lazy load components for better performance
const AddStudent = React.lazy(() => import('@/features/students/AddStudent'));
const EditStudent = React.lazy(() => import('@/features/students/EditStudent'));
const ViewStudent = React.lazy(() => import('@/features/students/ViewStudent'));
const Students = React.lazy(() => import('@/features/students/Students'));
const Marksheets = React.lazy(() => import('@/features/marksheets/Marksheets'));
const ViewMarksheet = React.lazy(() => import('@/features/marksheets/ViewMarksheet'));
const Settings = React.lazy(() => import('@/features/settings/Settings'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  // Show loading while authentication state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add-student" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <AddStudent />
          </Suspense>
        } />
        <Route path="edit-student/:admissionNumber" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <EditStudent />
          </Suspense>
        } />
        <Route path="student/:admissionNumber" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <ViewStudent />
          </Suspense>
        } />
        <Route path="students" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <Students />
          </Suspense>
        } />
        <Route path="generate-marksheet" element={<GenerateMarksheet />} />
        <Route path="marksheets" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <Marksheets />
          </Suspense>
        } />
        <Route path="view-marksheet/:rollNumber" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <ViewMarksheet />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>}>
            <Settings />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  const { isAuthenticated, token } = useAuthStore();
  const { setIsMobile } = useUIStore();

  // Handle responsive design on app load
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Handle theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
