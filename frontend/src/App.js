import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import ViewStudent from './pages/ViewStudent';
import Settings from './pages/Settings';
import FeeDeposits from './pages/FeeDeposits';
import Marks from './pages/Marks';
import Marksheet from './pages/Marksheet';
import MarksheetSelector from './pages/MarksheetSelector';
import GenerateMarksheet from './pages/GenerateMarksheet';
import Marksheets from './pages/Marksheets';
import ViewMarksheet from './pages/ViewMarksheet';
import ClassFees from './pages/ClassFees';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
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
        <Route path="generate-marksheet" element={<GenerateMarksheet />} />
        <Route path="view-marksheet/:rollNumber" element={<ViewMarksheet />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
