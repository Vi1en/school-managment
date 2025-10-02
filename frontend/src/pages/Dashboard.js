import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, admin, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const testConnectivity = async () => {
    try {
      console.log('Testing basic connectivity...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test', password: 'test' })
      });
      console.log('Connectivity test response status:', response.status);
      return true;
    } catch (error) {
      console.error('Connectivity test failed:', error);
      return false;
    }
  };

  const fetchStats = useCallback(async () => {
    console.log('fetchStats called. Auth state:', { isAuthenticated, admin, token });
    
    if (!isAuthenticated || redirecting) {
      console.log('User not authenticated or redirecting, skipping stats fetch');
      setLoading(false);
      return;
    }
    
    // Check if using mock token and force logout
    if (token === 'mock-jwt-token') {
      console.log('Detected mock token, forcing logout...');
      setRedirecting(true);
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.replace('/login');
      return;
    }
    
    // Test connectivity first
    const isConnected = await testConnectivity();
    if (!isConnected) {
      console.error('No network connectivity detected');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching dashboard stats...');
      console.log('Token:', token);
      
      const response = await studentsAPI.getStats();
      console.log('Dashboard stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // If 401 error, clear session and redirect to login
      if (error.response?.status === 401) {
        console.log('401 error detected, clearing session...');
        setRedirecting(true);
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        // Use replace instead of href to prevent back button issues
        window.location.replace('/login');
        return; // Important: return to prevent further execution
      }
      
      // Set default stats if API fails
      setStats({
        totalStudents: 0,
        paidStudents: 0,
        partialPaidStudents: 0,
        unpaidStudents: 0,
        failedStudents: 0,
        passedStudents: 0,
        graduatedStudents: 0,
        averageAttendance: 0,
        feeStats: {
          totalCollected: 0,
          totalPending: 0
        }
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, admin, token, redirecting]);

  useEffect(() => {
    console.log('Dashboard mounted. Auth state:', { isAuthenticated, admin, token });
    console.log('Current URL:', window.location.href);
    console.log('API Base URL:', process.env.REACT_APP_API_URL || '/api');
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      console.log('Starting fetchStats after delay...');
      fetchStats();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, admin, token, fetchStats]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    setSearchResult(null);
    setSearchResults([]);
    
    try {
      // First try to search by admission number (exact match)
      try {
        const response = await studentsAPI.getByAdmissionNumber(searchTerm.trim());
        setSearchResult(response.data);
        setSearchResults([response.data]);
        return;
      } catch (admissionError) {
        // If not found by admission number, search by name or partial admission number
        const allStudentsResponse = await studentsAPI.getAll({ search: searchTerm.trim() });
        const students = allStudentsResponse.data.students || allStudentsResponse.data;
        
        if (students && students.length > 0) {
          if (students.length === 1) {
            setSearchResult(students[0]);
            setSearchResults([students[0]]);
          } else {
            // Multiple students found, show all results
            setSearchResults(students);
            setSearchResult(null);
          }
        } else {
          setSearchResult(null);
          setSearchResults([]);
        }
      }
    } catch (error) {
      setSearchResult(null);
      setSearchResults([]);
      console.error('Error searching student:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view the dashboard.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-black">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Welcome to your school management system</p>
            </div>
            <Link
              to="/add-student"
              className="btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Student
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="search-container mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Search Student</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter admission number or student name to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="search-button"
            >
              {searchLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </div>
              )}
            </button>
          </form>

          {/* Single Search Result */}
          {searchResult && (
            <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-black">
                    {searchResult.studentName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Admission: {searchResult.admissionNumber} | Class: {searchResult.currentClass} | Status: {searchResult.passFailStatus}
                  </p>
                </div>
                <Link
                  to={`/student/${searchResult.admissionNumber}`}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200"
                >
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Multiple Search Results */}
          {searchResults.length > 1 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-black mb-3">
                Found {searchResults.length} students matching "{searchTerm}"
              </h4>
              <div className="space-y-2">
                {searchResults.map((student) => (
                  <div key={student.admissionNumber} className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-black">{student.studentName}</h5>
                        <p className="text-sm text-gray-600">
                          Admission: {student.admissionNumber} | Class: {student.currentClass} | Status: {student.passFailStatus}
                        </p>
                      </div>
                      <Link
                        to={`/student/${student.admissionNumber}`}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200"
                      >
                        View
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchTerm && !searchResult && searchResults.length === 0 && !searchLoading && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">No students found matching "{searchTerm}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Students Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-icon blue">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-black">{stats?.totalStudents || 0}</p>
            </div>
          </div>

          {/* Passed Students Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-icon green">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Passed Students</p>
              <p className="text-3xl font-bold text-black">{stats?.passedStudents || 0}</p>
            </div>
          </div>

          {/* Failed Students Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-icon red">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Students</p>
              <p className="text-3xl font-bold text-black">{stats?.failedStudents || 0}</p>
            </div>
          </div>

          {/* Graduated Students Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-icon green">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Graduated Students</p>
              <p className="text-3xl font-bold text-black">{stats?.graduatedStudents || 0}</p>
            </div>
          </div>

          {/* Total Fees Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-icon yellow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees Collected</p>
              <p className="text-3xl font-bold text-black">₹{stats?.feeStats?.totalPaid?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Fee Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dashboard-card">
            <div className="dashboard-card-icon green">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-black">{stats?.paidStudents || 0}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon yellow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Partial</p>
              <p className="text-2xl font-bold text-black">{stats?.partialPaidStudents || 0}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon red">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid</p>
              <p className="text-2xl font-bold text-black">{stats?.unpaidStudents || 0}</p>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">Average Attendance</h3>
            <div className="text-right">
              <p className="text-sm text-gray-600">Target: 75%</p>
              <p className={`text-sm font-medium ${
                (stats?.averageAttendance || 0) >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.averageAttendance || 0) >= 75 ? 'Above Target' : 'Below Target'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold text-black">
                {stats?.averageAttendance?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-600">Overall attendance rate</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                (stats?.averageAttendance || 0) >= 75 ? 'bg-green-500' :
                (stats?.averageAttendance || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((stats?.averageAttendance || 0), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
