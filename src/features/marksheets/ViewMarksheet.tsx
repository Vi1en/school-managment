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
      <div className="bg-white shadow-lg print:shadow-none print:bg-white" id="marksheet-print" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header with Logo */}
        <div style={{ 
          borderBottom: '4px solid #1e40af', 
          padding: '20px',
          backgroundColor: '#f8fafc'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/image.png" 
                alt="School Logo" 
                style={{ 
                  height: '60px', 
                  width: '60px', 
                  marginRight: '15px',
                  marginLeft: '-5px'
                }}
              />
              <div>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1e40af',
                  margin: 0,
                  letterSpacing: '1px'
                }}>SHINDE ACADEMY</h1>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#64748b',
                  margin: '2px 0 0 0'
                }}>Academic Excellence Since 1995</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#1f2937',
                margin: 0
              }}>REPORT CARD</h2>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b',
                margin: '2px 0 0 0'
              }}>{marksheet.academicYear}</p>
            </div>
          </div>
        </div>

        {/* Student Information Section */}
        <div style={{ padding: '20px' }}>
          <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                fontSize: '13px'
              }}>
                <div><strong>Student Name:</strong> {marksheet.studentName}</div>
                <div><strong>Roll Number:</strong> {marksheet.rollNumber}</div>
                <div><strong>Father's Name:</strong> {marksheet.fatherName}</div>
                <div><strong>Class:</strong> {marksheet.currentClass}</div>
                <div><strong>Mother's Name:</strong> {marksheet.motherName}</div>
                <div><strong>Blood Group:</strong> {marksheet.bloodGroup}</div>
                <div><strong>Date of Birth:</strong> {formatDate(marksheet.dob, 'short')}</div>
                <div><strong>Exam Type:</strong> {marksheet.examType}</div>
              </div>
            </div>
            <div style={{ marginLeft: '20px' }}>
              {marksheet.photo ? (
                <img 
                  src={marksheet.photo} 
                  alt="Student Photo" 
                  style={{
                    height: '80px',
                    width: '70px',
                    objectFit: 'cover',
                    border: '2px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <div style={{
                  height: '80px',
                  width: '70px',
                  border: '2px solid #d1d5db',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6'
                }}>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Marks Table */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              textAlign: 'center',
              marginBottom: '15px',
              color: '#1f2937'
            }}>ACADEMIC PERFORMANCE</h3>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '12px',
              border: '1px solid #374151'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '8px', 
                    textAlign: 'left',
                    fontWeight: 'bold',
                    backgroundColor: '#d1d5db'
                  }}>SUBJECT</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#d1d5db'
                  }}>CODE</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#d1d5db'
                  }}>MARKS OBTAINED</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#d1d5db'
                  }}>MAX MARKS</th>
                </tr>
              </thead>
              <tbody>
                {marksheet.subjects.map((subject, index) => (
                  <tr key={subject.id} style={{ 
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff'
                  }}>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '8px',
                      fontWeight: '500'
                    }}>{subject.name}</td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '8px',
                      textAlign: 'center'
                    }}>{subject.code}</td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>{subject.marks}</td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '8px',
                      textAlign: 'center'
                    }}>{subject.maxMarks}</td>
                  </tr>
                ))}
                <tr style={{ 
                  backgroundColor: '#bfdbfe',
                  fontWeight: 'bold'
                }}>
                  <td style={{ 
                    border: '1px solid #374151', 
                    padding: '8px'
                  }} colSpan={2}>TOTAL</td>
                  <td style={{ 
                    border: '1px solid #374151', 
                    padding: '8px',
                    textAlign: 'center'
                  }}>{marksheet.totalMarks}</td>
                  <td style={{ 
                    border: '1px solid #374151', 
                    padding: '8px',
                    textAlign: 'center'
                  }}>{marksheet.maxTotalMarks}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '15px',
            marginBottom: '20px',
            fontSize: '12px'
          }}>
            <div style={{ 
              textAlign: 'center', 
              border: '1px solid #d1d5db', 
              padding: '12px',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#1e40af'
              }}>{formatPercentage(marksheet.percentage)}</div>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280',
                marginTop: '4px'
              }}>PERCENTAGE</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              border: '1px solid #d1d5db', 
              padding: '12px',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#059669'
              }}>
                {marksheet.rank ? `#${marksheet.rank}` : 'N/A'}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280',
                marginTop: '4px'
              }}>RANK</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              border: '1px solid #d1d5db', 
              padding: '12px',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: marksheet.promotionStatus === 'Promoted' ? '#059669' : '#dc2626'
              }}>
                {marksheet.promotionStatus}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280',
                marginTop: '4px'
              }}>STATUS</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '20px'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>This is a computer generated report card and does not require signature.</p>
            <p style={{ margin: 0 }}>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
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
