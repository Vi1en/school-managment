import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/ui';
import { Marksheet } from '@/types';
import { formatDate, formatPercentage } from '@/utils/format';
import Button from '@/components/ui/Button';

const ViewMarksheet: React.FC = () => {
  const { rollNumber } = useParams<{ rollNumber: string }>();
  const navigate = useNavigate();
  const { setError } = useUIStore();
  const [marksheet, setMarksheet] = useState<Marksheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rollNumber) {
      fetchMarksheet(rollNumber);
    }
  }, [rollNumber]);

  const fetchMarksheet = async (rollNumber: string) => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockMarksheet: Marksheet = {
        id: '1',
        rollNumber: rollNumber,
        studentName: 'John Doe',
        fatherName: 'Robert Doe',
        motherName: 'Jane Doe',
        dob: '2010-05-15',
        currentClass: '10',
        bloodGroup: 'O+',
        address: '123 Main St, City',
        phoneNumber: '1234567890',
          photo: undefined,
        examType: 'Half-Yearly',
        academicYear: '2024-25',
        subjects: [
          {
            id: '1',
            name: 'MATHEMATICS',
            code: '041',
            marks: 85,
            maxMarks: 100,
          },
          {
            id: '2',
            name: 'PHYSICS',
            code: '042',
            marks: 78,
            maxMarks: 100,
          },
          {
            id: '3',
            name: 'CHEMISTRY',
            code: '043',
            marks: 82,
            maxMarks: 100,
          },
          {
            id: '4',
            name: 'BIOLOGY',
            code: '044',
            marks: 90,
            maxMarks: 100,
          },
          {
            id: '5',
            name: 'ENGLISH',
            code: '101',
            marks: 75,
            maxMarks: 100,
          },
        ],
        totalMarks: 410,
        maxTotalMarks: 500,
        percentage: 82,
        rank: 1,
        promotionStatus: 'Promoted',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      setMarksheet(mockMarksheet);
    } catch (error) {
      setError('Failed to fetch marksheet');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marksheet...</p>
        </div>
      </div>
    );
  }

  if (!marksheet) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Marksheet Not Found</h2>
          <p className="text-gray-600 mb-6">The marksheet you're looking for doesn't exist.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/marksheets')}
          >
            Back to Marksheets
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marksheet - {marksheet.studentName}</h1>
            <p className="text-gray-600">Roll Number: {marksheet.rollNumber}</p>
            <p className="text-gray-600">Exam Type: {marksheet.examType}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="secondary"
              onClick={() => window.print()}
            >
              Print Marksheet
            </Button>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                <dd className="text-sm text-gray-900">{marksheet.studentName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
                <dd className="text-sm text-gray-900">{marksheet.fatherName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
                <dd className="text-sm text-gray-900">{marksheet.motherName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="text-sm text-gray-900">{formatDate(marksheet.dob, 'long')}</dd>
              </div>
            </dl>
          </div>
          <div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Roll Number</dt>
                <dd className="text-sm text-gray-900">{marksheet.rollNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Class</dt>
                <dd className="text-sm text-gray-900">Class {marksheet.currentClass}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
                <dd className="text-sm text-gray-900">{marksheet.bloodGroup}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Academic Year</dt>
                <dd className="text-sm text-gray-900">{marksheet.academicYear}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Marks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks Obtained
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marksheet.subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.marks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.maxMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage((subject.marks / subject.maxMarks) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{marksheet.totalMarks}</div>
            <div className="text-sm text-gray-500">Total Marks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{marksheet.maxTotalMarks}</div>
            <div className="text-sm text-gray-500">Max Marks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPercentage(marksheet.percentage)}</div>
            <div className="text-sm text-gray-500">Percentage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {marksheet.rank ? `#${marksheet.rank}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Rank</div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
            marksheet.promotionStatus === 'Promoted' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {marksheet.promotionStatus}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/marksheets')}
        >
          Back to Marksheets
        </Button>
        <Button
          variant="primary"
          onClick={() => window.print()}
        >
          Print Marksheet
        </Button>
      </div>
    </div>
  );
};

export default ViewMarksheet;
