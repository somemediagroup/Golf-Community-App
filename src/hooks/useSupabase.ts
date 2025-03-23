import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { authService } from '@/services/api/auth';
import courseService from '@/services/api/courses';
import socialService from '@/services/api/social';
import newsService from '@/services/api/news';
import activityService from '@/services/api/activities';
import { User } from '@/types/user';

/**
 * Custom hook to provide access to Supabase client and API services
 * as well as handling authentication state
 */
export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial user session on mount
  useEffect(() => {
    async function loadUserSession() {
      setLoading(true);
      try {
        const { session, error } = await authService.getSession();
        if (error) throw error;
        
        if (session) {
          const { user: currentUser, error: userError } = await authService.getCurrentUser();
          if (userError) throw userError;
          
          if (currentUser) {
            // Fetch additional user data from profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') throw profileError;
            
            // Combine auth user with profile data
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              firstName: profileData?.first_name || '',
              lastName: profileData?.last_name || '',
              username: profileData?.username || '',
              avatar_url: profileData?.avatar_url || '',
              bio: profileData?.bio || '',
              location: profileData?.location || '',
              handicap: profileData?.handicap || undefined,
            });
          }
        }
      } catch (err) {
        console.error('Error loading user session:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    loadUserSession();
    
    // Set up authentication state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in, update the user state
          const { user: currentUser } = await authService.getCurrentUser();
          
          if (currentUser) {
            // Fetch additional user data from profiles table
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
              
            // Combine auth user with profile data
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              firstName: profileData?.first_name || '',
              lastName: profileData?.last_name || '',
              username: profileData?.username || '',
              avatar_url: profileData?.avatar_url || '',
              bio: profileData?.bio || '',
              location: profileData?.location || '',
              handicap: profileData?.handicap || undefined,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear the user state
          setUser(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign up function
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const { user, error } = await authService.signUp(email, password, userData);
      if (error) throw error;
      return { user, error: null };
    } catch (err) {
      console.error('Error signing up:', err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, error } = await authService.signIn(email, password);
      if (error) throw error;
      return { user, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (err) {
      console.error('Error signing out:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    // Authentication
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    
    // Supabase client
    supabase,
    
    // API services
    auth: authService,
    courses: courseService,
    social: socialService,
    news: newsService,
    activities: activityService,
  };
} 