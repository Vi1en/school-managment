import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { studentsAPI } from '../services/api';

const ViewStudent = () => {
  const navigate = useNavigate();
  const { admissionNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudent();
  }, [admissionNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudent = async () => {
    try {
      const response = await studentsAPI.getByAdmissionNumber(admissionNumber);
      setStudent(response.data);
    } catch (err) {
      setError('Error fetching student data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(admissionNumber);
        navigate('/');
      } catch (err) {
        setError('Error deleting student');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error || 'Student not found'}</div>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {student.photo ? (
              <img
                className="h-16 w-12 object-cover border border-gray-300"
                src={student.photo}
                alt={student.studentName}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-16 w-12 bg-gray-200 flex items-center justify-center border border-gray-300 ${student.photo ? 'hidden' : 'flex'}`}
            >
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Student Details - {student.studentName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Admission Number: {student.admissionNumber}
            </p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Link
            to={`/edit-student/${student.admissionNumber}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Student
          </Link>
          <Link
            to={`/marksheet/${student.admissionNumber}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Generate Marksheet
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.studentName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.admissionNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.fatherName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.motherName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(student.dob)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.phoneNumber || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.address || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Academic Performance
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Class</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.currentClass}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Promoted To Class</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.promotedToClass}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Graduation Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.graduationStatus === 'Graduated' 
                        ? 'bg-green-100 text-green-800' 
                        : student.graduationStatus === 'Dropped Out'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {student.graduationStatus || 'In Progress'}
                    </span>
                    {student.graduationDate && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Graduated: {new Date(student.graduationDate).toLocaleDateString()})
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Attendance</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.attendance}%
                    {student.attendance < 75 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Low Attendance
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pass/Fail Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.passFailStatus)}`}>
                      {student.passFailStatus}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unit Test Marks</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.unitTestMarks}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Half-Yearly Marks</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.halfYearlyMarks}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Annual Exam Marks</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.annualExamMarks}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Marks</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">
                    {student.averageMarks.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Fee Details & Summary */}
        <div className="space-y-6">
          {/* Fee Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Fee Details
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Fee</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{student.feeDetails.totalFee.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{student.feeDetails.amountPaid.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pending Amount</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{(student.feeDetails.totalFee - student.feeDetails.amountPaid).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.feeDetails.paymentStatus)}`}>
                      {student.feeDetails.paymentStatus}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/edit-student/${student.admissionNumber}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Student
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Student
                </button>
                <Link
                  to="/"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;
