// Enhanced error handling with user-friendly messages and guidance

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  guidance?: string;
  actions?: ErrorAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Error code mappings to user-friendly messages
const ERROR_MAPPINGS: Record<string, Omit<ErrorInfo, 'code'>> = {
  // Network errors
  'NETWORK_ERROR': {
    message: 'Network request failed',
    userMessage: 'Unable to connect to the server',
    guidance: 'Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.',
    severity: 'medium'
  },
  'TIMEOUT_ERROR': {
    message: 'Request timeout',
    userMessage: 'The request took too long to complete',
    guidance: 'This usually happens when the server is busy. Please wait a moment and try again.',
    severity: 'medium'
  },
  'CORS_ERROR': {
    message: 'CORS policy error',
    userMessage: 'Security policy prevented the request',
    guidance: 'This is typically a configuration issue. Please contact support if this persists.',
    severity: 'high'
  },

  // Authentication errors
  'AUTH_FAILED': {
    message: 'Authentication failed',
    userMessage: 'Invalid username or password',
    guidance: 'Please check your credentials and try again. Make sure Caps Lock is off.',
    severity: 'medium'
  },
  'TOKEN_EXPIRED': {
    message: 'Authentication token expired',
    userMessage: 'Your session has expired',
    guidance: 'Please log in again to continue using the application.',
    severity: 'medium'
  },
  'UNAUTHORIZED': {
    message: 'Unauthorized access',
    userMessage: 'You do not have permission to perform this action',
    guidance: 'Please contact an administrator if you believe you should have access.',
    severity: 'high'
  },

  // Validation errors
  'VALIDATION_ERROR': {
    message: 'Input validation failed',
    userMessage: 'Please check your input and try again',
    guidance: 'Make sure all required fields are filled out correctly and follow the specified format.',
    severity: 'low'
  },
  'DUPLICATE_ENTRY': {
    message: 'Duplicate entry detected',
    userMessage: 'This record already exists',
    guidance: 'You may be trying to create a duplicate trade. Please check your existing trades.',
    severity: 'medium'
  },
  'INVALID_FORMAT': {
    message: 'Invalid data format',
    userMessage: 'One or more fields contain invalid data',
    guidance: 'Please check that dates, numbers, and other fields are in the correct format.',
    severity: 'medium'
  },

  // Trading-specific errors
  'INVALID_TRADE_DATA': {
    message: 'Invalid trade data',
    userMessage: 'The trade information provided is not valid',
    guidance: 'Please verify all trade details including symbol, price, and position size.',
    severity: 'medium'
  },
  'TRADE_NOT_FOUND': {
    message: 'Trade not found',
    userMessage: 'The requested trade could not be found',
    guidance: 'The trade may have been deleted or moved. Please refresh the page and try again.',
    severity: 'medium'
  },
  'POSITION_ALREADY_CLOSED': {
    message: 'Position already closed',
    userMessage: 'This trade position has already been closed',
    guidance: 'You cannot modify a trade that has already been closed. Please refresh your data.',
    severity: 'medium'
  },

  // Server errors
  'SERVER_ERROR': {
    message: 'Internal server error',
    userMessage: 'Something went wrong on our end',
    guidance: 'We are working to fix this issue. Please try again in a few minutes.',
    severity: 'high'
  },
  'SERVICE_UNAVAILABLE': {
    message: 'Service temporarily unavailable',
    userMessage: 'The service is temporarily unavailable',
    guidance: 'We are performing maintenance or experiencing high traffic. Please try again later.',
    severity: 'high'
  },
  'RATE_LIMIT_EXCEEDED': {
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests in a short time',
    guidance: 'Please wait a moment before trying again. This helps us keep the service running smoothly.',
    severity: 'medium'
  },

  // Data errors
  'DATA_CORRUPTION': {
    message: 'Data integrity error',
    userMessage: 'Data inconsistency detected',
    guidance: 'Please refresh the page and try again. If the problem persists, contact support.',
    severity: 'high'
  },
  'INSUFFICIENT_DATA': {
    message: 'Insufficient data for operation',
    userMessage: 'Not enough data to complete this action',
    guidance: 'You may need to add more trades before using this feature.',
    severity: 'low'
  }
};

// Default error for unknown errors
const DEFAULT_ERROR: Omit<ErrorInfo, 'code'> = {
  message: 'Unknown error occurred',
  userMessage: 'An unexpected error occurred',
  guidance: 'Please try refreshing the page. If the problem continues, contact support.',
  severity: 'medium'
};

export class ErrorHandler {
  static parseError(error: any): ErrorInfo {
    let errorCode = 'UNKNOWN_ERROR';
    let originalMessage = 'Unknown error';

    // Extract error information from different error types
    if (error instanceof Error) {
      originalMessage = error.message;
      
      // Check for specific error patterns
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorCode = 'NETWORK_ERROR';
      } else if (error.message.includes('timeout')) {
        errorCode = 'TIMEOUT_ERROR';
      } else if (error.message.includes('CORS')) {
        errorCode = 'CORS_ERROR';
      } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        errorCode = 'UNAUTHORIZED';
      } else if (error.message.includes('validation')) {
        errorCode = 'VALIDATION_ERROR';
      } else if (error.message.includes('duplicate')) {
        errorCode = 'DUPLICATE_ENTRY';
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        errorCode = 'TRADE_NOT_FOUND';
      } else if (error.message.includes('server error') || error.message.includes('500')) {
        errorCode = 'SERVER_ERROR';
      }
    } else if (typeof error === 'string') {
      originalMessage = error;
      if (error.includes('Network')) errorCode = 'NETWORK_ERROR';
    } else if (error?.response) {
      // Handle axios-style errors
      const status = error.response.status;
      originalMessage = error.response.data?.message || error.message || 'Request failed';
      
      switch (status) {
        case 400:
          errorCode = 'VALIDATION_ERROR';
          break;
        case 401:
          errorCode = 'AUTH_FAILED';
          break;
        case 403:
          errorCode = 'UNAUTHORIZED';
          break;
        case 404:
          errorCode = 'TRADE_NOT_FOUND';
          break;
        case 409:
          errorCode = 'DUPLICATE_ENTRY';
          break;
        case 429:
          errorCode = 'RATE_LIMIT_EXCEEDED';
          break;
        case 500:
          errorCode = 'SERVER_ERROR';
          break;
        case 503:
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        default:
          errorCode = 'UNKNOWN_ERROR';
      }
    }

    const mappedError = ERROR_MAPPINGS[errorCode] || DEFAULT_ERROR;

    return {
      code: errorCode,
      message: originalMessage,
      userMessage: mappedError.userMessage,
      guidance: mappedError.guidance,
      actions: mappedError.actions,
      severity: mappedError.severity
    };
  }

  static getRetryAction(onRetry: () => void): ErrorAction {
    return {
      label: 'Try Again',
      action: onRetry,
      variant: 'primary'
    };
  }

  static getRefreshAction(): ErrorAction {
    return {
      label: 'Refresh Page',
      action: () => window.location.reload(),
      variant: 'secondary'
    };
  }

  static getContactSupportAction(): ErrorAction {
    return {
      label: 'Contact Support',
      action: () => {
        // In a real app, this would open a support ticket or email
        window.open('mailto:support@tradingjournal.com?subject=Error Report', '_blank');
      },
      variant: 'secondary'
    };
  }

  static logError(errorInfo: ErrorInfo, context?: any) {
    // Enhanced error logging
    console.error('Error Details:', {
      code: errorInfo.code,
      message: errorInfo.message,
      userMessage: errorInfo.userMessage,
      severity: errorInfo.severity,
      timestamp: new Date().toISOString(),
      context
    });

    // In production, you would send this to your logging service
    // Example: LoggingService.logError(errorInfo, context);
  }
}