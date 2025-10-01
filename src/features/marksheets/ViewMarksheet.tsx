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
      <div className="bg-white shadow-lg print:shadow-none print:bg-white" id="marksheet-print" style={{ 
        fontFamily: 'Arial, sans-serif',
        border: '2px solid #1e40af',
        padding: '0'
      }}>
        {/* Header with Logo */}
        <div style={{ 
          padding: '20px',
          textAlign: 'center',
          borderBottom: '2px solid #1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <img 
              src="/image.png" 
              alt="School Logo" 
              style={{ 
                height: '60px', 
                width: '60px', 
                marginRight: '15px'
              }}
            />
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#1e40af',
                margin: 0,
                letterSpacing: '2px'
              }}>SHINDE ACADEMY</h1>
              <p style={{ 
                fontSize: '14px', 
                color: '#059669',
                margin: '5px 0 0 0',
                fontWeight: 'bold'
              }}>DUNCAN ROAD, TUMARIYATOLA, RAXAUL, BIHAR</p>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <p style={{ 
              fontSize: '16px', 
              color: '#059669',
              margin: '5px 0',
              fontWeight: 'bold'
            }}>SESSION 2025-26</p>
            <p style={{ 
              fontSize: '18px', 
              color: '#059669',
              margin: '5px 0',
              fontWeight: 'bold'
            }}>REPORT CARD OF HALF YEARLY EXAMINATION</p>
          </div>
        </div>

        {/* Student Information Section */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div><strong>ROLL NO.:</strong> {marksheet.rollNumber}</div>
                <div><strong>STUDENT'S NAME:</strong> {marksheet.studentName}</div>
                <div><strong>CLASS:</strong> {marksheet.currentClass}th</div>
                <div><strong>FATHER'S NAME:</strong> {marksheet.fatherName}</div>
                <div><strong>DOB:</strong> {formatDate(marksheet.dob, 'long')}</div>
                <div><strong>BLOOD GROUP:</strong> {marksheet.bloodGroup}</div>
              </div>
            </div>
            <div style={{ marginLeft: '20px' }}>
              {marksheet.photo ? (
                <img 
                  src={marksheet.photo} 
                  alt="Student Photo" 
                  style={{
                    height: '100px',
                    width: '80px',
                    objectFit: 'cover',
                    border: '2px solid #000'
                  }}
                />
              ) : (
                <div style={{
                  height: '100px',
                  width: '80px',
                  border: '2px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6'
                }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Marks Table */}
          <div style={{ marginBottom: '20px' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '12px',
              border: '2px solid #000'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'left',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0'
                  }}>Subjects with code</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0'
                  }}>UT1</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0'
                  }}>UT2</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0'
                  }}>HFLY</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0'
                  }}>TOTAL</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0'
                  }}>GRADE</th>
                </tr>
              </thead>
              <tbody>
                {marksheet.subjects.map((subject, index) => (
                  <tr key={subject.id}>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '8px',
                      fontWeight: '500'
                    }}>{subject.name} ({subject.code})</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '8px',
                      textAlign: 'center'
                    }}>{Math.floor(subject.marks * 0.1)}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '8px',
                      textAlign: 'center'
                    }}>{Math.floor(subject.marks * 0.1)}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '8px',
                      textAlign: 'center'
                    }}>{Math.floor(subject.marks * 0.8)}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>{subject.marks}</td>
                    <td style={{ 
                      border: '1px solid #000', 
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>{subject.marks >= 90 ? 'A+' : subject.marks >= 80 ? 'A' : subject.marks >= 70 ? 'B' : subject.marks >= 60 ? 'C' : subject.marks >= 50 ? 'D' : 'F'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{ 
              border: '1px solid #000', 
              padding: '10px',
              width: '48%',
              fontSize: '12px'
            }}>
              <div><strong>RESULT:</strong> {marksheet.promotionStatus}</div>
              <div><strong>NO.of School days:</strong> 105</div>
              <div><strong>NO.of days Present:</strong> 95</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('dd-MM-yyyy')}</div>
            </div>
            <div style={{ 
              border: '1px solid #000', 
              padding: '10px',
              width: '48%',
              fontSize: '12px'
            }}>
              <div><strong>TOTAL MARKS:</strong> {marksheet.totalMarks}</div>
              <div><strong>PERCENTAGE:</strong> {formatPercentage(marksheet.percentage)}</div>
              <div><strong>OVERALL GRADE:</strong> {marksheet.percentage >= 90 ? 'A+' : marksheet.percentage >= 80 ? 'A' : marksheet.percentage >= 70 ? 'B' : marksheet.percentage >= 60 ? 'C' : marksheet.percentage >= 50 ? 'D' : 'F'}</div>
              <div><strong>RANK:</strong> {marksheet.rank ? `${marksheet.rank}th` : 'N/A'}</div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '30px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '5px' }}></div>
              <div>Principal's Signature</div>
            </div>
            <div>
              <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '5px' }}></div>
              <div>Teacher's Signature</div>
            </div>
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
