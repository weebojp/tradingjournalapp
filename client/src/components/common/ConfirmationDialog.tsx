import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClasses = () => {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (confirmVariant) {
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`;
      case 'primary':
        return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`;
      default:
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
    }
  };

  const getIconColor = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'primary':
        return 'text-primary-600';
      default:
        return 'text-red-600';
    }
  };

  const getIcon = () => {
    switch (confirmVariant) {
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'danger':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'primary':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        />

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 ${getIconColor()}`}>
              {getIcon()}
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`w-full sm:w-auto sm:ml-3 ${getConfirmButtonClasses()}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>
            
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="mt-3 w-full inline-flex justify-center px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing confirmation dialog state
export const useConfirmationDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm?: () => void;
    loading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    loading: false
  });

  const showConfirmation = (config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }) => {
    setDialogState({
      ...config,
      isOpen: true,
      loading: false
    });
  };

  const hideConfirmation = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const setLoading = (loading: boolean) => {
    setDialogState(prev => ({ ...prev, loading }));
  };

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      isOpen={dialogState.isOpen}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      confirmVariant={dialogState.confirmVariant}
      onConfirm={dialogState.onConfirm || (() => {})}
      onCancel={hideConfirmation}
      loading={dialogState.loading}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    setLoading,
    ConfirmationDialog: ConfirmationDialogComponent
  };
};