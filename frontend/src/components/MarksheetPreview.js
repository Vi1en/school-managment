import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const MarksheetPreview = ({ marksheetData, onBack, onSubmit, loading, isViewOnly = false }) => {
  const componentRef = useRef();

  // Debug: Log marksheet data
  console.log('MarksheetPreview received data:', marksheetData);
  console.log('Photo field:', marksheetData?.photo);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Marksheet-${marksheetData.rollNumber}-${marksheetData.studentName}`,
  });

  // Calculate totals for each subject
  const calculateSubjectTotals = () => {
    return marksheetData.subjects.map(subject => {
      // Use the pre-calculated marks from the backend
      const total = parseFloat(subject.marks) || 0;
      return { ...subject, total };
    });
  };

  const subjectsWithTotals = calculateSubjectTotals();
  const totalMarks = subjectsWithTotals.reduce((sum, subject) => sum + subject.total, 0);
  const percentage = Math.round((totalMarks / (subjectsWithTotals.length * 100)) * 100);

  // Calculate overall grade
  const getOverallGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const overallGrade = getOverallGrade(percentage);

  // Calculate individual subject grades
  const getSubjectGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '20-09-2025';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Format DOB
  const formatDOB = (dob) => {
    if (!dob) return 'Saturday, October 15, 2011';
    const d = new Date(dob);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        {!isViewOnly && (
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Form
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Print/PDF
            </button>
          </div>
        )}

        {isViewOnly && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Print/PDF
            </button>
          </div>
        )}

        {/* Marksheet - Exact SHINDE ACADEMY Format */}
        <div 
          ref={componentRef} 
          className="bg-white" 
          style={{ 
            border: '1px solid #0066cc', 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            width: '21cm',
            minHeight: '29.7cm',
            margin: '0 auto'
          }}
        >
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            {/* School Logo and Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              {/* School Logo */}
              <div style={{ 
                width: '100px', 
                height: '100px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/image.png" 
                  alt="SHINDE ACADEMY Logo" 
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    console.log('Logo failed to load, using fallback');
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ 
                  display: 'none',
                  width: '100px', 
                  height: '100px', 
                  border: '4px solid #003366', 
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  textAlign: 'center',
                  lineHeight: '100px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#003366'
                }}>
                  SA
                </div>
              </div>
              
              {/* School Information */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#003366', 
                  margin: '0 0 10px 0',
                  letterSpacing: '1px'
                }}>
                  SHINDE ACADEMY
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#006600', 
                  margin: '0 0 8px 0',
                  fontWeight: '500'
                }}>
                  DUNCAN ROAD, TUMARIYATOLA, RAXAUL, BIHAR
                </p>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#000', 
                  margin: '0 0 8px 0',
                  fontWeight: '500'
                }}>
                  SESSION 2025-26
                </p>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#006600', 
                  margin: '0',
                  fontWeight: '500'
                }}>
                  REPORT CARD OF {marksheetData.examType.toUpperCase()} EXAMINATION
                </p>
              </div>
              
              {/* Spacer for right alignment */}
              <div style={{ width: '100px', flexShrink: 0 }}></div>
            </div>
          </div>

          {/* Student Details Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '30px',
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>ROLL NO.:</span>
                <span style={{ marginLeft: '10px' }}>{marksheetData.rollNumber}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>STUDENT'S NAME:</span>
                <span style={{ marginLeft: '10px' }}>{marksheetData.studentName}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>CLASS:</span>
                <span style={{ marginLeft: '10px' }}>{marksheetData.class}th</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>FATHER'S NAME:</span>
                <span style={{ marginLeft: '10px' }}>{marksheetData.fatherName}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>DOB:</span>
                <span style={{ marginLeft: '10px' }}>{formatDOB(marksheetData.dob)}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>BLOOD GROUP:</span>
                <span style={{ marginLeft: '10px' }}>{marksheetData.bloodGroup}</span>
              </div>
            </div>
            <div style={{ 
              width: '120px', 
              height: '150px', 
              border: '1px solid #000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              {marksheetData.photo ? (
                <img
                  src={marksheetData.photo}
                  alt=""
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    console.log('Student photo failed to load:', marksheetData.photo);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <span style={{ color: '#666', fontSize: '12px' }}>Student Photo</span>
              )}
              <span style={{ 
                display: 'none', 
                color: '#666', 
                fontSize: '12px' 
              }}>
                Photo not available
              </span>
            </div>
          </div>

          {/* Marks Table */}
          <div style={{ marginBottom: '30px' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              border: '1px solid #000' 
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '8px', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    backgroundColor: '#e0e0e0'
                  }}>
                    Subjects with code
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>MARKS OBTAINED</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>MAX MARKS</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>TOTAL</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>GRADE</th>
                </tr>
              </thead>
              <tbody>
                {subjectsWithTotals.map((subject, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>
                      {subject.name} ({subject.code})
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subject.marks}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subject.maxMarks}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{subject.total}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                      {getSubjectGrade(subject.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Summary Section */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div style={{ 
              flex: 1, 
              border: '1px solid #000', 
              padding: '15px' 
            }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>RESULT:</span>
                <span style={{ float: 'right', fontWeight: 'bold' }}>{marksheetData.promotionStatus}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>NO. of School days:</span>
                <span style={{ float: 'right' }}>{marksheetData.attendance?.totalDays || 105}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>NO. of days Present:</span>
                <span style={{ float: 'right' }}>{marksheetData.attendance?.presentDays || 95}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>DATE:</span>
                <span style={{ float: 'right' }}>{formatDate(marksheetData.date)}</span>
              </div>
            </div>
            <div style={{ 
              flex: 1, 
              border: '1px solid #000', 
              padding: '15px' 
            }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>TOTAL MARKS:</span>
                <span style={{ float: 'right', fontWeight: 'bold' }}>{totalMarks}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>PERCENTAGE:</span>
                <span style={{ float: 'right', fontWeight: 'bold' }}>{percentage}%</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>OVERALL GRADE:</span>
                <span style={{ float: 'right', fontWeight: 'bold' }}>{overallGrade}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>RANK:</span>
                <span style={{ float: 'right', fontWeight: 'bold' }}>{marksheetData.rank || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '30px' 
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '14px' }}>Principal's Signature</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px' }}>Teacher's Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksheetPreview;