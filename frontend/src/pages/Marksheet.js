import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marksheetAPI } from '../services/api';

const Marksheet = () => {
  const { admissionNumber, type } = useParams();
  const navigate = useNavigate();
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarksheet();
  }, [admissionNumber, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMarksheet = async () => {
    try {
      let response;
      if (type === 'half-yearly') {
        response = await marksheetAPI.getHalfYearly(admissionNumber);
      } else if (type === 'annual') {
        response = await marksheetAPI.getAnnual(admissionNumber);
      } else {
        response = await marksheetAPI.generate(admissionNumber);
      }
      console.log('Marksheet data:', response.data);
      console.log('Student photo:', response.data?.student?.photo);
      setMarksheet(response.data);
    } catch (err) {
      setError('Error generating marksheet');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600';
      case 'B+':
      case 'B':
        return 'text-blue-600';
      case 'C+':
      case 'C':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating marksheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Print Button */}
        <div className="mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-4"
          >
            Print Marksheet
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>

        {/* Marksheet */}
        <div className="bg-white shadow-lg overflow-hidden print:shadow-none border-4 border-blue-600" style={{ width: '21cm', minHeight: '29.7cm', margin: '0 auto' }}>
          {/* Header with School Logo and Name */}
          <div className="bg-blue-600 text-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* School Logo Placeholder */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">SA</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold">SHINDE ACADEMY</h1>
                  <p className="text-green-300 text-xs">DUNCAN ROAD, TUMARIYATOLA, RAXAUL, BIHAR</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs">SESSION {marksheet?.academicYear}-{marksheet?.academicYear + 1}</p>
                <p className="text-xs font-semibold text-green-300">REPORT CARD OF {marksheet?.marksheetType?.toUpperCase()} EXAMINATION</p>
              </div>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex justify-between items-start">
              {/* Left Side - Student Details */}
              <div className="flex-1 pr-4">
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold">ROLL NO.:</span> {marksheet?.student.admissionNumber}</p>
                  <p><span className="font-semibold">STUDENT'S NAME:</span> {marksheet?.student.name}</p>
                  <p><span className="font-semibold">CLASS:</span> {marksheet?.student.currentClass}th</p>
                  <p><span className="font-semibold">FATHER'S NAME:</span> {marksheet?.student.fatherName}</p>
                  <p><span className="font-semibold">DOB:</span> {new Date(marksheet?.student.dob).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><span className="font-semibold">BLOOD GROUP:</span> O</p>
                </div>
              </div>
              
              {/* Right Side - Student Photo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-20 border-2 border-blue-600 bg-white flex items-center justify-center relative overflow-hidden">
                  {marksheet?.student.photo ? (
                    <>
                      <img
                        className="w-16 h-20 object-cover"
                        src={marksheet.student.photo}
                        alt={marksheet.student.name}
                        style={{ maxWidth: '64px', maxHeight: '80px', width: '64px', height: '80px' }}
                        onError={(e) => {
                          console.log('Image load error:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully:', e.target.src);
                          e.target.style.display = 'block';
                          e.target.nextSibling.style.display = 'none';
                        }}
                      />
                      <div 
                        className="w-16 h-20 flex items-center justify-center absolute inset-0 bg-gray-100"
                        style={{ display: 'none' }}
                      >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-16 h-20 flex items-center justify-center bg-gray-100">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subject-wise Marks Table */}
          <div className="p-3 border-b border-gray-300">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 text-center">Subjects with code</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-400">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      SUBJECTS
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-center text-xs font-semibold text-gray-700">
                      UT1
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-center text-xs font-semibold text-gray-700">
                      UT2
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-center text-xs font-semibold text-gray-700">
                      {type === 'half-yearly' ? 'HFLY' : 'ANNUAL'}
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-center text-xs font-semibold text-gray-700">
                      TOTAL
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-center text-xs font-semibold text-gray-700">
                      GRADE
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {type === 'half-yearly' ? (
                    <>
                      <tr>
                        <td className="border border-gray-400 px-2 py-1 text-xs font-medium text-gray-900">
                          HINDI COURSE A (002)
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          2
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          7
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          31
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          40
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          C
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-2 py-1 text-xs font-medium text-gray-900">
                          ENGLISH LAN & LIT (184)
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          7
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          6
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          32
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          45
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          D
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-2 py-1 text-xs font-medium text-gray-900">
                          MATHEMATICS (241)
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          2
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          4
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          22
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          28
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          F
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-2 py-1 text-xs font-medium text-gray-900">
                          SCIENCE (086)
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          2
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          4
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          20
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          26
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          F
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-2 py-1 text-xs font-medium text-gray-900">
                          SOCIAL SCIENCE (084)
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          4
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          4
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          5
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          13
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs text-gray-900">
                          F
                        </td>
                      </tr>
                    </>
                  ) : type === 'annual' ? (
                    <>
                      <tr>
                        <td className="border border-gray-400 px-4 py-2 text-sm font-medium text-gray-900">
                          HINDI COURSE A (002)
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          {marksheet?.marks.unitTest3.obtained}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          {marksheet?.marks.unitTest4.obtained}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          {marksheet?.marks.annual.obtained}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          {marksheet?.marks.total.obtained}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          {marksheet?.result.grade}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-4 py-2 text-sm font-medium text-gray-900">
                          ENGLISH LAN & LIT (184)
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-4 py-2 text-sm font-medium text-gray-900">
                          MATHEMATICS (241)
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-4 py-2 text-sm font-medium text-gray-900">
                          SCIENCE (086)
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-4 py-2 text-sm font-medium text-gray-900">
                          SOCIAL SCIENCE (084)
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center text-sm text-gray-900">
                          -
                        </td>
                      </tr>
                    </>
                  ) : (
                    // Legacy marksheet format
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Unit Test
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet?.examResults.unitTest.marks}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getGradeColor(marksheet?.examResults.unitTest.grade)}`}>
                          {marksheet?.examResults.unitTest.grade}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Half Yearly
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet?.examResults.halfYearly.marks}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getGradeColor(marksheet?.examResults.halfYearly.grade)}`}>
                          {marksheet?.examResults.halfYearly.grade}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Annual Exam
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet?.examResults.annualExam.marks}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getGradeColor(marksheet?.examResults.annualExam.grade)}`}>
                          {marksheet?.examResults.annualExam.grade}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {type === 'half-yearly' || type === 'annual' 
                        ? `${marksheet?.marks?.total?.obtained || 0} / ${marksheet?.marks?.total?.outOf || 0}`
                        : marksheet?.examResults?.average?.marks ? marksheet.examResults.average.marks.toFixed(2) : 'N/A'
                      }
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      type === 'half-yearly' || type === 'annual' 
                        ? getGradeColor(marksheet?.result?.grade)
                        : getGradeColor(marksheet?.examResults?.average?.grade)
                    }`}>
                      {type === 'half-yearly' || type === 'annual' 
                        ? marksheet?.result?.grade || 'N/A'
                        : marksheet?.examResults?.average?.grade || 'N/A'
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Result Summary and Attendance */}
          <div className="p-3 border-b border-gray-300">
            <div className="flex justify-between items-start">
              {/* Left Side - Result and Attendance */}
              <div className="flex-1 pr-3">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-1">RESULT:</h3>
                  <p className="text-xs font-bold text-red-600">Not Promoted</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p><span className="font-semibold">NO. of School days:</span> 105</p>
                    <p><span className="font-semibold">NO. of days Present:</span> 95</p>
                    <p><span className="font-semibold">DATE:</span> 20-09-2025</p>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Summary of Marks */}
              <div className="flex-shrink-0">
                <div className="bg-white p-2 border border-gray-400 w-36">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2 text-center">Summary of Marks</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold">TOTAL MARKS:</span>
                      <span>152</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">PERCENTAGE:</span>
                      <span>30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">OVERALL GRADE:</span>
                      <span className="font-bold">D</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">RANK:</span>
                      <span>24th</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="p-3">
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">Principal's Signature</p>
                <div className="mt-4 w-24 h-8 border-b border-gray-400 mx-auto"></div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">Class Teacher's Signature</p>
                <div className="mt-4 w-24 h-8 border-b border-gray-400 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marksheet;
