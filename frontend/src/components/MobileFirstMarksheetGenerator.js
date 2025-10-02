import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marksheetsAPI, studentsAPI } from '../services/enhanced-api';
import LoadingSpinner from './LoadingSpinner';
import Input from './Input';

const MobileFirstMarksheetGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState('Half-Yearly');
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [subjects, setSubjects] = useState([
    { name: 'HINDI COURSE A', code: '002', maxMarks: 100 },
    { name: 'ENGLISH LAN & LIT', code: '184', maxMarks: 100 },
    { name: 'MATHEMATICS', code: '241', maxMarks: 100 },
    { name: 'SCIENCE', code: '086', maxMarks: 100 },
    { name: 'SOCIAL SCIENCE', code: '084', maxMarks: 100 }
  ]);
  const [marksData, setMarksData] = useState({});
  const [generationMode, setGenerationMode] = useState('bulk');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', maxMarks: 100 });

  // Fetch students when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Initialize marks data when students change
  useEffect(() => {
    if (students.length > 0 && generationMode === 'bulk') {
      const initialMarksData = {};
      students.forEach(student => {
        const studentId = student._id || student.admissionNumber;
        initialMarksData[studentId] = {};
        subjects.forEach(subject => {
          initialMarksData[studentId][subject.name] = {
            ut1: 0,
            ut2: 0,
            halfYearly: 0,
            total: 0,
            maxMarks: subject.maxMarks
          };
        });
      });
      setMarksData(initialMarksData);
    }
  }, [students, subjects, generationMode]);

  const fetchStudentsByClass = async (className) => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      const allStudents = response.students || response;
      const classStudents = allStudents.filter(student => student.currentClass === className);
      setStudents(classStudents);
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, subjectName, markType, value) => {
    const numValue = parseFloat(value) || 0;
    
    setMarksData(prev => {
      const newData = { ...prev };
      if (!newData[studentId]) {
        newData[studentId] = {};
      }
      if (!newData[studentId][subjectName]) {
        newData[studentId][subjectName] = { ut1: 0, ut2: 0, halfYearly: 0, total: 0, maxMarks: 100 };
      }
      
      newData[studentId][subjectName][markType] = numValue;
      
      // Calculate total
      const subject = newData[studentId][subjectName];
      subject.total = subject.ut1 + subject.ut2 + subject.halfYearly;
      
      return newData;
    });
  };

  const handleIndividualMarkChange = (subjectName, markType, value) => {
    const numValue = parseFloat(value) || 0;
    
    setMarksData(prev => {
      const newData = { ...prev };
      if (!newData[selectedStudent]) {
        newData[selectedStudent] = {};
      }
      if (!newData[selectedStudent][subjectName]) {
        newData[selectedStudent][subjectName] = { ut1: 0, ut2: 0, halfYearly: 0, total: 0, maxMarks: 100 };
      }
      
      newData[selectedStudent][subjectName][markType] = numValue;
      
      // Calculate total
      const subject = newData[selectedStudent][subjectName];
      subject.total = subject.ut1 + subject.ut2 + subject.halfYearly;
      
      return newData;
    });
  };

  const addSubject = () => {
    if (newSubject.name && newSubject.code) {
      setSubjects(prev => [...prev, { ...newSubject, maxMarks: parseFloat(newSubject.maxMarks) || 100 }]);
      setNewSubject({ name: '', code: '', maxMarks: 100 });
      setShowAddSubject(false);
    }
  };

  const removeSubject = (index) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const generateMarksheets = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (generationMode === 'bulk') {
        // Generate marksheets for all students
        const marksheetPromises = students.map(async (student) => {
          const studentId = student._id || student.admissionNumber;
          const studentMarks = marksData[studentId] || {};
          
          const processedSubjects = subjects.map(subject => {
            const marks = studentMarks[subject.name] || { ut1: 0, ut2: 0, halfYearly: 0, total: 0, maxMarks: subject.maxMarks };
            return {
              name: subject.name,
              code: subject.code,
              ut1: marks.ut1,
              ut2: marks.ut2,
              halfYearly: marks.halfYearly,
              total: marks.total,
              maxMarks: subject.maxMarks
            };
          });

          const marksheetData = {
            rollNumber: student.admissionNumber,
            studentName: student.studentName,
            fatherName: student.fatherName,
            motherName: student.motherName,
            dob: student.dob,
            currentClass: student.currentClass,
            bloodGroup: student.bloodGroup,
            address: student.address,
            phoneNumber: student.phoneNumber,
            photo: student.photo,
            examType,
            academicYear,
            subjects: processedSubjects,
            totalDays: 105,
            daysPresent: 95
          };

          return marksheetsAPI.create(marksheetData);
        });

        await Promise.all(marksheetPromises);
        setSuccess(`Successfully generated ${students.length} marksheets!`);
        
      } else {
        // Generate marksheet for individual student
        const student = students.find(s => (s._id || s.admissionNumber) === selectedStudent);
        if (!student) {
          throw new Error('Selected student not found');
        }

        const studentMarks = marksData[selectedStudent] || {};
        
        const processedSubjects = subjects.map(subject => {
          const marks = studentMarks[subject.name] || { ut1: 0, ut2: 0, halfYearly: 0, total: 0, maxMarks: subject.maxMarks };
          return {
            name: subject.name,
            code: subject.code,
            ut1: marks.ut1,
            ut2: marks.ut2,
            halfYearly: marks.halfYearly,
            total: marks.total,
            maxMarks: subject.maxMarks
          };
        });

        const marksheetData = {
          rollNumber: student.admissionNumber,
          studentName: student.studentName,
          fatherName: student.fatherName,
          motherName: student.motherName,
          dob: student.dob,
          currentClass: student.currentClass,
          bloodGroup: student.bloodGroup,
          address: student.address,
          phoneNumber: student.phoneNumber,
          photo: student.photo,
          examType,
          academicYear,
          subjects: processedSubjects,
          totalDays: 105,
          daysPresent: 95
        };

        await marksheetsAPI.create(marksheetData);
        setSuccess('Marksheet generated successfully!');
      }

      // Navigate to marksheets list after successful generation
      setTimeout(() => {
        navigate('/marksheets');
      }, 2000);

    } catch (err) {
      setError('Failed to generate marksheets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate Marksheets</h1>
          <p className="text-gray-600">Create marksheets for students with their exam results</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select Class</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade.toString()}>Class {grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                  >
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annual">Annual</option>
                    <option value="Unit Test 1">Unit Test 1</option>
                    <option value="Unit Test 2">Unit Test 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <Input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025-26"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation Mode
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="generationMode"
                        value="bulk"
                        checked={generationMode === 'bulk'}
                        onChange={(e) => setGenerationMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Bulk (All Students)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="generationMode"
                        value="individual"
                        checked={generationMode === 'individual'}
                        onChange={(e) => setGenerationMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Individual</span>
                    </label>
                  </div>
                </div>

                {generationMode === 'individual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Student
                    </label>
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id || student.admissionNumber} value={student._id || student.admissionNumber}>
                          {student.studentName} ({student.admissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Subjects Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Add Subject
                </button>
              </div>

              <div className="space-y-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">
                      {subject.name} ({subject.code})
                    </span>
                    <button
                      onClick={() => removeSubject(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {showAddSubject && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Subject Name"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Subject Code"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max Marks"
                      value={newSubject.maxMarks}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, maxMarks: e.target.value }))}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={addSubject}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddSubject(false)}
                        className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Marks Entry Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Marks Entry</h2>
              
              {loading && <LoadingSpinner text="Loading students..." />}
              
              {students.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Please select a class to view students</p>
                </div>
              )}

              {students.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        {subjects.map((subject, index) => (
                          <th key={index} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {subject.name}
                            <div className="text-xs text-gray-400">({subject.code})</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => {
                        const studentId = student._id || student.admissionNumber;
                        const studentMarks = marksData[studentId] || {};
                        
                        return (
                          <tr key={studentId}>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.admissionNumber}
                              </div>
                            </td>
                            {subjects.map((subject, subjectIndex) => {
                              const marks = studentMarks[subject.name] || { ut1: 0, ut2: 0, halfYearly: 0, total: 0, maxMarks: subject.maxMarks };
                              
                              return (
                                <td key={subjectIndex} className="px-3 py-4">
                                  <div className="space-y-2">
                                    <div className="flex space-x-1">
                                      <Input
                                        type="number"
                                        placeholder="UT1"
                                        value={marks.ut1}
                                        onChange={(e) => handleMarkChange(studentId, subject.name, 'ut1', e.target.value)}
                                        className="w-16 text-center"
                                        min="0"
                                        max={subject.maxMarks}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="UT2"
                                        value={marks.ut2}
                                        onChange={(e) => handleMarkChange(studentId, subject.name, 'ut2', e.target.value)}
                                        className="w-16 text-center"
                                        min="0"
                                        max={subject.maxMarks}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="HFLY"
                                        value={marks.halfYearly}
                                        onChange={(e) => handleMarkChange(studentId, subject.name, 'halfYearly', e.target.value)}
                                        className="w-16 text-center"
                                        min="0"
                                        max={subject.maxMarks}
                                      />
                                    </div>
                                    <div className="text-xs text-center text-gray-500">
                                      Total: {marks.total}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={() => navigate('/marksheets')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={generateMarksheets}
            disabled={loading || students.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Marksheets'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFirstMarksheetGenerator;
