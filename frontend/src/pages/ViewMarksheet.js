import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marksheetsAPI } from '../services/api';
import MarksheetPreview from '../components/MarksheetPreview';

const ViewMarksheet = () => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMarksheet = useCallback(async () => {
    try {
      const response = await marksheetsAPI.getByRollNumber(rollNumber);
      setMarksheet(response.data);
    } catch (err) {
      setError('Marksheet not found');
      console.error('Error fetching marksheet:', err);
    } finally {
      setLoading(false);
    }
  }, [rollNumber]);

  useEffect(() => {
    fetchMarksheet();
  }, [fetchMarksheet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marksheet...</p>
        </div>
      </div>
    );
  }

  if (error || !marksheet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Marksheet Not Found</h2>
          <p className="text-gray-600 mb-6">The marksheet you're looking for doesn't exist.</p>
          <Link
            to="/marksheets"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Marksheets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/marksheets"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Back to Marksheets
          </Link>
          
          <div className="space-x-3">
            <Link
              to={`/edit-marksheet/${rollNumber}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit Marksheet
            </Link>
          </div>
        </div>

        {/* Marksheet Display */}
        <MarksheetPreview 
          marksheetData={marksheet}
          onBack={() => navigate('/marksheets')}
          onSubmit={() => {}}
          loading={false}
          isViewOnly={true}
        />
      </div>
    </div>
  );
};

export default ViewMarksheet;
