import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { makeTextVisible } from './utils/visibleTextFix';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import MobileFirstLayout from './components/MobileFirstLayout';
import MobileFirstMarksheetGenerator from './components/MobileFirstMarksheetGenerator';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AddStudent = React.lazy(() => import('./pages/AddStudent'));
const EditStudent = React.lazy(() => import('./pages/EditStudent'));
const ViewStudent = React.lazy(() => import('./pages/ViewStudent'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FeeDeposits = React.lazy(() => import('./pages/FeeDeposits'));
const Marks = React.lazy(() => import('./pages/Marks'));
const Marksheet = React.lazy(() => import('./pages/Marksheet'));
const MarksheetSelector = React.lazy(() => import('./pages/MarksheetSelector'));
const Marksheets = React.lazy(() => import('./pages/Marksheets'));
const ViewMarksheet = React.lazy(() => import('./pages/ViewMarksheet'));
const ClassFees = React.lazy(() => import('./pages/ClassFees'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading application..." className="min-h-screen" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MobileFirstLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="edit-student/:admissionNumber" element={<EditStudent />} />
          <Route path="student/:admissionNumber" element={<ViewStudent />} />
          <Route path="settings" element={<Settings />} />
          <Route path="fee-deposits" element={<FeeDeposits />} />
          <Route path="class-fees" element={<ClassFees />} />
          <Route path="marks" element={<Marks />} />
          <Route path="marksheet" element={<MarksheetSelector />} />
          <Route path="marksheet/:admissionNumber/:type" element={<Marksheet />} />
          <Route path="marksheets" element={<Marksheets />} />
          <Route path="generate-marksheet" element={<MobileFirstMarksheetGenerator />} />
          <Route path="view-marksheet/:rollNumber" element={<ViewMarksheet />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

function App() {
  useEffect(() => {
    // Apply simple visible text fix when app loads
    console.log('🚀 App: Applying visible text fix...');
    makeTextVisible();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
