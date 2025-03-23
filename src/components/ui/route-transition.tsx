import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './loading-screen';

interface RouteTransitionProps {
  children: React.ReactNode;
}

export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [prevLocation, setPrevLocation] = useState('');
  
  useEffect(() => {
    // Don't show loading screen on initial load and if path is the same
    if (prevLocation !== '' && prevLocation !== location.pathname) {
      // Only show loading for protected routes
      const protectedPaths = ['/dashboard', '/courses', '/profile', '/community', '/news', '/home'];
      const isProtectedRoute = protectedPaths.some(path => 
        location.pathname.startsWith(path)
      );
      
      if (isProtectedRoute) {
        setIsLoading(true);
        
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 1000); // Minimum loading time
        
        return () => clearTimeout(timer);
      }
    }
    
    setPrevLocation(location.pathname);
  }, [location, prevLocation]);
  
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen isLoading={isLoading} key="loading-screen" />}
      </AnimatePresence>
      {children}
    </>
  );
}

export default RouteTransition; 