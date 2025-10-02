import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';

const DatabaseDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testStudent, setTestStudent] = useState(null);

  const runDiagnostic = async () => {
    setLoading(true);
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Database Connection
      console.log('=== DATABASE DIAGNOSTIC STARTED ===');
      
      try {
        const testResponse = await fetch('/api/test');
        const testData = await testResponse.json();
        results.tests.push({
          name: 'Database Connection Test',
          status: testResponse.ok ? 'PASS' : 'FAIL',
          details: testData,
          response: testResponse.status
        });
        console.log('Database test result:', testData);
      } catch (error) {
        results.tests.push({
          name: 'Database Connection Test',
          status: 'FAIL',
          details: error.message,
          response: 'Network Error'
        });
      }

      // Test 2: Fetch All Students
      try {
        console.log('Testing students fetch...');
        const studentsResponse = await studentsAPI.getAll();
        console.log('Students response:', studentsResponse);
        
        results.tests.push({
          name: 'Fetch All Students',
          status: 'PASS',
          details: {
            count: studentsResponse.data?.students?.length || 0,
            data: studentsResponse.data?.students?.slice(0, 2) || [],
            fullResponse: studentsResponse.data
          },
          response: studentsResponse.status
        });
      } catch (error) {
        results.tests.push({
          name: 'Fetch All Students',
          status: 'FAIL',
          details: error.message,
          response: error.response?.status || 'Network Error'
        });
      }

      // Test 3: Create Test Student
      try {
        console.log('Creating test student...');
        const testStudentData = {
          admissionNumber: 'TEST' + Date.now(),
          studentName: 'Test Student ' + Date.now(),
          fatherName: 'Test Father',
          motherName: 'Test Mother',
          dob: '2010-01-01',
          currentClass: '9',
          bloodGroup: 'O+',
          address: 'Test Address',
          phoneNumber: '1234567890',
          feeDetails: {
            totalFee: 1000,
            amountPaid: 500,
            remainingAmount: 500
          }
        };

        const createResponse = await studentsAPI.create(testStudentData);
        console.log('Test student created:', createResponse);
        
        results.tests.push({
          name: 'Create Test Student',
          status: 'PASS',
          details: createResponse.data,
          response: createResponse.status
        });

        setTestStudent(createResponse.data.student);
      } catch (error) {
        results.tests.push({
          name: 'Create Test Student',
          status: 'FAIL',
          details: error.message,
          response: error.response?.status || 'Network Error'
        });
      }

      // Test 4: Fetch Test Student
      if (testStudent) {
        try {
          console.log('Fetching test student...');
          const fetchResponse = await studentsAPI.getByAdmissionNumber(testStudent.admissionNumber);
          console.log('Test student fetched:', fetchResponse);
          
          results.tests.push({
            name: 'Fetch Test Student',
            status: 'PASS',
            details: fetchResponse.data,
            response: fetchResponse.status
          });
        } catch (error) {
          results.tests.push({
            name: 'Fetch Test Student',
            status: 'FAIL',
            details: error.message,
            response: error.response?.status || 'Network Error'
          });
        }
      }

      // Test 5: Dashboard Stats
      try {
        console.log('Testing dashboard stats...');
        const statsResponse = await studentsAPI.getStats();
        console.log('Dashboard stats:', statsResponse);
        
        results.tests.push({
          name: 'Dashboard Stats',
          status: 'PASS',
          details: statsResponse.data,
          response: statsResponse.status
        });
      } catch (error) {
        results.tests.push({
          name: 'Dashboard Stats',
          status: 'FAIL',
          details: error.message,
          response: error.response?.status || 'Network Error'
        });
      }

    } catch (error) {
      console.error('Diagnostic error:', error);
      results.tests.push({
        name: 'General Error',
        status: 'FAIL',
        details: error.message,
        response: 'Unknown'
      });
    }

    setDiagnosticResults(results);
    setLoading(false);
    console.log('=== DIAGNOSTIC COMPLETE ===', results);
  };

  const clearTestData = async () => {
    if (testStudent) {
      try {
        await studentsAPI.delete(testStudent.admissionNumber);
        console.log('Test student deleted');
        setTestStudent(null);
      } catch (error) {
        console.error('Error deleting test student:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Database Diagnostic Tool</h2>
      
      <div className="mb-4">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Diagnostic...' : 'Run Database Diagnostic'}
        </button>
        
        {testStudent && (
          <button
            onClick={clearTestData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
          >
            Clear Test Data
          </button>
        )}
      </div>

      {diagnosticResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Diagnostic Results - {diagnosticResults.timestamp}</h3>
          
          {diagnosticResults.tests.map((test, index) => (
            <div key={index} className={`p-4 rounded border-l-4 ${
              test.status === 'PASS' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{test.name}</h4>
                <span className={`px-2 py-1 rounded text-sm ${
                  test.status === 'PASS' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {test.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Response Code:</strong> {test.response}
              </div>
              <div className="text-sm">
                <strong>Details:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {testStudent && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800">Test Student Created:</h4>
          <pre className="text-sm text-yellow-700 mt-2">
            {JSON.stringify(testStudent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DatabaseDiagnostic;
