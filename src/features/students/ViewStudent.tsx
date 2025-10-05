import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentsStore } from '@/store/students';
import { useUIStore } from '@/store/ui';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/format';
import Button from '@/components/ui/Button';

const ViewStudent: React.FC = () => {
  const { admissionNumber } = useParams<{ admissionNumber: string }>();
  const navigate = useNavigate();
  const { students, fetchStudentById } = useStudentsStore();
  const { setError } = useUIStore();

  useEffect(() => {
    if (admissionNumber) {
      fetchStudentById(admissionNumber);
    }
  }, [admissionNumber, fetchStudentById]);

  const student = students.find(s => s.admissionNumber === admissionNumber);

  const getPaymentStatus = (student: any) => {
    const { totalFee = 0, amountPaid = 0 } = student.feeDetails || {};
    if (totalFee === 0) return 'No Fee';
    if (amountPaid >= totalFee) return 'Paid';
    if (amountPaid > 0) return 'Partial';
    return 'Unpaid';
  };

  if (!student) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/students')}
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.studentName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {student.studentName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.studentName}</h1>
              <p className="text-gray-600">Admission: {student.admissionNumber}</p>
              <p className="text-gray-600">Class: {student.currentClass}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="secondary"
              onClick={() => navigate(`/edit-student/${student.admissionNumber}`)}
            >
              Edit Student
            </Button>
          </div>
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="text-sm text-gray-900">{student.studentName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
              <dd className="text-sm text-gray-900">{student.fatherName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
              <dd className="text-sm text-gray-900">{student.motherName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="text-sm text-gray-900">{formatDate(student.dob, 'long')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
              <dd className="text-sm text-gray-900">{student.bloodGroup}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="text-sm text-gray-900">{student.phoneNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="text-sm text-gray-900">{student.address}</dd>
            </div>
          </dl>
        </div>

        {/* Academic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
              <dd className="text-sm text-gray-900">{student.admissionNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Class</dt>
              <dd className="text-sm text-gray-900">Class {student.currentClass}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
              <dd className="text-sm text-gray-900">{formatDate(student.createdAt, 'short')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900">{formatDate(student.updatedAt, 'short')}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Fee Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(student.feeDetails.totalFee)}
            </div>
            <div className="text-sm text-gray-500">Total Fee</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(student.feeDetails.amountPaid)}
            </div>
            <div className="text-sm text-gray-500">Amount Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(student.feeDetails.remainingAmount)}
            </div>
            <div className="text-sm text-gray-500">Remaining Amount</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-center">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(getPaymentStatus(student))}`}>
              {getPaymentStatus(student).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/students')}
        >
          Back to Students
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/edit-student/${student.admissionNumber}`)}
        >
          Edit Student
        </Button>
      </div>
    </div>
  );
};

export default ViewStudent;
