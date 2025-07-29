import React, { useEffect, useState } from 'react';
import { useHelp } from '../../contexts/HelpContext';
import { STRINGS } from '../../constants/strings';

interface OnboardingStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

const onboardingSteps: OnboardingStep[] = [
  {
    target: 'dashboard-header',
    title: STRINGS.WELCOME_TO_DASHBOARD,
    content: STRINGS.ONBOARDING_DASHBOARD,
    position: 'bottom'
  },
  {
    target: 'stats-cards',
    title: STRINGS.PERFORMANCE_METRICS,
    content: STRINGS.ONBOARDING_STATS,
    position: 'bottom'
  },
  {
    target: 'add-trade-button',
    title: STRINGS.ADD_TRADE,
    content: STRINGS.ONBOARDING_ADD_TRADE,
    position: 'bottom'
  },
  {
    target: 'refresh-button',
    title: STRINGS.REFRESH,
    content: STRINGS.ONBOARDING_REFRESH,
    position: 'bottom'
  },
  {
    target: 'recent-trades',
    title: STRINGS.RECENT_TRADES,
    content: STRINGS.ONBOARDING_TRADES_LIST,
    position: 'top'
  },
  {
    target: 'help-button',
    title: STRINGS.HELP,
    content: STRINGS.ONBOARDING_HELP,
    position: 'left'
  }
];

export const OnboardingTour: React.FC = () => {
  const { 
    isOnboardingActive, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipOnboarding, 
    finishOnboarding 
  } = useHelp();
  
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!isOnboardingActive || currentStep >= onboardingSteps.length) return;

    const step = onboardingSteps[currentStep];
    const element = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      const rect = element.getBoundingClientRect();
      setOverlayPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }, [isOnboardingActive, currentStep]);

  if (!isOnboardingActive || currentStep >= onboardingSteps.length) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };

    const rect = targetElement.getBoundingClientRect();
    const tooltipOffset = currentStepData.offset || { x: 0, y: 0 };
    
    switch (currentStepData.position) {
      case 'top':
        return {
          top: rect.top - 20 + tooltipOffset.y,
          left: rect.left + rect.width / 2 + tooltipOffset.x,
          transform: 'translateX(-50%) translateY(-100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + 20 + tooltipOffset.y,
          left: rect.left + rect.width / 2 + tooltipOffset.x,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 + tooltipOffset.y,
          left: rect.left - 20 + tooltipOffset.x,
          transform: 'translateX(-100%) translateY(-50%)'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2 + tooltipOffset.y,
          left: rect.right + 20 + tooltipOffset.x,
          transform: 'translateY(-50%)'
        };
      default:
        return {
          top: rect.bottom + 20 + tooltipOffset.y,
          left: rect.left + rect.width / 2 + tooltipOffset.x,
          transform: 'translateX(-50%)'
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Highlighted element outline */}
      {targetElement && (
        <div
          className="fixed z-50 border-4 border-primary-400 rounded-lg pointer-events-none"
          style={{
            left: overlayPosition.x - 4,
            top: overlayPosition.y - 4,
            width: overlayPosition.width + 8,
            height: overlayPosition.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl max-w-sm p-6"
        style={tooltipStyle}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={skipOnboarding}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {STRINGS.SKIP_TOUR}
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {STRINGS.PREVIOUS}
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={skipOnboarding}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              {STRINGS.SKIP}
            </button>
            <button
              onClick={currentStep === totalSteps - 1 ? finishOnboarding : nextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded hover:bg-primary-700"
            >
              {currentStep === totalSteps - 1 ? STRINGS.FINISH : STRINGS.NEXT}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};