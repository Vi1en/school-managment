// Formatting utilities
export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString('en-IN');
  }
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatStudentName = (firstName: string, lastName?: string): string => {
  const first = capitalizeFirst(firstName);
  const last = lastName ? capitalizeFirst(lastName) : '';
  return `${first} ${last}`.trim();
};

export const formatClass = (classNumber: string): string => {
  return `Class ${classNumber}`;
};

export const formatAdmissionNumber = (admissionNumber: string): string => {
  return `#${admissionNumber}`;
};

export const formatGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export const formatStatus = (status: string): string => {
  if (!status || typeof status !== 'string') return 'Unknown';
  
  const statusMap: Record<string, string> = {
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
    promoted: 'Promoted',
    'not-promoted': 'Not Promoted',
    active: 'Active',
    inactive: 'Inactive',
  };
  
  return statusMap[status.toLowerCase()] || capitalizeFirst(status);
};

export const getStatusColor = (status: string): string => {
  if (!status || typeof status !== 'string') return 'text-gray-600 bg-gray-100';
  
  const colorMap: Record<string, string> = {
    paid: 'text-green-600 bg-green-100',
    partial: 'text-yellow-600 bg-yellow-100',
    unpaid: 'text-red-600 bg-red-100',
    promoted: 'text-green-600 bg-green-100',
    'not-promoted': 'text-red-600 bg-red-100',
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
  };
  
  return colorMap[status.toLowerCase()] || 'text-gray-600 bg-gray-100';
};
