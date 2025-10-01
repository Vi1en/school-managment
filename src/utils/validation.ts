// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

export const validateNumber = (value: any): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

export const validatePositiveNumber = (value: any): boolean => {
  return validateNumber(value) && Number(value) > 0;
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const validateFutureDate = (date: string): boolean => {
  return validateDate(date) && new Date(date) > new Date();
};

export const validatePastDate = (date: string): boolean => {
  return validateDate(date) && new Date(date) < new Date();
};

// Form validation helpers
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && !validateRequired(value)) {
    return rules.message || 'This field is required';
  }

  if (value && rules.minLength && typeof value === 'string' && !validateMinLength(value, rules.minLength)) {
    return rules.message || `Minimum length is ${rules.minLength}`;
  }

  if (value && rules.maxLength && typeof value === 'string' && !validateMaxLength(value, rules.maxLength)) {
    return rules.message || `Maximum length is ${rules.maxLength}`;
  }

  if (value && rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return rules.message || 'Invalid format';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

export const validateMarksData = (marksData: any): boolean => {
  // Basic validation for marks data
  return typeof marksData === 'object' && marksData !== null;
};
