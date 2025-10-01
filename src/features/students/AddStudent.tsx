import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentsStore } from '@/store/students';
import { useUIStore } from '@/store/ui';
import { StudentForm } from '@/types';
import { validateRequired, validateEmail, validatePhone } from '@/utils/validation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const { createStudent } = useStudentsStore();
  const { setError, clearError } = useUIStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentForm>({
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
      totalFee: 0,
      amountPaid: 0,
    },
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('feeDetails.')) {
      const feeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        feeDetails: {
          ...prev.feeDetails,
          [feeField]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setLocalError('Please select an image file (JPG, PNG, JPEG)');
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setLocalError('File size must be less than 2MB');
        return;
      }
      
      setPhoto(file);
      setLocalError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateRequired(formData.admissionNumber)) {
      errors.admissionNumber = 'Admission Number is required';
    }

    if (!validateRequired(formData.studentName)) {
      errors.studentName = 'Student Name is required';
    }

    if (!validateRequired(formData.fatherName)) {
      errors.fatherName = 'Father Name is required';
    }

    if (!validateRequired(formData.motherName)) {
      errors.motherName = 'Mother Name is required';
    }

    if (!validateRequired(formData.dob)) {
      errors.dob = 'Date of Birth is required';
    }

    if (!validateRequired(formData.currentClass)) {
      errors.currentClass = 'Current Class is required';
    }

    if (!validateRequired(formData.bloodGroup)) {
      errors.bloodGroup = 'Blood Group is required';
    }

    if (!validateRequired(formData.address)) {
      errors.address = 'Address is required';
    }

    if (!validateRequired(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone Number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    if (formData.feeDetails.totalFee <= 0) {
      errors.totalFee = 'Total Fee must be greater than 0';
    }

    if (formData.feeDetails.amountPaid < 0) {
      errors.amountPaid = 'Amount Paid cannot be negative';
    }

    if (formData.feeDetails.amountPaid > formData.feeDetails.totalFee) {
      errors.amountPaid = 'Amount Paid cannot be greater than Total Fee';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLocalError('');
    clearError();

    try {
      const studentData = {
        ...formData,
        photo: photo || undefined,
      };

      const result = await createStudent(studentData);
      
      if (result.success) {
        navigate('/students');
      } else {
        setLocalError(result.error || 'Failed to create student');
      }
    } catch (error: any) {
      setLocalError(error.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Admission Number *"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              error={formErrors.admissionNumber}
              required
            />
            
            <Input
              label="Student Name *"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              error={formErrors.studentName}
              required
            />
            
            <Input
              label="Father Name *"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              error={formErrors.fatherName}
              required
            />
            
            <Input
              label="Mother Name *"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              error={formErrors.motherName}
              required
            />
            
            <Input
              label="Date of Birth *"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              error={formErrors.dob}
              required
            />
            
            <Input
              label="Current Class *"
              name="currentClass"
              value={formData.currentClass}
              onChange={handleChange}
              error={formErrors.currentClass}
              required
            />
            
            <Input
              label="Blood Group *"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              error={formErrors.bloodGroup}
              required
            />
            
            <Input
              label="Phone Number *"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={formErrors.phoneNumber}
              required
            />
          </div>

          {/* Address */}
          <div>
            <Input
              label="Address *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={formErrors.address}
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Photo
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Fee Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Total Fee *"
                name="feeDetails.totalFee"
                type="number"
                min="0"
                value={formData.feeDetails.totalFee}
                onChange={handleChange}
                error={formErrors.totalFee}
                required
              />
              
              <Input
                label="Amount Paid *"
                name="feeDetails.amountPaid"
                type="number"
                min="0"
                value={formData.feeDetails.amountPaid}
                onChange={handleChange}
                error={formErrors.amountPaid}
                required
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/students')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
