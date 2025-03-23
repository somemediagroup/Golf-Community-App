import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload critical CSS
  const preloadCSS = (href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  };
  
  // Preload critical fonts
  const preloadFont = (href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };
  
  // Preload critical images
  const preloadImage = (src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  };
  
  // Add preloads for HomePage assets
  preloadCSS('/src/styles/HomePage.css');
  
  // Example font preloading - add your actual fonts
  // preloadFont('/fonts/your-main-font.woff2');
  
  // Example critical image preloading (logo, hero image)
  // preloadImage('/img/logo.png');
};

// Function to initialize performance monitoring
const initPerformanceMonitoring = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;
  
  // Basic performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const timing = performance.timing;
      const interactive = timing.domInteractive - timing.navigationStart;
      const dcl = timing.domContentLoadedEventEnd - timing.navigationStart;
      const complete = timing.domComplete - timing.navigationStart;
      
      console.log(`⚡️ Performance metrics:
        - Time to Interactive: ${interactive}ms
        - DOM Content Loaded: ${dcl}ms
        - Load Complete: ${complete}ms
      `);
      
      // Here you could send these metrics to your analytics service
    }, 0);
  });
};

// Prefetching function for anticipated routes
const prefetchRoutes = () => {
  // We'll prefetch these routes after initial load
  const routesToPrefetch = [
    '/courses',
    '/tournaments',
    '/community/partners'
  ];
  
  // Wait until idle time to prefetch
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      routesToPrefetch.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }
};

// Initialize optimizations
preloadCriticalResources();
initPerformanceMonitoring();

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Prefetch routes after app has rendered
prefetchRoutes(); 