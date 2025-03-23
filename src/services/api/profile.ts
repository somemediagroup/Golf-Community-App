import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/env';
import { User } from './supabase';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Profile update interface
export interface ProfileUpdateData {
  first_name: string;
  last_name: string;
  username: string;
  bio?: string;
  location?: string;
  favorite_course?: string;
  handicap?: number | null;
  avatar_url?: string;
}

const profileService = {
  /**
   * Update user profile
   * @param userId The user ID
   * @param profileData The updated profile data
   * @returns The updated user profile or error
   */
  async updateProfile(
    userId: string,
    profileData: ProfileUpdateData
  ): Promise<{ success: boolean; data?: User; error?: any }> {
    try {
      // Validate the data before updating
      if (!profileData.first_name || !profileData.last_name) {
        return {
          success: false,
          error: 'First name and last name are required',
        };
      }

      if (!profileData.username || profileData.username.length < 3) {
        return {
          success: false,
          error: 'Username must be at least 3 characters',
        };
      }

      // Parse handicap value
      let handicapValue = null;
      if (profileData.handicap !== undefined && profileData.handicap !== null) {
        handicapValue = typeof profileData.handicap === 'string' 
          ? parseFloat(profileData.handicap) 
          : profileData.handicap;
        
        if (isNaN(handicapValue) || handicapValue < 0 || handicapValue > 54) {
          return {
            success: false,
            error: 'Handicap must be a number between 0 and 54',
          };
        }
      }

      // Check if username is already taken (excluding current user)
      if (profileData.username) {
        const { data: existingUser, error: usernameCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', profileData.username)
          .neq('id', userId)
          .single();

        if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
          console.error('Error checking username availability:', usernameCheckError);
        }

        if (existingUser) {
          return {
            success: false,
            error: 'Username is already taken',
          };
        }
      }

      // Update the profile in the database
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username,
          bio: profileData.bio || null,
          location: profileData.location || null,
          favorite_course: profileData.favorite_course || null,
          handicap: handicapValue,
          avatar_url: profileData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while updating your profile',
      };
    }
  },

  /**
   * Upload avatar image
   * @param userId The user ID
   * @param file The image file to upload
   * @returns The URL of the uploaded avatar or error
   */
  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: any }> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Only image files are allowed',
        };
      }

      // Maximum file size (2MB)
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return {
          success: false,
          error: 'Image size should not exceed 2MB',
        };
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        return { success: false, error: error.message };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Unexpected error uploading avatar:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while uploading your avatar',
      };
    }
  },

  /**
   * Get user profile by ID
   * @param userId The user ID
   * @returns The user profile or error
   */
  async getProfileById(
    userId: string
  ): Promise<{ success: boolean; data?: User; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching the profile',
      };
    }
  },
};

export default profileService; 