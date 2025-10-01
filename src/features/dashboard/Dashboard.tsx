import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudentsStore } from '@/store/students';
import { useUIStore } from '@/store/ui';
import { DashboardStats, Student } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { TableColumn } from '@/types';

const Dashboard: React.FC = () => {
  const { students, fetchStudents, searchStudents, isLoading } = useStudentsStore();
  const { setError, clearError } = useUIStore();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [fetchStudents]);

  const fetchStats = async () => {
    try {
      // This would normally come from an API
      // For now, we'll calculate from students data
      const totalStudents = students.length;
      const paidStudents = students.filter(s => s.feeDetails.paymentStatus === 'paid').length;
      const partialPaidStudents = students.filter(s => s.feeDetails.paymentStatus === 'partial').length;
      const unpaidStudents = students.filter(s => s.feeDetails.paymentStatus === 'unpaid').length;
      
      const totalPaid = students.reduce((sum, s) => sum + s.feeDetails.amountPaid, 0);
      const totalFee = students.reduce((sum, s) => sum + s.feeDetails.totalFee, 0);
      
      setStats({
        totalStudents,
        paidStudents,
        partialPaidStudents,
        unpaidStudents,
        failedStudents: 0,
        passedStudents: 0,
        graduatedStudents: 0,
        averageAttendance: 85,
        feeStats: {
          totalPaid,
          totalPending: totalFee - totalPaid,
          totalFee,
        },
      });
    } catch (error) {
      setError('Failed to fetch dashboard statistics');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      await searchStudents(searchTerm);
      setSearchResults(students.filter(student => 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.includes(searchTerm)
      ));
    } catch (error) {
      setError('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const studentColumns: TableColumn<Student>[] = [
    {
      key: 'studentName',
      title: 'Student Name',
      dataIndex: 'studentName',
      render: (value, record) => (
        <div className="flex items-center">
          {record.photo ? (
            <img
              className="h-8 w-8 rounded-full mr-3"
              src={record.photo}
              alt={record.studentName}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-gray-700">
                {record.studentName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
            <div className="text-sm text-gray-500">{record.admissionNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'currentClass',
      title: 'Class',
      dataIndex: 'currentClass',
      render: (value) => `Class ${value}`,
    },
    {
      key: 'paymentStatus',
      title: 'Payment Status',
      dataIndex: 'feeDetails',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
          value.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.paymentStatus}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (_, record) => (
        <Link
          to={`/student/${record.admissionNumber}`}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          View Details
        </Link>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Welcome to your school management system</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/add-student">
              <Button variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Student
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Student</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter admission number or student name to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            loading={searchLoading}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              Found {searchResults.length} students
            </h3>
            <Table
              data={searchResults}
              columns={studentColumns}
              emptyMessage="No students found"
            />
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.totalStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Paid Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paid Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.paidStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Partial Paid Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Partial Paid</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.partialPaidStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Unpaid Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unpaid Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.unpaidStudents || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.feeStats?.totalPaid || 0)}
            </div>
            <div className="text-sm text-gray-500">Total Collected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.feeStats?.totalPending || 0)}
            </div>
            <div className="text-sm text-gray-500">Pending Collection</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.feeStats?.totalFee || 0)}
            </div>
            <div className="text-sm text-gray-500">Total Fee</div>
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Students</h3>
          <Link to="/students" className="text-sm text-blue-600 hover:text-blue-900">
            View all
          </Link>
        </div>
        <Table
          data={students.slice(0, 5)}
          columns={studentColumns}
          emptyMessage="No students found"
        />
      </div>
    </div>
  );
};

export default Dashboard;
