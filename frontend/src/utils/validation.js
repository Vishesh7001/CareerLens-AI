/**
 * Validation utilities for CareerLens AI client-side forms
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return '';
};

export const validateFullName = (name) => {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  if (name.trim().length < 2) {
    return 'Full name must be at least 2 characters long.';
  }
  if (name.trim().length > 100) {
    return 'Full name cannot exceed 100 characters.';
  }
  return '';
};

export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      label: 'None',
      color: 'bg-gray-200',
      message: 'Password is required.',
    };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) score += 1;

  let label = 'Weak';
  let color = 'bg-red-500';

  if (score === 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
  } else if (score === 3) {
    label = 'Medium';
    color = 'bg-amber-500';
  }

  const isValid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);

  return {
    isValid,
    score,
    label,
    color,
    message: isValid
      ? ''
      : 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.',
  };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
};

export const validateResumeFile = (file) => {
  if (!file) {
    return 'Please select a PDF file to upload.';
  }

  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name && file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfMime && !isPdfExt) {
    return 'Only PDF documents (.pdf) are supported.';
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5 MB.`;
  }

  return '';
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};


