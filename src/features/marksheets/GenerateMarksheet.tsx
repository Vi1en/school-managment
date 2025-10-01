import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentsStore } from '@/store/students';
import { useUIStore } from '@/store/ui';
import { marksheetsAPI } from '@/services/api';
import { Student, MarksData, Subject, MarksheetForm, MarkInput, SubjectMarksData } from '@/types';
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
  const [marksData, setMarksData] = useState<Record<string, SubjectMarksData>>({});
  const [generationMode, setGenerationMode] = useState<'bulk' | 'individual'>('bulk');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [individualMarksData, setIndividualMarksData] = useState<SubjectMarksData>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  // Fetch students when component mounts
  useEffect(() => {
    console.log('GenerateMarksheet: Fetching students...');
    fetchStudents();
  }, [fetchStudents]);

  // Debug students data
  useEffect(() => {
    console.log('GenerateMarksheet: Students updated:', students.length, 'students');
    console.log('GenerateMarksheet: Students data:', students);
    if (students.length > 0) {
      console.log('GenerateMarksheet: First student structure:', students[0]);
      console.log('GenerateMarksheet: First student ID:', students[0].id);
      console.log('GenerateMarksheet: First student _id:', students[0]._id);
      console.log('GenerateMarksheet: First student admissionNumber:', students[0].admissionNumber);
      console.log('GenerateMarksheet: All student keys:', Object.keys(students[0]));
    }
  }, [students]);

  // Initialize individual marks data when student is selected
  useEffect(() => {
    if (selectedStudent && generationMode === 'individual') {
      const initialMarksData: SubjectMarksData = {};
      subjects.forEach(subject => {
        initialMarksData[subject.name] = {
          UT1: 0,
          UT2: 0,
          UT3: 0,
          UT4: 0,
          halfYearly: 0,
          annual: 0,
        };
      });
      setIndividualMarksData(initialMarksData);
    }
  }, [selectedStudent, generationMode, subjects]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const className = e.target.value;
    console.log('GenerateMarksheet: Class changed to:', className);
    setSelectedClass(className);
    if (className) {
      // Filter students by class
      const classStudents = students.filter(student => student.currentClass === className);
      console.log('GenerateMarksheet: Found', classStudents.length, 'students in class', className);
      // Update marks data for bulk generation - each student gets their own marks object
      const initialMarksData: Record<string, SubjectMarksData> = {};
      classStudents.forEach(student => {
        // Use admissionNumber as the unique identifier since id might be undefined
        const studentId = student.id || student._id || student.admissionNumber;
        console.log('GenerateMarksheet: Processing student:', student.studentName, 'ID:', studentId, 'Original ID:', student.id, 'Admission Number:', student.admissionNumber);
        initialMarksData[studentId] = {};
        subjects.forEach(subject => {
          initialMarksData[studentId][subject.name] = {
            UT1: 0,
            UT2: 0,
            UT3: 0,
            UT4: 0,
            halfYearly: 0,
            annual: 0,
          };
        });
      });
      console.log('GenerateMarksheet: Initialized marks data for', Object.keys(initialMarksData).length, 'students');
      console.log('GenerateMarksheet: Marks data keys:', Object.keys(initialMarksData));
      setMarksData(initialMarksData);
    } else {
      setMarksData({});
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
  };

  const handleMarkChange = (studentId: string, markType: keyof MarkInput, value: string, subjectName?: string) => {
    const numericValue = parseFloat(value) || 0;
    const targetSubject = subjectName || subjects[currentSubject]?.name;
    
    console.log('Mark change:', { studentId, markType, value, targetSubject, generationMode });
    
    if (generationMode === 'bulk') {
      setMarksData(prev => {
        const newData = { ...prev };
        if (!newData[studentId]) {
          newData[studentId] = {};
        }
        if (!newData[studentId][targetSubject]) {
          newData[studentId][targetSubject] = {
            UT1: 0,
            UT2: 0,
            UT3: 0,
            UT4: 0,
            halfYearly: 0,
            annual: 0,
          };
        }
        newData[studentId][targetSubject] = {
          ...newData[studentId][targetSubject],
          [markType]: numericValue,
        };
        console.log('Updated marks data for student:', studentId, newData[studentId][targetSubject]);
        return newData;
      });
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

  const calculateTotalMarks = (subjectData: MarkInput, examType: string): number => {
    if (examType === 'Half-Yearly') {
      return subjectData.UT1 + subjectData.UT2 + subjectData.halfYearly;
    } else if (examType === 'Annual') {
      return subjectData.UT1 + subjectData.UT2 + subjectData.UT3 + subjectData.UT4 + subjectData.annual;
    } else {
      return subjectData.UT1 + subjectData.UT2 + subjectData.UT3 + subjectData.UT4;
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
          const studentId = student.id || student._id || student.admissionNumber;
          const studentMarks = marksData[studentId] || {};
          const subjectMarks = subjects.map(subject => {
            const subjectData = studentMarks[subject.name] || {};
            const totalMarks = calculateTotalMarks(subjectData, examType);
            
            return {
              id: subject.id,
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
          console.log('Creating marksheet with data:', marksheetData);
          await marksheetsAPI.create(marksheetData);
        }

        alert(`${marksheetsToCreate.length} marksheets generated successfully!`);
        navigate('/marksheets');
      } else {
        if (!selectedStudent) {
          setLocalError('Please select a student');
          return;
        }

        const student = students.find(s => {
          const studentId = s.id || s._id || s.admissionNumber;
          return studentId === selectedStudent;
        });
        if (!student) {
          setLocalError('Selected student not found');
          return;
        }

        const subjectMarks = subjects.map(subject => {
          const subjectData = individualMarksData[subject.name] || {};
          const totalMarks = calculateTotalMarks(subjectData, examType);
          
          return {
            id: subject.id,
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

        console.log('Creating individual marksheet with data:', marksheetData);
        const response = await marksheetsAPI.create(marksheetData);
        setPreviewData(response.data);
        setShowPreview(true);
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
          <label className="block text-sm font-medium text-gray-700 mb-3" style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Generation Mode
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center" style={{ color: '#000', fontSize: '14px' }}>
              <input
                type="radio"
                value="bulk"
                checked={generationMode === 'bulk'}
                onChange={(e) => setGenerationMode(e.target.value as 'bulk' | 'individual')}
                className="mr-2"
                style={{ marginRight: '8px' }}
              />
              Bulk Generation (All Students in Class)
            </label>
            <label className="flex items-center" style={{ color: '#000', fontSize: '14px' }}>
              <input
                type="radio"
                value="individual"
                checked={generationMode === 'individual'}
                onChange={(e) => setGenerationMode(e.target.value as 'bulk' | 'individual')}
                className="mr-2"
                style={{ marginRight: '8px' }}
              />
              Individual Generation (Single Student)
            </label>
          </div>
        </div>

        {/* Class Selection */}
        {generationMode === 'bulk' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              Select Class *
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#000',
                backgroundColor: '#fff'
              }}
            >
              <option value="" style={{ color: '#6b7280' }}>Select Class</option>
              {Array.from(new Set(students.map(s => s.currentClass))).map(className => (
                <option key={className} value={className} style={{ color: '#000' }}>
                  Class {className}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Individual Student Selection */}
        {generationMode === 'individual' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              Select Student *
            </label>
            <select
              value={selectedStudent}
              onChange={handleStudentChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#000',
                backgroundColor: '#fff'
              }}
            >
              <option value="" style={{ color: '#6b7280' }}>Select Student</option>
              {students.map((student) => {
                const studentId = student.id || student._id || student.admissionNumber;
                return (
                  <option key={studentId} value={studentId} style={{ color: '#000' }}>
                    {student.studentName} ({student.admissionNumber})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Exam Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Exam Type *
          </label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value as 'Half-Yearly' | 'Annual' | 'Quarterly')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              backgroundColor: '#fff'
            }}
          >
            <option value="Half-Yearly" style={{ color: '#000' }}>Half-Yearly</option>
            <option value="Annual" style={{ color: '#000' }}>Annual</option>
            <option value="Quarterly" style={{ color: '#000' }}>Quarterly</option>
          </select>
        </div>
      </div>

      {/* Subject Management */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900" style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>Subjects</h2>
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
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  color: currentSubject === index ? '#fff' : '#374151',
                  backgroundColor: currentSubject === index ? '#000' : '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* Marks Input */}
        {subjects[currentSubject] && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900" style={{ color: '#111827', fontSize: '16px', fontWeight: '500' }}>
              {subjects[currentSubject].name} - {subjects[currentSubject].code}
            </h3>

            {generationMode === 'bulk' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                  <thead className="bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        UT1 (10)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        UT2 (10)
                      </th>
                      {examType === 'Annual' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            UT3 (10)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            UT4 (10)
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {examType === 'Half-Yearly' ? 'Half-Yearly (80)' : 'Annual (80)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200" style={{ backgroundColor: '#fff' }}>
                    {classStudents.map((student) => {
                      const studentId = student.id || student._id || student.admissionNumber;
                      return (
                      <tr key={studentId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {student.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={marksData[studentId]?.[subjects[currentSubject].name]?.UT1 || ''}
                            onChange={(e) => {
                              console.log('UT1 input changed for student:', studentId, 'value:', e.target.value);
                              handleMarkChange(studentId, 'UT1', e.target.value);
                            }}
                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            style={{ 
                              width: '100%', 
                              padding: '4px 8px', 
                              textAlign: 'center', 
                              border: '1px solid #d1d5db', 
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#000',
                              backgroundColor: '#fff'
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={marksData[studentId]?.[subjects[currentSubject].name]?.UT2 || ''}
                            onChange={(e) => {
                              console.log('UT2 input changed for student:', studentId, 'value:', e.target.value);
                              handleMarkChange(studentId, 'UT2', e.target.value);
                            }}
                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            style={{ 
                              width: '100%', 
                              padding: '4px 8px', 
                              textAlign: 'center', 
                              border: '1px solid #d1d5db', 
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#000',
                              backgroundColor: '#fff'
                            }}
                          />
                        </td>
                        {examType === 'Annual' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap" style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={marksData[studentId]?.[subjects[currentSubject].name]?.UT3 || ''}
                                onChange={(e) => {
                                  console.log('UT3 input changed for student:', studentId, 'value:', e.target.value);
                                  handleMarkChange(studentId, 'UT3', e.target.value);
                                }}
                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                style={{ 
                                  width: '100%', 
                                  padding: '4px 8px', 
                                  textAlign: 'center', 
                                  border: '1px solid #d1d5db', 
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  color: '#000',
                                  backgroundColor: '#fff'
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={marksData[studentId]?.[subjects[currentSubject].name]?.UT4 || ''}
                                onChange={(e) => {
                                  console.log('UT4 input changed for student:', studentId, 'value:', e.target.value);
                                  handleMarkChange(studentId, 'UT4', e.target.value);
                                }}
                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                style={{ 
                                  width: '100%', 
                                  padding: '4px 8px', 
                                  textAlign: 'center', 
                                  border: '1px solid #d1d5db', 
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  color: '#000',
                                  backgroundColor: '#fff'
                                }}
                              />
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap" style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <input
                            type="number"
                            min="0"
                            max="80"
                            value={marksData[studentId]?.[subjects[currentSubject].name]?.[examType === 'Half-Yearly' ? 'halfYearly' : 'annual'] || ''}
                            onChange={(e) => {
                              console.log('Half-Yearly/Annual input changed for student:', studentId, 'value:', e.target.value);
                              handleMarkChange(studentId, examType === 'Half-Yearly' ? 'halfYearly' : 'annual', e.target.value);
                            }}
                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            style={{ 
                              width: '100%', 
                              padding: '4px 8px', 
                              textAlign: 'center', 
                              border: '1px solid #d1d5db', 
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#000',
                              backgroundColor: '#fff'
                            }}
                          />
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    UT1 (10 marks)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={individualMarksData[subjects[currentSubject].name]?.UT1 || ''}
                    onChange={(e) => handleMarkChange('', 'UT1', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#000',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    UT2 (10 marks)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={individualMarksData[subjects[currentSubject].name]?.UT2 || ''}
                    onChange={(e) => handleMarkChange('', 'UT2', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#000',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
                {examType === 'Annual' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        UT3 (10 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={individualMarksData[subjects[currentSubject].name]?.UT3 || ''}
                        onChange={(e) => handleMarkChange('', 'UT3', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#000',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        UT4 (10 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={individualMarksData[subjects[currentSubject].name]?.UT4 || ''}
                        onChange={(e) => handleMarkChange('', 'UT4', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#000',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    {examType === 'Half-Yearly' ? 'Half-Yearly (80 marks)' : 'Annual (80 marks)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={individualMarksData[subjects[currentSubject].name]?.[examType === 'Half-Yearly' ? 'halfYearly' : 'annual'] || ''}
                    onChange={(e) => handleMarkChange('', examType === 'Half-Yearly' ? 'halfYearly' : 'annual', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#000',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
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

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Marksheet Preview"
        size="xl"
      >
        {previewData && (
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
                    onError={(e) => {
                      console.log('Logo image failed to load, trying alternative path');
                      e.currentTarget.src = './image.png';
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
                      <div><strong>ROLL NO.:</strong> {previewData.rollNumber}</div>
                      <div><strong>STUDENT'S NAME:</strong> {previewData.studentName}</div>
                      <div><strong>CLASS:</strong> {previewData.currentClass}th</div>
                      <div><strong>FATHER'S NAME:</strong> {previewData.fatherName}</div>
                      <div><strong>DOB:</strong> {new Date(previewData.dob).toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                      <div><strong>BLOOD GROUP:</strong> {previewData.bloodGroup}</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '20px' }}>
                    {previewData.photo ? (
                      <img 
                        src={previewData.photo} 
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
                      {previewData.subjects?.map((subject: any, index: number) => (
                        <tr key={subject.id || index}>
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
                    <div><strong>RESULT:</strong> {previewData.promotionStatus}</div>
                    <div><strong>NO.of School days:</strong> 105</div>
                    <div><strong>NO.of days Present:</strong> 95</div>
                    <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    }).replace(/\//g, '-')}</div>
                  </div>
                  <div style={{ 
                    border: '1px solid #000', 
                    padding: '10px',
                    width: '48%',
                    fontSize: '12px'
                  }}>
                    <div><strong>TOTAL MARKS:</strong> {previewData.totalMarks}</div>
                    <div><strong>PERCENTAGE:</strong> {previewData.percentage}%</div>
                    <div><strong>OVERALL GRADE:</strong> {previewData.percentage >= 90 ? 'A+' : previewData.percentage >= 80 ? 'A' : previewData.percentage >= 70 ? 'B' : previewData.percentage >= 60 ? 'C' : previewData.percentage >= 50 ? 'D' : 'F'}</div>
                    <div><strong>RANK:</strong> {previewData.rank ? `${previewData.rank}th` : 'N/A'}</div>
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
                onClick={() => setShowPreview(false)}
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
              >
                Print Marksheet
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
