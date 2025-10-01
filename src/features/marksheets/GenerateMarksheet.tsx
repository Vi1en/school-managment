import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentsStore } from '@/store/students';
import { useUIStore } from '@/store/ui';
import { marksheetsAPI } from '@/services/api';
import { Student, MarksData, Subject, MarksheetForm } from '@/types';
import { validateMarksData } from '@/utils/validation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

const GenerateMarksheet: React.FC = () => {
  const navigate = useNavigate();
  const { students, fetchStudents, isLoading: studentsLoading } = useStudentsStore();
  const { setError, clearError } = useUIStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState<'Half-Yearly' | 'Annual' | 'Quarterly'>('Half-Yearly');
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'HINDI COURSE A', code: '002', marks: 0, maxMarks: 100 },
    { id: '2', name: 'ENGLISH LAN & LIT', code: '184', marks: 0, maxMarks: 100 },
    { id: '3', name: 'MATHEMATICS', code: '241', marks: 0, maxMarks: 100 },
    { id: '4', name: 'SCIENCE', code: '086', marks: 0, maxMarks: 100 },
    { id: '5', name: 'SOCIAL SCIENCE', code: '084', marks: 0, maxMarks: 100 },
  ]);
  const [currentSubject, setCurrentSubject] = useState(0);
  const [marksData, setMarksData] = useState<MarksData>({});
  const [generationMode, setGenerationMode] = useState<'bulk' | 'individual'>('bulk');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [individualMarksData, setIndividualMarksData] = useState<MarksData>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  // Fetch students when component mounts
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Initialize individual marks data when student is selected
  useEffect(() => {
    if (selectedStudent && generationMode === 'individual') {
      const initialMarksData: MarksData = {};
      subjects.forEach(subject => {
        initialMarksData[subject.name] = {
          UT1: 0,
          UT2: 0,
          UT3: 0,
          UT4: 0,
          halfYearly: 0,
          annual: 0,
          marks: 0,
        };
      });
      setIndividualMarksData(initialMarksData);
    }
  }, [selectedStudent, generationMode, subjects]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const className = e.target.value;
    setSelectedClass(className);
    if (className) {
      // Filter students by class
      const classStudents = students.filter(student => student.currentClass === className);
      // Update marks data for bulk generation
      const initialMarksData: MarksData = {};
      classStudents.forEach(student => {
        initialMarksData[student.id] = {};
        subjects.forEach(subject => {
          initialMarksData[student.id][subject.name] = {
            UT1: 0,
            UT2: 0,
            UT3: 0,
            UT4: 0,
            halfYearly: 0,
            annual: 0,
            marks: 0,
          };
        });
      });
      setMarksData(initialMarksData);
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
  };

  const handleMarkChange = (studentId: string, markType: string, value: string, subjectName?: string) => {
    const numericValue = parseFloat(value) || 0;
    const targetSubject = subjectName || subjects[currentSubject]?.name;
    
    if (generationMode === 'bulk') {
      setMarksData(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [targetSubject]: {
            ...prev[studentId]?.[targetSubject],
            [markType]: numericValue,
          },
        },
      }));
    } else {
      setIndividualMarksData(prev => ({
        ...prev,
        [targetSubject]: {
          ...prev[targetSubject],
          [markType]: numericValue,
        },
      }));
    }
  };

  const calculateTotalMarks = (subjectData: any, examType: string): number => {
    if (examType === 'Half-Yearly') {
      return (parseFloat(subjectData.UT1) || 0) + 
             (parseFloat(subjectData.UT2) || 0) + 
             (parseFloat(subjectData.halfYearly) || 0);
    } else if (examType === 'Annual') {
      return (parseFloat(subjectData.UT1) || 0) + 
             (parseFloat(subjectData.UT2) || 0) + 
             (parseFloat(subjectData.UT3) || 0) + 
             (parseFloat(subjectData.UT4) || 0) + 
             (parseFloat(subjectData.annual) || 0);
    } else {
      return parseFloat(subjectData.marks) || 0;
    }
  };

  const generateMarksheets = async () => {
    setLoading(true);
    setLocalError('');
    clearError();

    try {
      if (generationMode === 'bulk') {
        if (!selectedClass || students.length === 0) {
          setLocalError('Please select a class and ensure students are loaded');
          return;
        }

        const classStudents = students.filter(student => student.currentClass === selectedClass);
        const marksheetsToCreate = classStudents.map(student => {
          const studentMarks = marksData[student.id] || {};
          const subjectMarks = subjects.map(subject => {
            const subjectData = studentMarks[subject.name] || {};
            const totalMarks = calculateTotalMarks(subjectData, examType);
            
            return {
              name: subject.name,
              code: subject.code,
              marks: totalMarks,
              maxMarks: subject.maxMarks,
            };
          });

          return {
            rollNumber: student.admissionNumber,
            studentName: student.studentName,
            currentClass: student.currentClass,
            fatherName: student.fatherName,
            motherName: student.motherName,
            dob: student.dob,
            bloodGroup: student.bloodGroup,
            address: student.address,
            phoneNumber: student.phoneNumber,
            photo: student.photo,
            examType: examType,
            academicYear: '2025-26',
            subjects: subjectMarks,
          };
        });

        // Create marksheets
        for (const marksheetData of marksheetsToCreate) {
          await marksheetsAPI.create(marksheetData);
        }

        alert(`${marksheetsToCreate.length} marksheets generated successfully!`);
        navigate('/marksheets');
      } else {
        if (!selectedStudent) {
          setLocalError('Please select a student');
          return;
        }

        const student = students.find(s => s.id === selectedStudent);
        if (!student) {
          setLocalError('Selected student not found');
          return;
        }

        const subjectMarks = subjects.map(subject => {
          const subjectData = individualMarksData[subject.name] || {};
          const totalMarks = calculateTotalMarks(subjectData, examType);
          
          return {
            name: subject.name,
            code: subject.code,
            marks: totalMarks,
            maxMarks: subject.maxMarks,
          };
        });

        const marksheetData = {
          rollNumber: student.admissionNumber,
          studentName: student.studentName,
          currentClass: student.currentClass,
          fatherName: student.fatherName,
          motherName: student.motherName,
          dob: student.dob,
          bloodGroup: student.bloodGroup,
          address: student.address,
          phoneNumber: student.phoneNumber,
          photo: student.photo,
          examType: examType,
          academicYear: '2025-26',
          subjects: subjectMarks,
        };

        const response = await marksheetsAPI.create(marksheetData);
        
        if (response.success) {
          setPreviewData(response.data);
          setShowPreview(true);
        } else {
          setLocalError(response.error || 'Failed to generate marksheet');
        }
      }
    } catch (error: any) {
      setLocalError(error.message || 'Failed to generate marksheets');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    if (newSubject.name && newSubject.code) {
      const newSubjectObj: Subject = {
        id: Date.now().toString(),
        name: newSubject.name.toUpperCase(),
        code: newSubject.code,
        marks: 0,
        maxMarks: 100,
      };
      setSubjects(prev => [...prev, newSubjectObj]);
      setNewSubject({ name: '', code: '' });
      setShowAddSubject(false);
    }
  };

  const classStudents = students.filter(student => student.currentClass === selectedClass);
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Generate Marksheets</h1>
        
        {/* Generation Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Generation Mode
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="bulk"
                checked={generationMode === 'bulk'}
                onChange={(e) => setGenerationMode(e.target.value as 'bulk' | 'individual')}
                className="mr-2"
              />
              Bulk Generation (All Students in Class)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="individual"
                checked={generationMode === 'individual'}
                onChange={(e) => setGenerationMode(e.target.value as 'bulk' | 'individual')}
                className="mr-2"
              />
              Individual Generation (Single Student)
            </label>
          </div>
        </div>

        {/* Class Selection */}
        {generationMode === 'bulk' && (
          <div className="mb-6">
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
              {Array.from(new Set(students.map(s => s.currentClass))).map(className => (
                <option key={className} value={className}>
                  Class {className}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Individual Student Selection */}
        {generationMode === 'individual' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student *
            </label>
            <select
              value={selectedStudent}
              onChange={handleStudentChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.studentName} ({student.admissionNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exam Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Type *
          </label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value as 'Half-Yearly' | 'Annual' | 'Quarterly')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Annual">Annual</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      {/* Subject Management */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddSubject(true)}
          >
            Add Subject
          </Button>
        </div>

        {/* Subject Navigation */}
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {subjects.map((subject, index) => (
              <button
                key={subject.id}
                onClick={() => setCurrentSubject(index)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-200',
                  currentSubject === index
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* Marks Input */}
        {subjects[currentSubject] && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">
              {subjects[currentSubject].name} - {subjects[currentSubject].code}
            </h3>

            {generationMode === 'bulk' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UT1 (10)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UT2 (10)
                      </th>
                      {examType === 'Annual' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            UT3 (10)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            UT4 (10)
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {examType === 'Half-Yearly' ? 'Half-Yearly (80)' : 'Annual (80)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={marksData[student.id]?.[subjects[currentSubject].name]?.UT1 || ''}
                            onChange={(e) => handleMarkChange(student.id, 'UT1', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={marksData[student.id]?.[subjects[currentSubject].name]?.UT2 || ''}
                            onChange={(e) => handleMarkChange(student.id, 'UT2', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        {examType === 'Annual' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={marksData[student.id]?.[subjects[currentSubject].name]?.UT3 || ''}
                                onChange={(e) => handleMarkChange(student.id, 'UT3', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={marksData[student.id]?.[subjects[currentSubject].name]?.UT4 || ''}
                                onChange={(e) => handleMarkChange(student.id, 'UT4', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="80"
                            value={marksData[student.id]?.[subjects[currentSubject].name]?.[examType === 'Half-Yearly' ? 'halfYearly' : 'annual'] || ''}
                            onChange={(e) => handleMarkChange(student.id, examType === 'Half-Yearly' ? 'halfYearly' : 'annual', e.target.value)}
                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="UT1 (10 marks)"
                  type="number"
                  min="0"
                  max="10"
                  value={individualMarksData[subjects[currentSubject].name]?.UT1 || ''}
                  onChange={(e) => handleMarkChange('', 'UT1', e.target.value)}
                />
                <Input
                  label="UT2 (10 marks)"
                  type="number"
                  min="0"
                  max="10"
                  value={individualMarksData[subjects[currentSubject].name]?.UT2 || ''}
                  onChange={(e) => handleMarkChange('', 'UT2', e.target.value)}
                />
                {examType === 'Annual' && (
                  <>
                    <Input
                      label="UT3 (10 marks)"
                      type="number"
                      min="0"
                      max="10"
                      value={individualMarksData[subjects[currentSubject].name]?.UT3 || ''}
                      onChange={(e) => handleMarkChange('', 'UT3', e.target.value)}
                    />
                    <Input
                      label="UT4 (10 marks)"
                      type="number"
                      min="0"
                      max="10"
                      value={individualMarksData[subjects[currentSubject].name]?.UT4 || ''}
                      onChange={(e) => handleMarkChange('', 'UT4', e.target.value)}
                    />
                  </>
                )}
                <Input
                  label={examType === 'Half-Yearly' ? 'Half-Yearly (80 marks)' : 'Annual (80 marks)'}
                  type="number"
                  min="0"
                  max="80"
                  value={individualMarksData[subjects[currentSubject].name]?.[examType === 'Half-Yearly' ? 'halfYearly' : 'annual'] || ''}
                  onChange={(e) => handleMarkChange('', examType === 'Half-Yearly' ? 'halfYearly' : 'annual', e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/marksheets')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={generateMarksheets}
            loading={loading}
            disabled={loading || (generationMode === 'bulk' && !selectedClass) || (generationMode === 'individual' && !selectedStudent)}
          >
            {generationMode === 'bulk' ? 'Generate All Marksheets' : 'Generate Marksheet'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        title="Add New Subject"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Subject Name"
            value={newSubject.name}
            onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., PHYSICS"
          />
          <Input
            label="Subject Code"
            value={newSubject.code}
            onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
            placeholder="e.g., 042"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowAddSubject(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={addSubject}
              disabled={!newSubject.name || !newSubject.code}
            >
              Add Subject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GenerateMarksheet;
