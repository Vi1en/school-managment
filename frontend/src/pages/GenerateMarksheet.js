import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marksheetsAPI, studentsAPI } from '../services/api';

const GenerateMarksheet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState('Half-Yearly');
  const [subjects, setSubjects] = useState([
    { name: 'HINDI COURSE A', code: '002' },
    { name: 'ENGLISH LAN & LIT', code: '184' },
    { name: 'MATHEMATICS', code: '241' },
    { name: 'SCIENCE', code: '086' },
    { name: 'SOCIAL SCIENCE', code: '084' }
  ]);
  const [currentSubject, setCurrentSubject] = useState(0);
  const [marksData, setMarksData] = useState({});
  const [studentSettings, setStudentSettings] = useState({});
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubjectData, setEditSubjectData] = useState({ name: '', code: '' });
  
  const [formData, setFormData] = useState({
    academicYear: '2025-26'
  });
  const [generationMode, setGenerationMode] = useState('bulk'); // 'bulk' or 'individual'
  const [selectedStudent, setSelectedStudent] = useState('');
  const [individualMarksData, setIndividualMarksData] = useState({});
  const [individualStudentSettings, setIndividualStudentSettings] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchStudentsByClass = async (className) => {
    try {
      const response = await studentsAPI.getAll();
      const allStudents = response.data.students || response.data;
      const classStudents = allStudents.filter(student => student.currentClass === className);
      setStudents(classStudents);
    } catch (err) {
      setError('Error fetching students');
      console.error('Error fetching students:', err);
    }
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    if (className) {
      fetchStudentsByClass(className);
    } else {
      setStudents([]);
    }
  };

  const handleMarkChange = (studentId, markType, value) => {
    console.log('handleMarkChange called:', { studentId, markType, value, currentSubject: subjects[currentSubject]?.name });
    setMarksData(prev => {
      const newData = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subjects[currentSubject]?.name]: {
            ...prev[studentId]?.[subjects[currentSubject]?.name],
            [markType]: parseInt(value) || 0
          }
        }
      };
      console.log('Updated marksData:', newData);
      return newData;
    });
  };

  const handleStudentSettingChange = (studentId, settingType, value) => {
    setStudentSettings(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [settingType]: value
      }
    }));
  };

  const handleIndividualMarkChange = (markType, value) => {
    console.log('handleIndividualMarkChange called:', { markType, value, currentSubject: subjects[currentSubject]?.name });
    setIndividualMarksData(prev => {
      const newData = {
        ...prev,
        [subjects[currentSubject]?.name]: {
          ...prev[subjects[currentSubject]?.name],
          [markType]: parseInt(value) || 0
        }
      };
      console.log('Updated individualMarksData:', newData);
      return newData;
    });
  };

  const handleIndividualStudentSettingChange = (settingType, value) => {
    setIndividualStudentSettings(prev => ({
      ...prev,
      [settingType]: value
    }));
  };

  // Reset marks data when class or exam type changes
  useEffect(() => {
    setMarksData({});
    setStudentSettings({});
    setIndividualMarksData({});
    setIndividualStudentSettings({});
    setSelectedStudent('');
  }, [selectedClass, examType, generationMode]);

  const nextSubject = () => {
    if (currentSubject < subjects.length - 1) {
      setCurrentSubject(currentSubject + 1);
    }
  };

  const prevSubject = () => {
    if (currentSubject > 0) {
      setCurrentSubject(currentSubject - 1);
    }
  };

  const addSubject = () => {
    if (newSubject.name.trim() && newSubject.code.trim()) {
      setSubjects(prev => [...prev, { ...newSubject }]);
      setNewSubject({ name: '', code: '' });
      setShowAddSubject(false);
    }
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(prev => prev.filter((_, i) => i !== index));
      if (currentSubject >= index && currentSubject > 0) {
        setCurrentSubject(currentSubject - 1);
      } else if (currentSubject >= subjects.length - 1) {
        setCurrentSubject(subjects.length - 2);
      }
    }
  };

  const startEditingSubject = (index) => {
    setEditingSubject(index);
    setEditSubjectData({ name: subjects[index].name, code: subjects[index].code });
  };

  const saveSubjectEdit = () => {
    if (editSubjectData.name.trim() && editSubjectData.code.trim()) {
      setSubjects(prev => prev.map((subject, index) => 
        index === editingSubject 
          ? { name: editSubjectData.name, code: editSubjectData.code }
          : subject
      ));
      setEditingSubject(null);
      setEditSubjectData({ name: '', code: '' });
    }
  };

  const cancelSubjectEdit = () => {
    setEditingSubject(null);
    setEditSubjectData({ name: '', code: '' });
  };


  const generateMarksheets = async () => {
    if (generationMode === 'bulk') {
      if (!selectedClass || students.length === 0) {
        setError('Please select a class and ensure students are loaded');
        return;
      }

      setLoading(true);
      setError('');

      try {
        console.log('Full marksData before processing:', marksData);
        console.log('Exam type for bulk generation:', examType, 'Type:', typeof examType);
        const marksheetsToCreate = students.map(student => {
          const studentMarks = marksData[student._id] || {};
          console.log(`Student ${student.studentName} (${student._id}) marks:`, studentMarks);
          const subjectMarks = subjects.map(subject => {
            const subjectData = studentMarks[subject.name] || {};
            // Calculate total marks based on exam type
            let totalMarks = 0;
            let maxMarks = 100; // Default max marks per subject
            
            if (examType === 'Half-Yearly') {
              totalMarks = (parseFloat(subjectData.UT1) || 0) + (parseFloat(subjectData.UT2) || 0) + (parseFloat(subjectData.halfYearly) || 0);
            } else if (examType === 'Annual') {
              totalMarks = (parseFloat(subjectData.UT1) || 0) + (parseFloat(subjectData.UT2) || 0) + (parseFloat(subjectData.UT3) || 0) + (parseFloat(subjectData.UT4) || 0) + (parseFloat(subjectData.annual) || 0);
            } else {
              // For other exam types, use the marks field
              totalMarks = parseFloat(subjectData.marks) || 0;
            }
            
            console.log(`Subject: ${subject.name}, SubjectData:`, subjectData, `TotalMarks: ${totalMarks}`);
            
            return {
              name: subject.name,
              code: subject.code,
              marks: totalMarks,
              maxMarks: maxMarks
            };
          });

          return {
            rollNumber: student.admissionNumber,
            studentName: student.studentName,
            currentClass: student.currentClass,
            fatherName: student.fatherName || 'N/A',
            motherName: student.motherName || 'N/A',
            dob: new Date(student.dob).toISOString(),
            bloodGroup: student.bloodGroup || 'O+',
            address: student.address || 'N/A',
            phoneNumber: student.phoneNumber || 'N/A',
            photo: student.photo || null,
            examType: examType,
            academicYear: formData.academicYear,
            subjects: subjectMarks
          };
        });

        // Create marksheets for all students
        for (const marksheetData of marksheetsToCreate) {
          console.log('Creating marksheet for:', marksheetData.rollNumber);
          try {
            const response = await marksheetsAPI.create(marksheetData);
            console.log('Marksheet created successfully:', response.data);
          } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
              console.log(`Marksheet for ${marksheetData.rollNumber} already exists, deleting and recreating...`);
              try {
                // Delete existing marksheet
                await marksheetsAPI.delete(marksheetData.rollNumber);
                // Create new marksheet
                const response = await marksheetsAPI.create(marksheetData);
                console.log('Marksheet recreated successfully:', response.data);
              } catch (deleteErr) {
                console.error('Error deleting/recreating marksheet:', deleteErr);
                throw deleteErr;
              }
            } else {
              throw err;
            }
          }
        }

        // Show success message and navigate
        alert('Marksheets generated successfully!');
        navigate('/marksheets');
      } catch (err) {
        console.error('Error creating marksheets:', err);
        console.error('Error response data:', err.response?.data);
        console.error('Error status:', err.response?.status);
        const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Error creating marksheets';
        setError(Array.isArray(errorMessage) ? errorMessage.map(e => e.msg).join(', ') : errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Individual marksheet generation
      if (!selectedStudent) {
        setError('Please select a student');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const student = students.find(s => s._id === selectedStudent);
        if (!student) {
          setError('Selected student not found');
          return;
        }

        console.log('Individual marksData before processing:', individualMarksData);
        console.log(`Individual student ${student.studentName} marks:`, individualMarksData);
          console.log('Exam type for individual generation:', examType, 'Type:', typeof examType);

          const subjectMarks = subjects.map(subject => {
            const subjectData = individualMarksData[subject.name] || {};
            // Calculate total marks based on exam type
            let totalMarks = 0;
            let maxMarks = 100; // Default max marks per subject
            
            if (examType === 'Half-Yearly') {
              const ut1 = parseFloat(subjectData.UT1) || 0;
              const ut2 = parseFloat(subjectData.UT2) || 0;
              const halfYearly = parseFloat(subjectData.halfYearly) || 0;
              totalMarks = ut1 + ut2 + halfYearly;
              console.log(`Individual Half-Yearly calculation for ${subject.name}: UT1=${ut1}, UT2=${ut2}, halfYearly=${halfYearly}, total=${totalMarks}`);
            } else if (examType === 'Annual') {
              const ut1 = parseFloat(subjectData.UT1) || 0;
              const ut2 = parseFloat(subjectData.UT2) || 0;
              const ut3 = parseFloat(subjectData.UT3) || 0;
              const ut4 = parseFloat(subjectData.UT4) || 0;
              const annual = parseFloat(subjectData.annual) || 0;
              totalMarks = ut1 + ut2 + ut3 + ut4 + annual;
              console.log(`Individual Annual calculation for ${subject.name}: UT1=${ut1}, UT2=${ut2}, UT3=${ut3}, UT4=${ut4}, annual=${annual}, total=${totalMarks}`);
            } else {
              // For other exam types, use the marks field
              totalMarks = parseFloat(subjectData.marks) || 0;
              console.log(`Individual Other exam type calculation for ${subject.name}: marks=${subjectData.marks}, total=${totalMarks}`);
            }
            
            console.log(`Individual Subject: ${subject.name}, SubjectData:`, subjectData, `TotalMarks: ${totalMarks}`);
            
            return {
              name: subject.name,
              code: subject.code,
              marks: totalMarks,
              maxMarks: maxMarks
            };
          });

        const marksheetData = {
          rollNumber: student.admissionNumber,
          studentName: student.studentName,
          currentClass: student.currentClass,
          fatherName: student.fatherName || 'N/A',
          motherName: student.motherName || 'N/A',
          dob: new Date(student.dob).toISOString(),
          bloodGroup: student.bloodGroup || 'O+',
          address: student.address || 'N/A',
          phoneNumber: student.phoneNumber || 'N/A',
          photo: student.photo || null,
          examType: examType,
          academicYear: formData.academicYear,
          subjects: subjectMarks
        };

        console.log('Creating individual marksheet for:', marksheetData.rollNumber);
        try {
          const response = await marksheetsAPI.create(marksheetData);
          console.log('Marksheet created successfully:', response.data);
          
          // Show success message and navigate
          alert('Marksheet generated successfully!');
          navigate('/marksheets');
        } catch (err) {
          if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
            console.log('Marksheet already exists, deleting and recreating...');
            try {
              // Delete existing marksheet
              console.log('Deleting existing marksheet for roll number:', marksheetData.rollNumber);
              const deleteResponse = await marksheetsAPI.delete(marksheetData.rollNumber);
              console.log('Delete response:', deleteResponse.data);
              
              // Create new marksheet
              console.log('Creating new marksheet after deletion...');
              const response = await marksheetsAPI.create(marksheetData);
              console.log('Marksheet recreated successfully:', response.data);
              
              // Show success message and navigate
              alert('Marksheet regenerated successfully!');
              navigate('/marksheets');
            } catch (deleteErr) {
              console.error('Error deleting/recreating marksheet:', deleteErr);
              console.error('Delete error details:', deleteErr.response?.data);
              setError('Error regenerating marksheet. Please try again.');
              return;
            }
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error('Error creating marksheet:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Error creating marksheet';
        setError(Array.isArray(errorMessage) ? errorMessage.map(e => e.msg).join(', ') : errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Generate Marksheets</h1>
            <p className="mt-1 text-sm text-gray-600">
              Generate marksheets for all students in a class
            </p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

                    {/* Generation Mode Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generation Mode *
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="bulk"
                            checked={generationMode === 'bulk'}
                            onChange={(e) => setGenerationMode(e.target.value)}
                            className="mr-2"
                          />
                          Bulk Generation (All Students in Class)
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="individual"
                            checked={generationMode === 'individual'}
                            onChange={(e) => setGenerationMode(e.target.value)}
                            className="mr-2"
                          />
                          Individual Generation (Single Student)
                        </label>
                      </div>
                    </div>

                    {/* Class and Exam Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Class *
                        </label>
                        <select
                          value={selectedClass}
                          onChange={handleClassChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Class</option>
                          <option value="1">Class 1</option>
                          <option value="2">Class 2</option>
                          <option value="3">Class 3</option>
                          <option value="4">Class 4</option>
                          <option value="5">Class 5</option>
                          <option value="6">Class 6</option>
                          <option value="7">Class 7</option>
                          <option value="8">Class 8</option>
                          <option value="9">Class 9</option>
                          <option value="10">Class 10</option>
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Type *
                        </label>
                        <select
                          value={examType}
                          onChange={(e) => setExamType(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Half-Yearly">Half-Yearly</option>
                          <option value="Annual">Annual</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Year
                        </label>
                        <input
                          type="text"
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Individual Student Selection */}
                    {generationMode === 'individual' && students.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Student *
                        </label>
                        <select
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Student</option>
                          {students.map((student) => (
                            <option key={student._id} value={student._id}>
                              {student.studentName} ({student.admissionNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

            {/* Subject Management */}
            {students.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Enter Marks for {subjects[currentSubject]?.name} ({subjects[currentSubject]?.code})
                    {generationMode === 'individual' && selectedStudent && (
                      <span className="text-sm text-gray-600 ml-2">
                        - {students.find(s => s._id === selectedStudent)?.studentName}
                      </span>
                    )}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSubject(true)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Subject
                    </button>
                    <button
                      type="button"
                      onClick={prevSubject}
                      disabled={currentSubject === 0}
                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextSubject}
                      disabled={currentSubject === subjects.length - 1}
                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(currentSubject)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Remove Subject
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Subject Modal */}
                {showAddSubject && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Subject</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Name
                          </label>
                          <input
                            type="text"
                            value={newSubject.name}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., PHYSICS"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Code
                          </label>
                          <input
                            type="text"
                            value={newSubject.code}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 042"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSubject(false);
                            setNewSubject({ name: '', code: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={addSubject}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add Subject
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subject Navigation */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {editingSubject === index ? (
                          <div className="flex items-center gap-1 bg-blue-100 p-1 rounded-md">
                            <input
                              type="text"
                              value={editSubjectData.name}
                              onChange={(e) => setEditSubjectData(prev => ({ ...prev, name: e.target.value }))}
                              className="px-2 py-1 text-sm border border-gray-300 rounded w-24"
                              placeholder="Subject"
                            />
                            <input
                              type="text"
                              value={editSubjectData.code}
                              onChange={(e) => setEditSubjectData(prev => ({ ...prev, code: e.target.value }))}
                              className="px-2 py-1 text-sm border border-gray-300 rounded w-16"
                              placeholder="Code"
                            />
                            <button
                              type="button"
                              onClick={saveSubjectEdit}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={cancelSubjectEdit}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCurrentSubject(index)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              currentSubject === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {subject.name} ({subject.code})
                          </button>
                        )}
                        {editingSubject !== index && (
                          <button
                            type="button"
                            onClick={() => startEditingSubject(index)}
                            className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                            title="Edit subject"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                  Student Name
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                  Roll No.
                                </th>
                                {examType === 'Half-Yearly' ? (
                                  <>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                      UT1 (10)
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                      UT2 (10)
                                    </th>
                                  </>
                                ) : (
                                  <>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                      UT3 (10)
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                      UT4 (10)
                                    </th>
                                  </>
                                )}
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                  {examType === 'Half-Yearly' ? 'HFLY (80)' : 'ANNUAL (80)'}
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                  Total Days
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                                  Present Days
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {generationMode === 'bulk' ? (
                                // Bulk mode - show all students
                                students.map((student) => (
                                  <tr key={student._id}>
                                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                                      {student.studentName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-900">
                                      {student.admissionNumber}
                                    </td>
                                    {examType === 'Half-Yearly' ? (
                                      <>
                                        <td className="border border-gray-300 px-2 py-1">
                                          <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={marksData[student._id]?.[subjects[currentSubject]?.name]?.UT1 || ''}
                                            onChange={(e) => handleMarkChange(student._id, 'UT1', e.target.value)}
                                            className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1">
                                          <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={marksData[student._id]?.[subjects[currentSubject]?.name]?.UT2 || ''}
                                            onChange={(e) => handleMarkChange(student._id, 'UT2', e.target.value)}
                                            className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="border border-gray-300 px-2 py-1">
                                          <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={marksData[student._id]?.[subjects[currentSubject]?.name]?.UT3 || ''}
                                            onChange={(e) => handleMarkChange(student._id, 'UT3', e.target.value)}
                                            className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1">
                                          <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={marksData[student._id]?.[subjects[currentSubject]?.name]?.UT4 || ''}
                                            onChange={(e) => handleMarkChange(student._id, 'UT4', e.target.value)}
                                            className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>
                                      </>
                                    )}
                                    <td className="border border-gray-300 px-2 py-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max="80"
                                        value={marksData[student._id]?.[subjects[currentSubject]?.name]?.[examType === 'Half-Yearly' ? 'halfYearly' : 'annual'] || ''}
                                        onChange={(e) => handleMarkChange(student._id, examType === 'Half-Yearly' ? 'halfYearly' : 'annual', e.target.value)}
                                        className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                      <input
                                        type="number"
                                        min="0"
                                        value={studentSettings[student._id]?.totalDays || 105}
                                        onChange={(e) => handleStudentSettingChange(student._id, 'totalDays', e.target.value)}
                                        className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                      <input
                                        type="number"
                                        min="0"
                                        value={studentSettings[student._id]?.presentDays || 95}
                                        onChange={(e) => handleStudentSettingChange(student._id, 'presentDays', e.target.value)}
                                        className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                // Individual mode - show only selected student
                                selectedStudent && students.find(s => s._id === selectedStudent) && (() => {
                                  const student = students.find(s => s._id === selectedStudent);
                                  return (
                                    <tr key={student._id}>
                                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                                        {student.studentName}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-900">
                                        {student.admissionNumber}
                                      </td>
                                      {examType === 'Half-Yearly' ? (
                                        <>
                                          <td className="border border-gray-300 px-2 py-1">
                                            <input
                                              type="number"
                                              min="0"
                                              max="10"
                                              value={individualMarksData[subjects[currentSubject]?.name]?.UT1 || ''}
                                              onChange={(e) => handleIndividualMarkChange('UT1', e.target.value)}
                                              className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="border border-gray-300 px-2 py-1">
                                            <input
                                              type="number"
                                              min="0"
                                              max="10"
                                              value={individualMarksData[subjects[currentSubject]?.name]?.UT2 || ''}
                                              onChange={(e) => handleIndividualMarkChange('UT2', e.target.value)}
                                              className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="border border-gray-300 px-2 py-1">
                                            <input
                                              type="number"
                                              min="0"
                                              max="10"
                                              value={individualMarksData[subjects[currentSubject]?.name]?.UT3 || ''}
                                              onChange={(e) => handleIndividualMarkChange('UT3', e.target.value)}
                                              className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="border border-gray-300 px-2 py-1">
                                            <input
                                              type="number"
                                              min="0"
                                              max="10"
                                              value={individualMarksData[subjects[currentSubject]?.name]?.UT4 || ''}
                                              onChange={(e) => handleIndividualMarkChange('UT4', e.target.value)}
                                              className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          </td>
                                        </>
                                      )}
                                      <td className="border border-gray-300 px-2 py-1">
                                        <input
                                          type="number"
                                          min="0"
                                          max="80"
                                          value={individualMarksData[subjects[currentSubject]?.name]?.[examType === 'Half-Yearly' ? 'halfYearly' : 'annual'] || ''}
                                          onChange={(e) => handleIndividualMarkChange(examType === 'Half-Yearly' ? 'halfYearly' : 'annual', e.target.value)}
                                          className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1">
                                        <input
                                          type="number"
                                          min="0"
                                          value={individualStudentSettings.totalDays || 105}
                                          onChange={(e) => handleIndividualStudentSettingChange('totalDays', e.target.value)}
                                          className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1">
                                        <input
                                          type="number"
                                          min="0"
                                          value={individualStudentSettings.presentDays || 95}
                                          onChange={(e) => handleIndividualStudentSettingChange('presentDays', e.target.value)}
                                          className="w-full px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })()
                              )}
                            </tbody>
                          </table>
                        </div>
              </div>
            )}


            {/* Action Buttons */}
            <div className="flex justify-end pt-6">
              <button
                type="button"
                onClick={generateMarksheets}
                disabled={loading || students.length === 0 || (generationMode === 'individual' && !selectedStudent)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Generating...' 
                  : generationMode === 'bulk' 
                    ? 'Generate All Marksheets' 
                    : 'Generate Individual Marksheet'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateMarksheet;
