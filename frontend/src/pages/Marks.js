import React, { useState, useEffect, useCallback } from 'react';
import { marksAPI, studentsAPI } from '../services/api';

const Marks = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('unitTest');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const examTypes = [
    { value: 'unitTest', label: 'Unit Test' },
    { value: 'halfYearly', label: 'Half Yearly' },
    { value: 'annual', label: 'Annual' }
  ];

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await marksAPI.getSubjects();
      setSubjects(response.data.subjects);
    } catch (err) {
      setError('Failed to fetch subjects');
    }
  }, []);

  const fetchStudentsByClass = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      const classStudents = response.data.students.filter(
        student => student.currentClass === selectedClass
      );
      setStudents(classStudents);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  const fetchStudentMarks = useCallback(async () => {
    try {
      const response = await marksAPI.getByAdmissionNumber(selectedStudent);
      const studentMarks = response.data.marks[selectedExamType] || {};
      setMarks(studentMarks);
    } catch (err) {
      console.error('Error fetching student marks:', err);
      setMarks({});
    }
  }, [selectedStudent, selectedExamType]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    }
  }, [selectedClass, fetchStudentsByClass]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMarks();
    }
  }, [selectedStudent, selectedExamType, fetchStudentMarks]);

  const handleMarkChange = (subject, value) => {
    setMarks(prev => ({
      ...prev,
      [subject]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate that at least one mark is entered
      const hasMarks = Object.values(marks).some(mark => mark !== '' && mark > 0);
      if (!hasMarks) {
        setError('Please enter at least one mark');
        setSaving(false);
        return;
      }

      await marksAPI.add({
        admissionNumber: selectedStudent,
        examType: selectedExamType,
        marks: marks
      });

      setSuccess('Marks saved successfully!');
      // Clear form after successful save
      setTimeout(() => {
        setMarks({});
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving marks');
    } finally {
      setSaving(false);
    }
  };

  const selectedStudentData = students.find(s => s.admissionNumber === selectedStudent);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marks Management</h1>
        <p className="text-gray-600">Enter and manage student marks for different exam types</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class Selection */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent('');
                  setMarks({});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Exam Type Selection */}
            <div>
              <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <select
                id="examType"
                value={selectedExamType}
                onChange={(e) => {
                  setSelectedExamType(e.target.value);
                  setMarks({});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {examTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Student Selection */}
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setMarks({});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={!selectedClass || loading}
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.admissionNumber} value={student.admissionNumber}>
                    {student.studentName} ({student.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Marks Entry Section */}
        {selectedStudent && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Enter Marks for {selectedStudentData?.studentName} - {examTypes.find(t => t.value === selectedExamType)?.label}
              </h3>
              <p className="text-sm text-gray-600">
                Admission Number: {selectedStudent} | Class: {selectedClass}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks (Out of 100)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map(subject => (
                    <tr key={subject}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={marks[subject] || ''}
                          onChange={(e) => handleMarkChange(subject, e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Marks;
