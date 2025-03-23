import React from 'react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/constants/brand';

export type LogoVariant = 'color' | 'mono' | 'golfball' | 'greenMono' | 'greenWhite';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  darkMode?: boolean;
  hideText?: boolean;
}

const sizesMap: Record<LogoSize, string> = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
};

export function Logo({ 
  variant = 'color', 
  size = 'md', 
  className,
  darkMode = false,
  hideText = false
}: LogoProps) {
  // Determine which logo to use
  const logoSrc = React.useMemo(() => {
    switch (variant) {
      case 'mono':
        return BRAND.logos.mono;
      case 'golfball':
        return BRAND.logos.golfball;
      case 'greenMono':
        return BRAND.logos.greenMono;
      case 'greenWhite':
        return BRAND.logos.greenWhite;
      case 'color':
      default:
        return BRAND.logos.color;
    }
  }, [variant]);
  
  // Get the appropriate size class
  const sizeClass = sizesMap[size];
  
  return (
    <img 
      src={logoSrc} 
      alt={BRAND.name} 
      className={cn("w-auto", sizeClass, className)}
    />
  );
}

export default Logo; 