import React from 'react';
import { useHelp } from '../../contexts/HelpContext';
import { STRINGS } from '../../constants/strings';

interface HelpButtonProps {
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  variant = 'icon', 
  className = '' 
}) => {
  const { isHelpMode, toggleHelpMode, startOnboarding } = useHelp();

  const baseClasses = 'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `${baseClasses} px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium`;
      case 'secondary':
        return `${baseClasses} px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium`;
      case 'icon':
      default:
        return `${baseClasses} p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900`;
    }
  };

  const handleClick = () => {
    toggleHelpMode();
  };

  const handleStartTour = (e: React.MouseEvent) => {
    e.stopPropagation();
    startOnboarding();
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className={`${getVariantClasses()} ${className}`}
          title={isHelpMode ? STRINGS.EXIT_HELP : STRINGS.HELP_MODE}
        >
          <svg 
            className={`w-5 h-5 ${isHelpMode ? 'text-primary-600' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </button>
        
        {isHelpMode && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{STRINGS.HELP_MODE_ACTIVE}</h4>
                <p className="text-xs text-gray-600">
                  {STRINGS.HOVER_FOR_TIPS}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleStartTour}
                  className="flex-1 px-3 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  {STRINGS.START_TOUR}
                </button>
                <button
                  onClick={handleClick}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  {STRINGS.EXIT_HELP}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${getVariantClasses()} ${className}`}
    >
      {variant === 'primary' || variant === 'secondary' ? (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isHelpMode ? STRINGS.EXIT_HELP : STRINGS.NEED_HELP}
        </>
      ) : null}
    </button>
  );
};