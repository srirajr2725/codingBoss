// Form Validation Utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Test Validation
export const validateTestAnswers = (answers, totalQuestions) => {
  if (!answers || typeof answers !== 'object') {
    return {
      isValid: false,
      errors: ['Answers must be provided in correct format'],
    };
  }

  const answeredCount = Object.keys(answers).length;
  
  if (answeredCount === 0) {
    return {
      isValid: false,
      errors: ['Please answer at least one question'],
    };
  }

  const unansweredCount = totalQuestions - answeredCount;
  return {
    isValid: true,
    answeredCount,
    unansweredCount,
    warnings: unansweredCount > 0 ? [`${unansweredCount} questions remain unanswered`] : [],
  };
};

export const validateSourceCode = (code, language) => {
  const errors = [];

  if (!code || code.trim().length === 0) {
    errors.push('Source code cannot be empty');
  }

  if (code.length > 10000) {
    errors.push('Source code exceeds maximum length of 10000 characters');
  }

  // Language-specific validation
  if (language === 'Python') {
    if (!code.includes('def ') && !code.includes('class ')) {
      errors.push('Python code should contain function or class definitions');
    }
  } else if (language === 'Java') {
    if (!code.includes('public ') && !code.includes('class ')) {
      errors.push('Java code should contain class definitions');
    }
  } else if (language === 'JavaScript') {
    if (!code.includes('function ') && !code.includes('const ') && !code.includes('let ')) {
      errors.push('JavaScript code should contain function or variable declarations');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Result Validation
export const validateTestResults = (results) => {
  const errors = [];

  if (!results) {
    errors.push('Results object is missing');
    return { isValid: false, errors };
  }

  if (!results.testType || !['MCQ', 'Coding'].includes(results.testType)) {
    errors.push('Invalid test type. Must be MCQ or Coding');
  }

  if (results.score === undefined || results.score === null) {
    errors.push('Score is missing');
  }

  if (results.maxScore === undefined || results.maxScore === null) {
    errors.push('Max score is missing');
  }

  if (results.score > results.maxScore) {
    errors.push('Score cannot exceed max score');
  }

  if (results.score < 0 || results.maxScore < 0) {
    errors.push('Scores cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TEST_ALREADY_COMPLETED: 'You have already completed this test.',
  TIMEOUT: 'Request timeout. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds maximum limit.',
  INVALID_FORMAT: 'Invalid file format.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  REQUIRED_FIELD: 'This field is required.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TEST_SUBMITTED: 'Test submitted successfully!',
  TEST_COMPLETED: 'Test completed successfully!',
  ANSWER_SAVED: 'Answer saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
};

// Form Field Validators
export const fieldValidators = {
  email: (value) => {
    if (!value) return 'Email is required';
    if (!validateEmail(value)) return 'Please enter a valid email';
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!validatePassword(value)) return 'Password must contain uppercase, lowercase, and numbers';
    return null;
  },

  username: (value) => {
    if (!value) return 'Username is required';
    if (!validateUsername(value)) return 'Username must be 3-20 alphanumeric characters';
    return null;
  },

  phone: (value) => {
    if (!value) return 'Phone number is required';
    if (!validatePhoneNumber(value)) return 'Please enter a valid 10-digit phone number';
    return null;
  },

  url: (value) => {
    if (!value) return 'URL is required';
    if (!validateUrl(value)) return 'Please enter a valid URL';
    return null;
  },

  required: (value, fieldName = 'This field') => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
  },

  minLength: (value, length, fieldName = 'Field') => {
    if (value && value.length < length) return `${fieldName} must be at least ${length} characters`;
    return null;
  },

  maxLength: (value, length, fieldName = 'Field') => {
    if (value && value.length > length) return `${fieldName} cannot exceed ${length} characters`;
    return null;
  },
};

// Response Validators
export const validateApiResponse = (response, expectedFields = []) => {
  const errors = [];

  if (!response) {
    errors.push('Response is empty');
    return { isValid: false, errors };
  }

  for (const field of expectedFields) {
    if (!(field in response)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Score Validation
export const validateScore = (score, maxScore) => {
  const errors = [];

  if (score === undefined || score === null) {
    errors.push('Score is required');
  }

  if (maxScore === undefined || maxScore === null) {
    errors.push('Max score is required');
  }

  if (maxScore <= 0) {
    errors.push('Max score must be greater than 0');
  }

  if (score < 0) {
    errors.push('Score cannot be negative');
  }

  if (score > maxScore) {
    errors.push('Score cannot exceed max score');
  }

  return {
    isValid: errors.length === 0,
    errors,
    percentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
  };
};
