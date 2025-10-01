import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudentsStore } from '@/store/students';
import { useUIStore } from '@/store/ui';
import { Student } from '@/types';
import { formatCurrency, getStatusColor } from '@/utils/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { TableColumn } from '@/types';

const Students: React.FC = () => {
  const { students, fetchStudents, deleteStudent, isLoading } = useStudentsStore();
  const { setError, clearError } = useUIStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.includes(searchTerm) ||
        student.currentClass.includes(searchTerm)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [students, searchTerm]);

  const handleDelete = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const result = await deleteStudent(studentId);
      if (!result.success) {
        setError(result.error || 'Failed to delete student');
      }
    }
  };

  const studentColumns: TableColumn<Student>[] = [
    {
      key: 'studentName',
      title: 'Student',
      dataIndex: 'studentName',
      render: (value, record) => (
        <div className="flex items-center">
          {record.photo ? (
            <img
              className="h-10 w-10 rounded-full mr-3"
              src={record.photo}
              alt={record.studentName}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
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
      key: 'phoneNumber',
      title: 'Phone',
      dataIndex: 'phoneNumber',
    },
    {
      key: 'feeDetails',
      title: 'Fee Status',
      dataIndex: 'feeDetails',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value.paymentStatus)}`}>
          {value.paymentStatus.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'feeDetails',
      title: 'Amount Paid',
      dataIndex: 'feeDetails',
      render: (value) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(value.amountPaid)}
          </div>
          <div className="text-sm text-gray-500">
            of {formatCurrency(value.totalFee)}
          </div>
        </div>
      ),
    },
    {
      key: 'id' as keyof Student,
      title: 'Actions',
      dataIndex: 'id' as keyof Student,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Link
            to={`/student/${record.admissionNumber}`}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </Link>
          <Link
            to={`/edit-student/${record.admissionNumber}`}
            className="text-green-600 hover:text-green-900 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(record.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage student records and information
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/add-student">
              <Button variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Student
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search students by name, admission number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          data={filteredStudents}
          columns={studentColumns}
          loading={isLoading}
          emptyMessage="No students found"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-gray-900">{students.length}</div>
          <div className="text-sm text-gray-500">Total Students</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => s.feeDetails.paymentStatus === 'paid').length}
          </div>
          <div className="text-sm text-gray-500">Paid Students</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {students.filter(s => s.feeDetails.paymentStatus === 'partial').length}
          </div>
          <div className="text-sm text-gray-500">Partial Paid</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-red-600">
            {students.filter(s => s.feeDetails.paymentStatus === 'unpaid').length}
          </div>
          <div className="text-sm text-gray-500">Unpaid Students</div>
        </div>
      </div>
    </div>
  );
};

export default Students;
