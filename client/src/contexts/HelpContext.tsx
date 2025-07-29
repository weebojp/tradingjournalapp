import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  totalSteps: number;
  isHelpMode: boolean;
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  finishOnboarding: () => void;
  toggleHelpMode: () => void;
  showTooltip: (id: string, content: string, element: HTMLElement) => void;
  hideTooltip: () => void;
}

interface TooltipData {
  id: string;
  content: string;
  position: { x: number; y: number };
  visible: boolean;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData>({
    id: '',
    content: '',
    position: { x: 0, y: 0 },
    visible: false
  });

  const totalSteps = 6; // Dashboard, Add Trade, Stats, Trades List, Filters, Help

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentStep(0);
  };

  const finishOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentStep(0);
    // Mark onboarding as completed in localStorage
    localStorage.setItem('trading-journal-onboarding-completed', 'true');
  };

  const toggleHelpMode = () => {
    setIsHelpMode(!isHelpMode);
    if (tooltip.visible) {
      hideTooltip();
    }
  };

  const showTooltip = (id: string, content: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setTooltip({
      id,
      content,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      },
      visible: true
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const value: HelpContextType = {
    isOnboardingActive,
    currentStep,
    totalSteps,
    isHelpMode,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
    finishOnboarding,
    toggleHelpMode,
    showTooltip,
    hideTooltip
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
      {/* Tooltip Portal */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs"
          style={{
            left: tooltip.position.x,
            top: tooltip.position.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="relative">
            {tooltip.content}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
            />
          </div>
        </div>
      )}
    </HelpContext.Provider>
  );
};