/**
 * User type definitions for the Golf Community App
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  location?: string;
  handicap?: number;
  avatar_url?: string;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  is_verified?: boolean;
  is_active?: boolean;
}

/**
 * Basic user profile information for display purposes
 */
export interface UserProfile extends Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'username' | 'avatar_url'> {
  handicap?: number;
  location?: string;
}

/**
 * User registration form data
 */
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * User login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy_settings?: {
    profile_visibility: 'public' | 'friends' | 'private';
    activity_visibility: 'public' | 'friends' | 'private';
    score_visibility: 'public' | 'friends' | 'private';
  };
  theme_preference?: 'light' | 'dark' | 'system';
  language?: string;
} 