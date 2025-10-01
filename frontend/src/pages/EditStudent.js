import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsAPI } from '../services/api';

const EditStudent = () => {
  const navigate = useNavigate();
  const { admissionNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    studentName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    address: '',
    phoneNumber: '',
    currentClass: '',
    bloodGroup: '',
    feeDetails: {
      totalFee: '',
      amountPaid: '',
    },
  });

  useEffect(() => {
    fetchStudent();
  }, [admissionNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudent = async () => {
    try {
      const response = await studentsAPI.getByAdmissionNumber(admissionNumber);
      const student = response.data;
      
      setFormData({
        admissionNumber: student.admissionNumber,
        studentName: student.studentName,
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        address: student.address || '',
        phoneNumber: student.phoneNumber || '',
        currentClass: student.currentClass,
        bloodGroup: student.bloodGroup || '',
        feeDetails: {
          totalFee: student.feeDetails?.totalFee || '',
          amountPaid: student.feeDetails?.amountPaid || '',
        },
      });
      
      // Set photo preview if photo exists (base64 or URL)
      if (student.photo) {
        setPhotoPreview(student.photo);
      }
    } catch (err) {
      setError('Error fetching student data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('feeDetails.')) {
      const feeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        feeDetails: {
          ...prev.feeDetails,
          [feeField]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, JPEG)');
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      
      setPhoto(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Create FormData for file upload if photo is selected
      if (photo) {
        const formDataToSend = new FormData();
        
        // Add all form fields
        Object.keys(formData).forEach(key => {
          if (key === 'feeDetails') {
            formDataToSend.append('feeDetails.totalFee', formData.feeDetails.totalFee === '' ? 0 : formData.feeDetails.totalFee);
            formDataToSend.append('feeDetails.amountPaid', formData.feeDetails.amountPaid === '' ? 0 : formData.feeDetails.amountPaid);
          } else {
            // Convert empty strings to 0 for number fields
            const value = formData[key];
            if (['attendance', 'unitTest1Marks', 'unitTest2Marks', 'halfYearlyMarks', 'unitTest3Marks', 'unitTest4Marks', 'annualExamMarks'].includes(key)) {
              formDataToSend.append(key, value === '' ? 0 : value);
            } else {
              formDataToSend.append(key, value);
            }
          }
        });
        
        // Add photo
        formDataToSend.append('photo', photo);
        
        await studentsAPI.update(admissionNumber, formDataToSend);
      } else {
        // Regular JSON update if no photo
        const submitData = {
          ...formData,
          feeDetails: {
            totalFee: formData.feeDetails.totalFee === '' ? 0 : formData.feeDetails.totalFee,
            amountPaid: formData.feeDetails.amountPaid === '' ? 0 : formData.feeDetails.amountPaid,
          },
        };
        
        await studentsAPI.update(admissionNumber, submitData);
      }
      
      navigate(`/student/${admissionNumber}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating student');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Student - {formData.studentName}
          </h2>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Student Photo */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Photo</h3>
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img
                    className="h-16 w-12 object-cover border border-gray-300"
                    src={photoPreview}
                    alt="Student preview"
                  />
                ) : (
                  <div className="h-16 w-12 bg-gray-200 flex items-center justify-center border border-gray-300">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                  Update Student Photo (Passport Size)
                </label>
                <input
                  type="file"
                  name="photo"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG, JPEG up to 2MB. Recommended: 2x2 inches (passport size). Leave empty to keep current photo.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700">
                  Admission Number
                </label>
                <input
                  type="text"
                  name="admissionNumber"
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Admission number cannot be changed</p>
              </div>

              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  id="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="motherName" className="block text-sm font-medium text-gray-700">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  id="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="currentClass" className="block text-sm font-medium text-gray-700">
                  Current Class *
                </label>
                <input
                  type="text"
                  name="currentClass"
                  id="currentClass"
                  required
                  placeholder="e.g., 5, 6, 7"
                  value={formData.currentClass}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Fee Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700">
                  Total Fee (₹)
                </label>
                <input
                  type="number"
                  name="feeDetails.totalFee"
                  id="totalFee"
                  min="0"
                  step="0.01"
                  value={formData.feeDetails.totalFee}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  name="feeDetails.amountPaid"
                  id="amountPaid"
                  min="0"
                  step="0.01"
                  value={formData.feeDetails.amountPaid}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>


          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/student/${admissionNumber}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
