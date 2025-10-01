import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui';
import { formatCurrency } from '@/utils/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  principalName: string;
  academicYear: string;
  defaultFee: number;
  lateFeeAmount: number;
  lateFeeDays: number;
}

const Settings: React.FC = () => {
  const { setError, clearError } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: 'Shinde Academy',
    schoolAddress: '123 School Street, City, State 12345',
    schoolPhone: '+1 (555) 123-4567',
    schoolEmail: 'info@shindeacademy.com',
    principalName: 'Dr. John Smith',
    academicYear: '2024-25',
    defaultFee: 1000,
    lateFeeAmount: 50,
    lateFeeDays: 30,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      // const response = await settingsAPI.get();
      // setSettings(response.data);
    } catch (error) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!settings.schoolName.trim()) {
      errors.schoolName = 'School name is required';
    }

    if (!settings.schoolAddress.trim()) {
      errors.schoolAddress = 'School address is required';
    }

    if (!settings.schoolPhone.trim()) {
      errors.schoolPhone = 'School phone is required';
    }

    if (!settings.schoolEmail.trim()) {
      errors.schoolEmail = 'School email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.schoolEmail)) {
      errors.schoolEmail = 'Please enter a valid email address';
    }

    if (!settings.principalName.trim()) {
      errors.principalName = 'Principal name is required';
    }

    if (!settings.academicYear.trim()) {
      errors.academicYear = 'Academic year is required';
    }

    if (settings.defaultFee <= 0) {
      errors.defaultFee = 'Default fee must be greater than 0';
    }

    if (settings.lateFeeAmount < 0) {
      errors.lateFeeAmount = 'Late fee amount cannot be negative';
    }

    if (settings.lateFeeDays <= 0) {
      errors.lateFeeDays = 'Late fee days must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    clearError();

    try {
      // Mock save - replace with actual API call
      // await settingsAPI.update(settings);
      setError('Settings saved successfully!');
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">School Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">School Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="School Name *"
                name="schoolName"
                value={settings.schoolName}
                onChange={handleChange}
                error={formErrors.schoolName}
                required
              />
              
              <Input
                label="School Phone *"
                name="schoolPhone"
                value={settings.schoolPhone}
                onChange={handleChange}
                error={formErrors.schoolPhone}
                required
              />
              
              <Input
                label="School Email *"
                name="schoolEmail"
                type="email"
                value={settings.schoolEmail}
                onChange={handleChange}
                error={formErrors.schoolEmail}
                required
              />
              
              <Input
                label="Principal Name *"
                name="principalName"
                value={settings.principalName}
                onChange={handleChange}
                error={formErrors.principalName}
                required
              />
            </div>
            
            <div className="mt-6">
              <Input
                label="School Address *"
                name="schoolAddress"
                value={settings.schoolAddress}
                onChange={handleChange}
                error={formErrors.schoolAddress}
                required
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Academic Year *"
                name="academicYear"
                value={settings.academicYear}
                onChange={handleChange}
                error={formErrors.academicYear}
                required
              />
            </div>
          </div>

          {/* Fee Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Fee Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Default Fee *"
                name="defaultFee"
                type="number"
                min="0"
                value={settings.defaultFee}
                onChange={handleChange}
                error={formErrors.defaultFee}
                required
              />
              
              <Input
                label="Late Fee Amount"
                name="lateFeeAmount"
                type="number"
                min="0"
                value={settings.lateFeeAmount}
                onChange={handleChange}
                error={formErrors.lateFeeAmount}
              />
              
              <Input
                label="Late Fee Days"
                name="lateFeeDays"
                type="number"
                min="1"
                value={settings.lateFeeDays}
                onChange={handleChange}
                error={formErrors.lateFeeDays}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Application Version</dt>
            <dd className="text-sm text-gray-900">2.0.0</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="text-sm text-gray-900">{new Date().toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Database Status</dt>
            <dd className="text-sm text-green-600">Connected</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Server Status</dt>
            <dd className="text-sm text-green-600">Online</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Settings;
