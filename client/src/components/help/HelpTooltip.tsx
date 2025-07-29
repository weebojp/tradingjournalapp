import React, { ReactNode, useRef, useEffect } from 'react';
import { useHelp } from '../../contexts/HelpContext';

interface HelpTooltipProps {
  children: ReactNode;
  content: string;
  id: string;
  className?: string;
  disabled?: boolean;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  children,
  content,
  id,
  className = '',
  disabled = false
}) => {
  const { isHelpMode, showTooltip, hideTooltip } = useHelp();
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!isHelpMode || disabled || !elementRef.current) return;
    showTooltip(id, content, elementRef.current);
  };

  const handleMouseLeave = () => {
    if (!isHelpMode || disabled) return;
    hideTooltip();
  };

  const handleClick = () => {
    if (!isHelpMode || disabled) return;
    // Keep tooltip visible on click in help mode
    if (elementRef.current) {
      showTooltip(id, content, elementRef.current);
    }
  };

  // Add visual indication when in help mode
  const helpModeClasses = isHelpMode && !disabled 
    ? 'help-highlight cursor-help transition-all duration-200 hover:ring-2 hover:ring-primary-400 hover:ring-opacity-50' 
    : '';

  return (
    <div
      ref={elementRef}
      className={`${helpModeClasses} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-help-id={id}
    >
      {children}
      
      {/* Help mode indicator */}
      {isHelpMode && !disabled && (
        <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

// Higher-order component for easy wrapping
export const withHelp = <P extends object>(
  Component: React.ComponentType<P>,
  helpContent: string,
  helpId: string
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const componentProps = { ...props, ref } as any;
    return (
      <HelpTooltip content={helpContent} id={helpId}>
        <Component {...componentProps} />
      </HelpTooltip>
    );
  });
  
  WrappedComponent.displayName = `withHelp(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

// Hook for programmatic help content
export const useHelpContent = () => {
  const { isHelpMode, showTooltip, hideTooltip } = useHelp();

  const showHelpFor = (element: HTMLElement, content: string, id: string) => {
    if (isHelpMode) {
      showTooltip(id, content, element);
    }
  };

  const hideHelpTooltip = () => {
    if (isHelpMode) {
      hideTooltip();
    }
  };

  return {
    isHelpMode,
    showHelpFor,
    hideHelpTooltip
  };
};