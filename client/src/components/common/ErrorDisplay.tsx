import React from 'react';
import { ErrorHandler, ErrorInfo, ErrorAction } from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  context?: any;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  context,
  className = '',
  variant = 'card',
  showDetails = false
}) => {
  const [showFullDetails, setShowFullDetails] = React.useState(false);
  
  const errorInfo = error ? ErrorHandler.parseError(error) : null;
  
  // Log the error
  React.useEffect(() => {
    if (errorInfo) {
      ErrorHandler.logError(errorInfo, context);
    }
  }, [errorInfo, context]);
  
  if (!error || !errorInfo) return null;

  // Build default actions
  const defaultActions: ErrorAction[] = [];
  
  if (onRetry) {
    defaultActions.push(ErrorHandler.getRetryAction(onRetry));
  }
  
  if (errorInfo.severity === 'high' || errorInfo.severity === 'critical') {
    defaultActions.push(ErrorHandler.getRefreshAction());
    defaultActions.push(ErrorHandler.getContactSupportAction());
  }

  const actions = errorInfo.actions || defaultActions;

  const getSeverityColor = () => {
    switch (errorInfo.severity) {
      case 'low':
        return 'blue';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'red';
    }
  };

  const getSeverityIcon = () => {
    switch (errorInfo.severity) {
      case 'low':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'high':
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const renderInline = () => (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className={`text-${getSeverityColor()}-600`}>
        {getSeverityIcon()}
      </div>
      <span className={`text-${getSeverityColor()}-800`}>
        {errorInfo.userMessage}
      </span>
      {actions.length > 0 && (
        <button
          onClick={actions[0].action}
          className={`text-${getSeverityColor()}-600 hover:text-${getSeverityColor()}-800 font-medium`}
        >
          {actions[0].label}
        </button>
      )}
    </div>
  );

  const renderBanner = () => (
    <div className={`border-l-4 border-${getSeverityColor()}-400 bg-${getSeverityColor()}-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`text-${getSeverityColor()}-400`}>
            {getSeverityIcon()}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm text-${getSeverityColor()}-800`}>
            {errorInfo.userMessage}
          </p>
          {errorInfo.guidance && (
            <p className={`mt-1 text-sm text-${getSeverityColor()}-700`}>
              {errorInfo.guidance}
            </p>
          )}
          {actions.length > 0 && (
            <div className="mt-3 flex space-x-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`text-sm font-medium text-${getSeverityColor()}-600 hover:text-${getSeverityColor()}-500`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`text-${getSeverityColor()}-600`}>
            {getSeverityIcon()}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {errorInfo.userMessage}
          </h3>
          
          {errorInfo.guidance && (
            <p className="text-gray-600 text-sm mb-4">
              {errorInfo.guidance}
            </p>
          )}

          {/* Error Details (for developers) */}
          {showDetails && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center"
              >
                Technical Details
                <svg
                  className={`w-4 h-4 ml-1 transform transition-transform ${showFullDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFullDetails && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                  <div><strong>Error Code:</strong> {errorInfo.code}</div>
                  <div><strong>Message:</strong> {errorInfo.message}</div>
                  <div><strong>Severity:</strong> {errorInfo.severity}</div>
                  {context && (
                    <div><strong>Context:</strong> {JSON.stringify(context, null, 2)}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((action, index) => {
                const getButtonClasses = () => {
                  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
                  
                  switch (action.variant) {
                    case 'primary':
                      return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`;
                    case 'danger':
                      return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
                    case 'secondary':
                    default:
                      return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`;
                  }
                };

                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={getButtonClasses()}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'inline':
      return renderInline();
    case 'banner':
      return renderBanner();
    case 'card':
    default:
      return renderCard();
  }
};

// Hook for easy error state management
export const useErrorState = () => {
  const [error, setError] = React.useState<any>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleError = (error: any, context?: any) => {
    setError(error);
    console.error('Error occurred:', error, context);
  };

  const clearError = () => {
    setError(null);
    setIsRetrying(false);
  };

  const retry = async (retryFn: () => Promise<void>) => {
    try {
      setIsRetrying(true);
      setError(null);
      await retryFn();
    } catch (newError) {
      setError(newError);
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry
  };
};