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
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
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
    <div className="max-w-4xl mx-auto">
      {/* Print-friendly marksheet */}
      <div className="bg-white shadow-lg print:shadow-none print:bg-white" id="marksheet-print">
        {/* Header with Logo */}
        <div className="border-b-4 border-blue-600 p-6 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/image.png" 
                alt="School Logo" 
                className="h-16 w-16 mr-4 print:h-12 print:w-12"
                style={{ marginLeft: '-8px' }}
              />
              <div>
                <h1 className="text-2xl font-bold text-blue-800 print:text-xl">SHINDE ACADEMY</h1>
                <p className="text-sm text-gray-600 print:text-xs">Academic Excellence Since 1995</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800 print:text-lg">REPORT CARD</h2>
              <p className="text-sm text-gray-600 print:text-xs">{marksheet.academicYear}</p>
            </div>
          </div>
        </div>

        {/* Student Information Section */}
        <div className="p-6 print:p-4">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm print:text-xs">
                <div>
                  <span className="font-semibold">Student Name:</span> {marksheet.studentName}
                </div>
                <div>
                  <span className="font-semibold">Roll Number:</span> {marksheet.rollNumber}
                </div>
                <div>
                  <span className="font-semibold">Father's Name:</span> {marksheet.fatherName}
                </div>
                <div>
                  <span className="font-semibold">Class:</span> {marksheet.currentClass}
                </div>
                <div>
                  <span className="font-semibold">Mother's Name:</span> {marksheet.motherName}
                </div>
                <div>
                  <span className="font-semibold">Blood Group:</span> {marksheet.bloodGroup}
                </div>
                <div>
                  <span className="font-semibold">Date of Birth:</span> {formatDate(marksheet.dob, 'short')}
                </div>
                <div>
                  <span className="font-semibold">Exam Type:</span> {marksheet.examType}
                </div>
              </div>
            </div>
            <div className="ml-6">
              {marksheet.photo ? (
                <img 
                  src={marksheet.photo} 
                  alt="Student Photo" 
                  className="h-24 w-20 object-cover border-2 border-gray-300 print:h-20 print:w-16"
                />
              ) : (
                <div className="h-24 w-20 border-2 border-gray-300 flex items-center justify-center bg-gray-100 print:h-20 print:w-16">
                  <span className="text-xs text-gray-500">Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Marks Table */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-center mb-4 print:text-base">ACADEMIC PERFORMANCE</h3>
            <table className="w-full border-collapse border border-gray-400 print:text-xs">
              <thead>
                <tr className="bg-blue-50 print:bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left font-semibold">SUBJECT</th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-semibold">CODE</th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-semibold">MARKS OBTAINED</th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-semibold">MAX MARKS</th>
                </tr>
              </thead>
              <tbody>
                {marksheet.subjects.map((subject, index) => (
                  <tr key={subject.id} className={index % 2 === 0 ? 'bg-gray-50 print:bg-white' : 'bg-white'}>
                    <td className="border border-gray-400 px-3 py-2 font-medium">{subject.name}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{subject.code}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-semibold">{subject.marks}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{subject.maxMarks}</td>
                  </tr>
                ))}
                <tr className="bg-blue-100 print:bg-gray-200 font-bold">
                  <td className="border border-gray-400 px-3 py-2" colSpan={2}>TOTAL</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{marksheet.totalMarks}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{marksheet.maxTotalMarks}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-3 gap-4 mb-6 print:text-xs">
            <div className="text-center border border-gray-300 p-3 print:p-2">
              <div className="text-lg font-bold text-blue-600 print:text-base">{formatPercentage(marksheet.percentage)}</div>
              <div className="text-sm text-gray-600">PERCENTAGE</div>
            </div>
            <div className="text-center border border-gray-300 p-3 print:p-2">
              <div className="text-lg font-bold text-green-600 print:text-base">
                {marksheet.rank ? `#${marksheet.rank}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">RANK</div>
            </div>
            <div className="text-center border border-gray-300 p-3 print:p-2">
              <div className={`text-lg font-bold print:text-base ${
                marksheet.promotionStatus === 'Promoted' ? 'text-green-600' : 'text-red-600'
              }`}>
                {marksheet.promotionStatus}
              </div>
              <div className="text-sm text-gray-600">STATUS</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 print:text-xs">
            <p>This is a computer generated report card and does not require signature.</p>
            <p className="mt-2">Generated on: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-4 print:hidden">
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
