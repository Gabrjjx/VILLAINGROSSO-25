import React, { useState, useRef, useId } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  const getPositionClasses = () => {
    const baseClasses = "absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg backdrop-blur-sm border border-white/10";
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = "absolute w-2 h-2 bg-gray-900 border border-white/10 transform rotate-45";
    
    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0`;
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0`;
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0`;
      default:
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0`;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`${getPositionClasses()} animate-in fade-in-0 zoom-in-95 duration-200`}
          aria-hidden={!isVisible}
        >
          <div className={getArrowClasses()}></div>
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;