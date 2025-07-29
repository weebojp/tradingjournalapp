import React from 'react';
import { LoadingState } from '../../hooks/useLoadingState';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { STRINGS } from '../../constants/strings';

interface EnhancedLoadingProps {
  loadingState: LoadingState;
  showNetworkStatus?: boolean;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'progress' | 'skeleton';
  className?: string;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  loadingState,
  showNetworkStatus = true,
  showProgress = true,
  size = 'medium',
  variant = 'progress',
  className = ''
}) => {
  const networkStatus = useNetworkStatus();

  if (!loadingState.isLoading) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      case 'medium':
      default:
        return 'w-8 h-8';
    }
  };

  const renderSpinner = () => (
    <div className="flex items-center justify-center">
      <div className={`${getSizeClasses()} border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  );

  const renderProgress = () => {
    const currentStep = loadingState.steps[loadingState.currentStep];
    
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {currentStep ? currentStep.label : STRINGS.LOADING}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(loadingState.overallProgress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingState.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Step details */}
        {showProgress && loadingState.steps.length > 1 && (
          <div className="space-y-2">
            {loadingState.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                {/* Step indicator */}
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${step.status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : step.status === 'error'
                    ? 'bg-red-100 text-red-600'
                    : step.status === 'loading'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {step.status === 'completed' ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.status === 'error' ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : step.status === 'loading' ? (
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label and progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm truncate ${
                      step.status === 'error' ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {step.label}
                    </span>
                    {step.status === 'loading' && (
                      <span className="text-xs text-gray-500">
                        {step.progress}%
                      </span>
                    )}
                  </div>
                  
                  {step.error && (
                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Network status warning */}
        {showNetworkStatus && !networkStatus.isOnline && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">No Internet Connection</p>
              <p className="text-xs text-red-600">Please check your connection and try again</p>
            </div>
          </div>
        )}

        {/* Slow connection warning */}
        {showNetworkStatus && networkStatus.isOnline && networkStatus.isSlowConnection && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Slow Connection</p>
              <p className="text-xs text-yellow-600">Loading may take longer than usual</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {variant === 'spinner' && renderSpinner()}
      {variant === 'progress' && renderProgress()}
      {variant === 'skeleton' && renderSkeleton()}
    </div>
  );
};

// Simple loading spinner for quick use
export const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large'; className?: string }> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      case 'medium':
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <div className={`${getSizeClasses()} border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
};