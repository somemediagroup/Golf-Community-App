import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  placeholderSrc?: string;
  onLoad?: () => void;
  sizes?: string;
  quality?: number;
}

/**
 * OptimizedImage component for better performance
 * - Supports progressive loading with blur-up effect
 * - Handles lazy loading with IntersectionObserver
 * - Provides responsive images with srcSet and sizes
 * - Optimizes image quality and format based on context
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false,
  placeholder = 'empty',
  placeholderSrc,
  onLoad,
  sizes = '100vw',
  quality = 75
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate different sizes for responsive images
  const generateSrcSet = (imgSrc: string): string => {
    if (!imgSrc) return '';
    
    // Don't modify if already a data URL
    if (imgSrc.startsWith('data:')) return imgSrc;
    
    // Handle URLs with existing query parameters
    const baseUrl = imgSrc.split('?')[0];
    const hasQuery = imgSrc.includes('?');
    const queryPrefix = hasQuery ? '&' : '?';
    
    // If Unsplash or similar service that supports width parameters
    if (imgSrc.includes('unsplash.com') || imgSrc.includes('images.unsplash.com')) {
      return `
        ${baseUrl}${queryPrefix}w=400&q=${quality} 400w,
        ${baseUrl}${queryPrefix}w=800&q=${quality} 800w,
        ${baseUrl}${queryPrefix}w=1200&q=${quality} 1200w
      `;
    }
    
    // For other URLs that might not support width parameters
    return imgSrc;
  };

  // Get optimized src with quality
  const getOptimizedSrc = (imgSrc: string): string => {
    if (!imgSrc || imgSrc.startsWith('data:')) return imgSrc;
    
    // Handle URLs with existing query parameters
    const hasQuery = imgSrc.includes('?');
    const queryPrefix = hasQuery ? '&' : '?';
    
    // Add quality parameter if possible
    if (imgSrc.includes('unsplash.com') || imgSrc.includes('images.unsplash.com')) {
      return `${imgSrc}${queryPrefix}q=${quality}`;
    }
    
    return imgSrc;
  };

  // Handle image load completion
  const handleImageLoaded = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    // Skip if priority image or no window (SSR)
    if (priority || typeof window === 'undefined' || !imgRef.current) {
      // For priority images, load immediately
      if (priority) {
        setCurrentSrc(src);
      }
      return;
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new IntersectionObserver
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Load the full image when it comes into view
        setCurrentSrc(src);
        
        // Stop observing once loaded
        if (observerRef.current && imgRef.current) {
          observerRef.current.unobserve(imgRef.current);
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      }
    }, {
      rootMargin: '200px' // Start loading a bit before it comes into view
    });

    // Start observing
    observerRef.current.observe(imgRef.current);

    // Clean up observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [priority, src]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        overflow: 'hidden',
        ...style,
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {/* Placeholder with blur effect while loading */}
      {placeholder === 'blur' && !isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 blur-sm"
          style={{ filter: 'blur(10px)', opacity: isLoaded ? 0 : 1 }}
          aria-hidden="true"
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={getOptimizedSrc(currentSrc)}
        srcSet={generateSrcSet(currentSrc)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleImageLoaded}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          objectFit: 'cover',
        }}
      />
    </div>
  );
} 