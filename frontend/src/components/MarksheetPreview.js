import React from 'react';

const MarksheetPreview = ({ marksheetData, onClose, onPrint }) => {
  if (!marksheetData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Data</h2>
          <p className="text-gray-600 mb-4">No marksheet data available for preview.</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const calculateGrade = (totalMarks, maxMarks) => {
    if (maxMarks === 0) return 'N/A';
    const percentage = (totalMarks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const totalOverallMarks = marksheetData.subjects?.reduce((sum, subject) => sum + (subject.total || 0), 0) || 0;
  const maxOverallMarks = marksheetData.subjects?.reduce((sum, subject) => sum + (subject.maxMarks || 100), 0) || 0;
  const overallPercentage = maxOverallMarks > 0 ? (totalOverallMarks / maxOverallMarks) * 100 : 0;
  const overallGrade = calculateGrade(totalOverallMarks, maxOverallMarks);
  const promotionStatus = overallPercentage >= 40 ? 'Promoted' : 'Not Promoted';

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).replace(/\//g, '-');

  const dobFormatted = marksheetData.dob ? 
    new Date(marksheetData.dob).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Marksheet Preview</h2>
          <div className="flex space-x-2">
            <button
              onClick={onPrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Print Marksheet
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Close Preview
            </button>
          </div>
        </div>

        {/* Marksheet Content */}
        <div className="p-6">
          <div className="marksheet-container border-4 border-blue-800 bg-white shadow-lg mx-auto max-w-4xl">
            {/* Header */}
            <div className="header flex items-center justify-between mb-6 border-b-2 border-gray-300 pb-4">
              <div className="flex items-center">
                <img 
                  src="/image.png" 
                  alt="SHINDE ACADEMY Logo" 
                  className="w-24 h-24 object-contain mr-4"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="text-center">
                  <h1 className="text-4xl font-extrabold text-blue-800 tracking-wide">SHINDE ACADEMY</h1>
                  <p className="text-lg font-semibold text-green-700 mt-1 uppercase">DUNCAN ROAD, TUMARIYATOLA, RAXAUL, BIHAR</p>
                </div>
              </div>
              <div className="text-right">
                {marksheetData.photo ? (
                  <img 
                    src={marksheetData.photo} 
                    alt="Student" 
                    className="w-24 h-24 object-cover border-2 border-gray-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-xs border-2 border-gray-300">
                    No Photo
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-bold text-gray-800">SESSION {marksheetData.academicYear || '2025-26'}</p>
              <h2 className="text-xl font-bold text-green-700 uppercase mt-1">REPORT CARD OF {marksheetData.examType || 'HALF YEARLY'} EXAMINATION</h2>
            </div>

            {/* Student Details */}
            <div className="student-details grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-gray-800">
              <div><span className="font-semibold">Roll No.:</span> {marksheetData.rollNumber}</div>
              <div><span className="font-semibold">Student's Name:</span> {marksheetData.studentName}</div>
              <div><span className="font-semibold">Class:</span> {marksheetData.currentClass}</div>
              <div><span className="font-semibold">Father's Name:</span> {marksheetData.fatherName}</div>
              <div><span className="font-semibold">DOB:</span> {dobFormatted}</div>
              <div><span className="font-semibold">Blood Group:</span> {marksheetData.bloodGroup || 'N/A'}</div>
            </div>

            {/* Marks Table */}
            <table className="marks-table w-full border-collapse border border-gray-800 mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 p-2 text-left text-sm font-bold">Subjects with code</th>
                  <th className="border border-gray-800 p-2 text-center text-sm font-bold">UT1</th>
                  <th className="border border-gray-800 p-2 text-center text-sm font-bold">UT2</th>
                  <th className="border border-gray-800 p-2 text-center text-sm font-bold">HFLY</th>
                  <th className="border border-gray-800 p-2 text-center text-sm font-bold">TOTAL</th>
                  <th className="border border-gray-800 p-2 text-center text-sm font-bold">GRADE</th>
                </tr>
              </thead>
              <tbody>
                {marksheetData.subjects?.map((subject, index) => (
                  <tr key={index}>
                    <td className="border border-gray-800 p-2 text-sm">{subject.name} ({subject.code})</td>
                    <td className="border border-gray-800 p-2 text-center text-sm">{subject.ut1 || 0}</td>
                    <td className="border border-gray-800 p-2 text-center text-sm">{subject.ut2 || 0}</td>
                    <td className="border border-gray-800 p-2 text-center text-sm">{subject.halfYearly || 0}</td>
                    <td className="border border-gray-800 p-2 text-center text-sm">{subject.total || 0}</td>
                    <td className="border border-gray-800 p-2 text-center text-sm">{calculateGrade(subject.total || 0, subject.maxMarks || 100)}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="6" className="border border-gray-800 p-4 text-center text-gray-500">
                      No subjects data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="summary grid grid-cols-2 gap-x-8 mb-6 text-gray-800">
              <div>
                <p className="mb-1"><span className="font-bold">RESULT:</span> {promotionStatus}</p>
                <p className="mb-1"><span className="font-semibold">NO.of School days:</span> {marksheetData.totalDays || 'N/A'}</p>
                <p className="mb-1"><span className="font-semibold">NO.of days Present:</span> {marksheetData.daysPresent || 'N/A'}</p>
                <p className="mb-1"><span className="font-semibold">DATE:</span> {currentDate}</p>
              </div>
              <div className="text-right">
                <p className="mb-1"><span className="font-semibold">TOTAL MARKS:</span> {totalOverallMarks}</p>
                <p className="mb-1"><span className="font-semibold">PERCENTAGE:</span> {overallPercentage.toFixed(0)}%</p>
                <p className="mb-1"><span className="font-semibold">OVERALL GRADE:</span> {overallGrade}</p>
                <p className="mb-1"><span className="font-semibold">RANK:</span> {marksheetData.rank || 'N/A'}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="signatures flex justify-between mt-12 text-gray-800">
              <div className="text-center border-t border-gray-800 pt-2 w-1/3">
                <p className="font-semibold">Principal's Signature</p>
              </div>
              <div className="text-center border-t border-gray-800 pt-2 w-1/3">
                <p className="font-semibold">Teacher's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksheetPreview;