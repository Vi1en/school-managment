import React from 'react';

const MarksheetTemplate = ({ student, examType = 'Half-Yearly', academicYear = '2025-26' }) => {
  // Calculate grades based on marks
  const calculateGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  };

  // Calculate overall grade
  const overallGrade = calculateGrade(student.percentage);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Format DOB
  const formatDOB = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate promotion status
  const promotionStatus = student.percentage >= 40 ? 'Promoted' : 'Not Promoted';

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border-4 border-blue-600 p-6 font-sans">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        {/* Left side - Logo and School Info */}
        <div className="flex items-start">
          {/* School Logo */}
          <div className="mr-4 flex-shrink-0">
            <img 
              src="/image.png" 
              alt="School Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback logo */}
            <div 
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold hidden"
              style={{ display: 'none' }}
            >
              SA
            </div>
          </div>
          
          {/* School Details */}
          <div>
            <h1 className="text-2xl font-bold text-blue-600 mb-1 tracking-wider">
              SHINDE ACADEMY
            </h1>
            <p className="text-sm font-semibold text-green-600 mb-1 tracking-wide">
              DUNCAN ROAD, TUMARIYATOLA, RAXAUL, BIHAR
            </p>
            <p className="text-sm font-semibold text-black mb-1">
              SESSION {academicYear}
            </p>
            <p className="text-sm font-bold text-green-600 tracking-wide">
              REPORT CARD OF {examType.toUpperCase()} EXAMINATION
            </p>
          </div>
        </div>

        {/* Right side - Student Photo */}
        <div className="flex-shrink-0">
          {student.photoUrl ? (
            <img 
              src={student.photoUrl} 
              alt="Student Photo" 
              className="w-20 h-24 object-cover border border-gray-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <div className="w-20 h-24 border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              Student Photo
            </div>
          )}
          {/* Fallback for photo */}
          <div 
            className="w-20 h-24 border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-500 hidden"
            style={{ display: 'none' }}
          >
            Student Photo
          </div>
        </div>
      </div>

      {/* Student Information Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-bold w-24">Roll No.:</span>
              <span>{student.rollNo}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Student's Name:</span>
              <span className="uppercase">{student.name}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Class:</span>
              <span>{student.class}th</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-bold w-24">Father's Name:</span>
              <span className="uppercase">{student.fatherName}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">DOB:</span>
              <span>{formatDOB(student.dob)}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Blood Group:</span>
              <span>{student.bloodGroup}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-2 text-left font-bold">Subjects with code</th>
              <th className="border border-black p-2 text-center font-bold">UT1</th>
              <th className="border border-black p-2 text-center font-bold">UT2</th>
              <th className="border border-black p-2 text-center font-bold">HFLY</th>
              <th className="border border-black p-2 text-center font-bold">TOTAL</th>
              <th className="border border-black p-2 text-center font-bold">GRADE</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((subject, index) => {
              const total = subject.ut1 + subject.ut2 + subject.halfYearly;
              const grade = calculateGrade(total);
              
              return (
                <tr key={index}>
                  <td className="border border-black p-2 font-medium">
                    {subject.name} ({subject.code})
                  </td>
                  <td className="border border-black p-2 text-center">{subject.ut1}</td>
                  <td className="border border-black p-2 text-center">{subject.ut2}</td>
                  <td className="border border-black p-2 text-center">{subject.halfYearly}</td>
                  <td className="border border-black p-2 text-center font-bold">{total}</td>
                  <td className="border border-black p-2 text-center font-bold">{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="font-bold w-24">RESULT:</span>
            <span className="font-bold">{promotionStatus}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">NO.of School days:</span>
            <span>{student.totalDays}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">NO.of days Present:</span>
            <span>{student.daysPresent}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">DATE:</span>
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Right Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="font-bold w-24">TOTAL MARKS:</span>
            <span className="font-bold">{student.totalMarks}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">PERCENTAGE:</span>
            <span className="font-bold">{student.percentage}%</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">OVERALL GRADE:</span>
            <span className="font-bold">{overallGrade}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">RANK:</span>
            <span className="font-bold">{student.rank}th</span>
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="flex justify-between mt-8">
        <div className="text-center">
          <div className="border-t border-black w-32 mx-auto mb-1"></div>
          <span className="text-sm font-bold">Principal's Signature</span>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-32 mx-auto mb-1"></div>
          <span className="text-sm font-bold">Teacher's Signature</span>
        </div>
      </div>
    </div>
  );
};

export default MarksheetTemplate;
