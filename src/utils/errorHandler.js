// API Error Handler Utility
export class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error) => {
  // Network error
  if (!window.navigator.onLine) {
    return {
      message: 'No internet connection. Please check your network.',
      code: 'NETWORK_ERROR',
      status: 0,
      retry: true,
    };
  }

  // Fetch error
  if (error instanceof TypeError) {
    return {
      message: 'Network error. Please try again.',
      code: 'FETCH_ERROR',
      status: 0,
      retry: true,
    };
  }

  // API error response
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return {
          message: error.message || 'Bad request. Please check your input.',
          code: 'BAD_REQUEST',
          status: 400,
          retry: false,
        };
      case 401:
        return {
          message: 'Session expired. Please login again.',
          code: 'UNAUTHORIZED',
          status: 401,
          retry: false,
          clearStorage: true,
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          status: 403,
          retry: false,
        };
      case 404:
        return {
          message: 'Resource not found.',
          code: 'NOT_FOUND',
          status: 404,
          retry: false,
        };
      case 409:
        return {
          message: 'This resource already exists.',
          code: 'CONFLICT',
          status: 409,
          retry: false,
        };
      case 429:
        return {
          message: 'Too many requests. Please wait before trying again.',
          code: 'RATE_LIMITED',
          status: 429,
          retry: true,
          retryAfter: 60,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          status: error.status,
          retry: true,
        };
      default:
        return {
          message: error.message || 'An error occurred. Please try again.',
          code: 'UNKNOWN_ERROR',
          status: error.status,
          retry: true,
        };
    }
  }

  // Generic error
  return {
    message: error.message || 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
    status: null,
    retry: false,
  };
};

// Test-specific error handler
export const handleTestError = (error, testType) => {
  const baseError = handleApiError(error);

  const testSpecificMessages = {
    MCQ: {
      SUBMISSION_FAILED: 'Failed to submit MCQ test. Please try again.',
      LOAD_FAILED: 'Failed to load MCQ questions. Please refresh the page.',
      EVALUATE_FAILED: 'Failed to evaluate answers. Please try again.',
    },
    Coding: {
      SUBMISSION_FAILED: 'Failed to submit coding test. Please try again.',
      LOAD_FAILED: 'Failed to load programming questions. Please refresh the page.',
      COMPILE_FAILED: 'Code compilation failed. Please check your code.',
      RUNTIME_ERROR: 'Runtime error. Please check your code.',
      TIMEOUT: 'Code execution timeout. Your code may be in an infinite loop.',
    },
  };

  if (testSpecificMessages[testType] && baseError.code in testSpecificMessages[testType]) {
    baseError.message = testSpecificMessages[testType][baseError.code];
  }

  return baseError;
};

// Form validation error formatter
export const formatValidationErrors = (errors) => {
  if (!errors || errors.length === 0) return '';

  if (Array.isArray(errors)) {
    return errors.join('. ');
  }

  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('. ');
  }

  return String(errors);
};

// Toast notification helper
export const showNotification = (message, type = 'info', duration = 3000) => {
  // This would typically integrate with a toast library like react-toastify
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Example implementation:
  // toast.notify({
  //   message,
  //   type,
  //   duration,
  // });
};

// Error logger
export const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN',
    status: error.status || null,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog);
  }

  // In production, you might send this to a logging service
  // sendToLoggingService(errorLog);

  return errorLog;
};

// Session error handler
export const handleSessionError = (error) => {
  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('userID');

    // Redirect to login
    window.location.href = '/#/LoginPage';

    return {
      message: 'Your session has expired. Please login again.',
      redirect: '/LoginPage',
    };
  }

  return null;
};

// Retry logic helper
export const retryOperation = async (operation, maxRetries = 3, delayMs = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if it's a client error (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
};

// Validation error handler
export const handleValidationError = (validationResult) => {
  if (!validationResult || validationResult.isValid) {
    return null;
  }

  return {
    message: 'Validation failed',
    errors: validationResult.errors || [],
    warnings: validationResult.warnings || [],
  };
};

// Test submission error handler
export const handleTestSubmissionError = (error, testType) => {
  const baseError = handleTestError(error, testType);

  // Check if it's a test completion blocking error
  if (error.code === 'TEST_ALREADY_COMPLETED') {
    return {
      ...baseError,
      message: `You have already completed this ${testType} test. You cannot retake it.`,
      blocking: true,
    };
  }

  return baseError;
};

// File upload error handler
export const handleFileUploadError = (error, fileType) => {
  const baseError = handleApiError(error);

  if (error.code === 'FILE_TOO_LARGE') {
    return {
      ...baseError,
      message: `The file is too large. Maximum size is 5MB.`,
    };
  }

  if (error.code === 'INVALID_FORMAT') {
    return {
      ...baseError,
      message: `Invalid ${fileType} format. Please upload a valid file.`,
    };
  }

  return baseError;
};

export default {
  ApiError,
  handleApiError,
  handleTestError,
  formatValidationErrors,
  showNotification,
  logError,
  handleSessionError,
  retryOperation,
  handleValidationError,
  handleTestSubmissionError,
  handleFileUploadError,
};
