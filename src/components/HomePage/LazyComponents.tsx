import React, { lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="error-container p-4 bg-red-50 border border-red-200 rounded-lg text-center">
    <h3 className="text-lg font-medium text-[#1F1E1F] mb-2">Something went wrong</h3>
    <p className="text-sm text-gray-700 mb-3">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-[#448460] text-[#FBFCFB] rounded-md hover:bg-[#448460]/90 transition-colors"
    >
      Try again
    </button>
  </div>
);

// Loading placeholder component
interface LoadingPlaceholderProps {
  height?: string;
  count?: number;
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ height = "100px", count = 1 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div 
          key={`loading-${i}`} 
          className="loading-placeholder bg-gray-200 animate-pulse rounded" 
          style={{ height, width: '100%', marginBottom: i !== count - 1 ? '0.5rem' : 0 }}
        />
      ))}
    </>
  );
};

// Path references to actual components
const teeTimesSectionPath = () => import('./TeeTimesSection').then(module => ({ default: module.TeeTimesSection }));
const tournamentsSectionPath = () => import('./TournamentsSection').then(module => ({ default: module.TournamentsSection }));
const coursesSectionPath = () => import('./CoursesSection').then(module => ({ default: module.CoursesSection }));
const partnersSectionPath = () => import('./PartnersSection').then(module => ({ default: module.PartnersSection }));

// Lazy loaded components with fallbacks
export const TeeTimesSection = lazy(teeTimesSectionPath);
export const TournamentsSection = lazy(tournamentsSectionPath);
export const CoursesSection = lazy(coursesSectionPath);
export const PartnersSection = lazy(partnersSectionPath);

// Wrap component with error boundary and suspense
export const withErrorBoundary = (Component: React.ComponentType<any>, fallbackHeight = "300px") => {
  return (props: any) => (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <React.Suspense fallback={<LoadingPlaceholder height={fallbackHeight} />}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
}; 