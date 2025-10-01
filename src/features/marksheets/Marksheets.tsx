import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '@/store/ui';
import { Marksheet } from '@/types';
import { formatDate, formatPercentage } from '@/utils/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { TableColumn } from '@/types';

const Marksheets: React.FC = () => {
  const { setError } = useUIStore();
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMarksheets, setFilteredMarksheets] = useState<Marksheet[]>([]);

  useEffect(() => {
    fetchMarksheets();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = marksheets.filter(marksheet =>
        marksheet.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        marksheet.rollNumber.includes(searchTerm) ||
        marksheet.examType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMarksheets(filtered);
    } else {
      setFilteredMarksheets(marksheets);
    }
  }, [marksheets, searchTerm]);

  const fetchMarksheets = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockMarksheets: Marksheet[] = [
        {
          id: '1',
          rollNumber: '2024001',
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
          ],
          totalMarks: 163,
          maxTotalMarks: 200,
          percentage: 81.5,
          rank: 1,
          promotionStatus: 'Promoted',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      setMarksheets(mockMarksheets);
    } catch (error) {
      setError('Failed to fetch marksheets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rollNumber: string) => {
    if (window.confirm('Are you sure you want to delete this marksheet?')) {
      try {
        // Mock delete - replace with actual API call
        setMarksheets(prev => prev.filter(m => m.rollNumber !== rollNumber));
      } catch (error) {
        setError('Failed to delete marksheet');
      }
    }
  };

  const marksheetColumns: TableColumn<Marksheet>[] = [
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
            <div className="text-sm text-gray-500">{record.rollNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'examType',
      title: 'Exam Type',
      dataIndex: 'examType',
    },
    {
      key: 'academicYear',
      title: 'Academic Year',
      dataIndex: 'academicYear',
    },
    {
      key: 'percentage',
      title: 'Percentage',
      dataIndex: 'percentage',
      render: (value) => formatPercentage(value),
    },
    {
      key: 'rank',
      title: 'Rank',
      dataIndex: 'rank',
      render: (value) => value ? `#${value}` : 'N/A',
    },
    {
      key: 'promotionStatus',
      title: 'Status',
      dataIndex: 'promotionStatus',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Promoted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'id' as keyof Marksheet,
      title: 'Actions',
      dataIndex: 'id' as keyof Marksheet,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Link
            to={`/view-marksheet/${record.rollNumber}`}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </Link>
          <button
            onClick={() => handleDelete(record.rollNumber)}
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
            <h1 className="text-2xl font-bold text-gray-900">Marksheets</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage student marksheets
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/generate-marksheet">
              <Button variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate Marksheet
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
              placeholder="Search marksheets by student name, roll number, or exam type..."
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

      {/* Marksheets Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          data={filteredMarksheets}
          columns={marksheetColumns}
          loading={loading}
          emptyMessage="No marksheets found"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-gray-900">{marksheets.length}</div>
          <div className="text-sm text-gray-500">Total Marksheets</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-green-600">
            {marksheets.filter(m => m.promotionStatus === 'Promoted').length}
          </div>
          <div className="text-sm text-gray-500">Promoted Students</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-red-600">
            {marksheets.filter(m => m.promotionStatus === 'Not Promoted').length}
          </div>
          <div className="text-sm text-gray-500">Not Promoted</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-blue-600">
            {marksheets.length > 0 ? (marksheets.reduce((sum, m) => sum + m.percentage, 0) / marksheets.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-500">Average Percentage</div>
        </div>
      </div>
    </div>
  );
};

export default Marksheets;
