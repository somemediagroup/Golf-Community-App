import { PostgrestError } from '@supabase/supabase-js';

/**
 * Helper function to handle Supabase query responses
 * Standardizes error handling and response format
 */
export function handleQueryResponse<T>(
  data: T | null, 
  error: PostgrestError | null,
  errorMessage: string = 'Database query failed'
): { data: T | null; error: Error | null } {
  if (error) {
    console.error(`${errorMessage}:`, error);
    return { 
      data: null, 
      error: new Error(error.message || errorMessage) 
    };
  }
  
  return { data, error: null };
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string | Date, format: 'short' | 'long' = 'short'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (format === 'short') {
    return date.toLocaleDateString();
  } else {
    return date.toLocaleString();
  }
}

/**
 * Generate a display name from a user object
 */
export function getUserDisplayName(user: { 
  firstName?: string; 
  lastName?: string; 
  username?: string;
  first_name?: string;
  last_name?: string;
} | null): string {
  if (!user) return 'Anonymous';
  
  // Try to use firstName and lastName fields
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  // Try to use first_name and last_name fields (Supabase naming)
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  // Fall back to username
  if (user.username) {
    return user.username;
  }
  
  return 'Anonymous';
}

/**
 * Format a handicap for display
 */
export function formatHandicap(handicap: number | null | undefined): string {
  if (handicap === null || handicap === undefined) return 'N/A';
  
  return handicap.toFixed(1);
}

/**
 * Format a price range for display
 */
export function formatPriceRange(range: string): string {
  switch (range) {
    case '$':
      return 'Budget-friendly';
    case '$$':
      return 'Moderate';
    case '$$$':
      return 'Premium';
    case '$$$$':
      return 'Luxury';
    default:
      return range;
  }
}

/**
 * Helper to create slugs from strings
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
} 