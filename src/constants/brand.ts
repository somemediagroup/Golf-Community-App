/**
 * Brand constants for use across the application.
 * This file centralizes all brand-related information.
 */

export const BRAND = {
  name: 'Golf Community',
  shortName: 'GC',
  
  // Brand colors
  colors: {
    primary: '#448460',
    darkGreen: '#1F1E1F',
    white: '#FBFCFB',
    lightGreen: '#65B786',
    darkGrey: '#1F1E1F',
    error: '#E53935',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  
  // Logo paths
  logos: {
    color: '/GC-logo-2color.svg',
    mono: '/GC-logo-mono.svg',
    greenMono: '/GC-logo-green-mono.svg',
    greenWhite: '/GC-logo-green-white.svg',
    golfball: '/GC-logo-golfball-2color.svg',
    favicon: '/favicon.ico',
  },
  
  // Social media links
  social: {
    twitter: 'https://twitter.com/golfcommunity',
    facebook: 'https://facebook.com/golfcommunity',
    instagram: 'https://instagram.com/golfcommunity',
  },
  
  // Contact information
  contact: {
    email: 'info@golfcommunity.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fairway Drive, Golf City, GC 12345',
  },
  
  // Copyright info
  copyright: `© ${new Date().getFullYear()} Golf Community. All rights reserved.`,
};

export default BRAND; 