
import React, { useEffect, useState } from 'react';
import { AnimationVariant } from '../types';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  show: boolean;
  variant?: AnimationVariant;
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  show,
  variant = 'fade',
  duration = 300,
  delay = 0,
  className,
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (show) {
      setShouldRender(true);
    } else {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [show, duration]);

  if (!shouldRender) return null;

  const getAnimationClass = () => {
    switch (variant) {
      case 'fade':
        return show ? 'animate-fade-in' : 'animate-fade-out';
      case 'slide-up':
        return show ? 'animate-slide-up' : 'animate-fade-out';
      case 'slide-down':
        return show ? 'animate-slide-down' : 'animate-fade-out';
      case 'scale':
        return show ? 'animate-scale-in' : 'animate-fade-out';
      case 'blur':
        return show ? 'animate-blur-in' : 'animate-fade-out';
      default:
        return show ? 'animate-fade-in' : 'animate-fade-out';
    }
  };

  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: delay ? `${delay}ms` : undefined,
    animationFillMode: 'both' as const,
  };

  return (
    <div className={cn(getAnimationClass(), className)} style={style}>
      {children}
    </div>
  );
};

export default AnimatedTransition;
