import supabase from '@/lib/supabase';
import { User } from '@/types/user';

/**
 * Authentication service for the Golf Community App
 * Handles user signup, login, password reset, and session management
 */
export const authService = {
  /**
   * Register a new user
   */
  async signUp(email: string, password: string, userData: Partial<User>) {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return { user: null, error: authError };

    // If auth user created successfully, create the profile record
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          created_at: new Date(),
        });

      if (profileError) return { user: null, error: profileError };

      return { user: authData.user, error: null };
    }

    return { user: null, error: 'Failed to create user' };
  },

  /**
   * Log in an existing user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { session: data.session, user: data.user, error };
  },

  /**
   * Log out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current user session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  /**
   * Request a password reset email
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  /**
   * Update the user's password (after reset)
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { user: data.user, error };
  },

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}; 