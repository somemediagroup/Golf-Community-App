import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  Flag,
  CircleUser,
  LocateIcon,
  MapPin,
  Settings,
  Users,
  Loader2,
  RefreshCw,
  Award,
  Trophy,
  BarChart2,
  Calendar,
  ChevronDownIcon,
  Plus,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UserSearch from "@/features/profile/UserSearch";
import FriendList from "@/features/profile/FriendList";
import FriendRequests from "@/features/profile/FriendRequests";
import supabase from "@/lib/supabase";
import ScoreCardHistory from "@/features/profile/ScoreCardHistory";
import ScoreCardEntry from "@/features/profile/ScoreCardEntry";
import HoleByHoleScoreCard from "@/features/profile/HoleByHoleScoreCard";
import PlayedCoursesHistory from "@/features/profile/PlayedCoursesHistory";
import { cacheService, CACHE_EXPIRATION } from "@/services/cacheService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams } from 'react-router-dom';
import EditProfileForm, { ProfileFormValues } from "@/features/profile/EditProfileForm";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/config/env";
import { profile as profileService } from "@/services/api";

// Constants for cache keys
const CACHE_KEYS = {
  PROFILE: 'user_profile',
  STATS: 'user_stats',
  LAST_FETCH_ATTEMPT: 'last_fetch_attempt'
};

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  handicap?: number;
  location?: string;
  favorite_course?: string;
  joined_date?: string;
  played_courses?: number;
  rounds_played?: number;
}

interface UserStats {
  played_courses: number;
  rounds_played: number;
}

// Add an error boundary wrapper component
const FeatureErrorBoundary = ({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  return hasError ? <>{fallback}</> : <>{children}</>;
};

// Create a feature error state component
const FeatureErrorState = ({ message, retryFn }: { message: string, retryFn?: () => void }) => (
  <div className="bg-red-50 text-[#1F1E1F] p-4 rounded-lg border border-red-200 my-2">
    <p className="font-medium text-red-800">{message}</p>
    {retryFn && (
      <Button
        variant="outline"
        size="sm"
        onClick={retryFn}
        className="mt-2 bg-white text-red-700 border-red-300 hover:bg-red-100"
      >
        <RefreshCw className="mr-2 h-3 w-3" /> Retry
      </Button>
    )}
  </div>
);

// Create a loading skeleton component for the tabs content
const TabContentSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg w-full"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

// Enhance LazyLoadTab to be more robust and preload content
const LazyLoadTab = ({ children, isVisible }: { children: React.ReactNode, isVisible: boolean }) => {
  const [hasRendered, setHasRendered] = useState(false);
  
  // Mark this tab as having been rendered once it becomes visible
  useEffect(() => {
    if (isVisible) {
      // Always mark as rendered when tab becomes visible
      setHasRendered(true);
    }
  }, [isVisible]);
  
  // Preload content more aggressively
  useEffect(() => {
    // Set a very short timeout to preload all tabs
    // This ensures that even on a slow network, the tab content will at least
    // start loading shortly after the component mounts
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Either show the children if the tab is visible or has been rendered before
  // This prevents content from disappearing when switching tabs
  return (
    <Suspense fallback={<TabContentSkeleton />}>
      {(isVisible || hasRendered) ? children : <TabContentSkeleton />}
    </Suspense>
  );
};

// Add this function before the ProfilePage component
const useSessionCache = <T,>(key: string, defaultValue: T | null = null) => {
  const getFromCache = (): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Error reading from session storage:", e);
      return defaultValue;
    }
  };

  const saveToCache = (value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to session storage:", e);
    }
  };

  return { getFromCache, saveToCache };
};

// Add this function to combine profile data with mock data when needed
const getTabContentData = (tab: string) => {
  // Always use mock data if we're offline or have errors
  if (usingCachedData || !navigator.onLine) {
    // Return appropriate mock data based on the tab
    switch(tab) {
      case 'stats':
        return {
          mockPerformanceData,
          mockRecentActivity,
        };
      case 'score-history':
        return {
          mockScoreHistory,
        };
      case 'courses':
        return {
          mockPlayedCourses,
        };
      case 'friends':
        return {
          mockFriends,
        };
      default:
        return {};
    }
  }
  
  // Return real data if we have it (or fall back to mock data)
  switch(tab) {
    case 'stats':
      return {
        performanceData: mockPerformanceData, // Replace with real API data when available
        recentActivity: mockRecentActivity,
      };
    case 'score-history':
      return {
        scoreHistory: mockScoreHistory,
      };
    case 'courses':
      return {
        playedCourses: mockPlayedCourses,
      };
    case 'friends':
      return {
        friends: mockFriends,
      };
    default:
      return {};
  }
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("stats");
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showRoundDetails, setShowRoundDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [featureErrors, setFeatureErrors] = useState<Record<string, string>>({});
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const hasAttemptedInitialLoad = useRef(false);
  
  // Get session-based cache functions
  const profileSessionCache = useSessionCache<UserProfile>(`${CACHE_KEYS.PROFILE}_${user?.id}`);
  
  // Function to clear a feature error
  const clearFeatureError = useCallback((feature: string) => {
    setFeatureErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[feature];
      return newErrors;
    });
  }, []);
  
  // Add function to track feature errors (but don't show toast for profile errors if we have cached data)
  const handleFeatureError = useCallback((feature: string, errorMessage: string, showToast = true) => {
    setFeatureErrors(prev => ({
      ...prev,
      [feature]: errorMessage
    }));
    
    if (showToast) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfileWithOfflineSupport = async () => {
      if (!user?.id) return;
      
      // First, immediately load from session cache if available
      const sessionProfile = profileSessionCache.getFromCache();
      if (sessionProfile) {
        console.log("Using session cached profile data");
        setProfile(sessionProfile);
        setLoading(false);
        
        // If we're offline, show the cached data notice and return
        if (!navigator.onLine) {
          setUsingCachedData(true);
          return;
        }
      }
      
      // Then try to load fresh data
      try {
        hasAttemptedInitialLoad.current = true;
        
        // Keep showing loading state if we didn't have cached data
        if (!sessionProfile) {
          setLoading(true);
        }

        // Use Promise.all to fetch profile and stats in parallel
        const [profileResult, statsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, first_name, last_name, email, avatar_url, bio, handicap, location, favorite_course, joined_date')
            .eq('id', user.id)
            .single(),
            
          supabase
            .from('user_stats')
            .select('played_courses, rounds_played')
            .eq('user_id', user.id)
            .single()
        ]);
        
        if (profileResult.error) {
          throw new Error(profileResult.error.message);
        }
        
        // Handle "no rows returned" error gracefully for stats
        const userStats = statsResult.error && statsResult.error.code === 'PGRST116' 
          ? { played_courses: 0, rounds_played: 0 } 
          : statsResult.error 
            ? null 
            : statsResult.data;
        
        // Combine profile and stats data
        const combinedProfile = {
          ...profileResult.data,
          played_courses: userStats?.played_courses || 0,
          rounds_played: userStats?.rounds_played || 0
        };
        
        setProfile(combinedProfile);
        setLoading(false);
        setError(false);
        setUsingCachedData(false);
        
        // Update caches
        cacheService.setData(
          `${CACHE_KEYS.PROFILE}_${user.id}`, 
          combinedProfile, 
          CACHE_EXPIRATION.MEDIUM
        );
        
        profileSessionCache.saveToCache(combinedProfile);
        
        // Clear feature errors related to profile
        clearFeatureError('profile');
        
        // Preload avatar image
        if (combinedProfile.avatar_url) {
          const img = new Image();
          img.fetchPriority = 'high';
          img.src = combinedProfile.avatar_url;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        
        // Only show error if we don't have ANY profile data
        if (!profile && !sessionProfile) {
          setError("Failed to load your profile. Please try again.");
        } else {
          // Use cached data but show notice
          setUsingCachedData(true);
        }
        
        setLoading(false);
        
        // If we have at least session data, use it and don't show the error state
        if (sessionProfile && !profile) {
          setProfile(sessionProfile);
        }
        
        // Try to use localStorage as a last resort
        if (!profile && !sessionProfile) {
          const fallbackUser = localStorage.getItem('golf_community_user');
          if (fallbackUser) {
            try {
              const parsedUser = JSON.parse(fallbackUser);
              const fallbackProfile = {
                id: parsedUser.id,
                username: parsedUser.username || '',
                first_name: parsedUser.firstName || '',
                last_name: parsedUser.lastName || '',
                email: parsedUser.email || '',
                avatar_url: parsedUser.avatar_url,
                handicap: parsedUser.handicap,
                played_courses: 0,
                rounds_played: 0
              };
              
              setProfile(fallbackProfile);
              profileSessionCache.saveToCache(fallbackProfile);
              setUsingCachedData(true);
            } catch (e) {
              console.error("Error parsing fallback user data:", e);
            }
          }
        }
      }
    };
    
    loadProfileWithOfflineSupport();
  }, [user?.id, clearFeatureError]);
  
  // Memoized function to fetch user profile that will only re-render when user.id changes
  const fetchUserProfile = useCallback(async (isRetry = false, showLoadingState = true) => {
    if (!user?.id) return;
    
    // Mark that we've attempted to load data
    hasAttemptedInitialLoad.current = true;
    
    // Check for cached data first (on non-retry requests)
    const cachedProfile = cacheService.getData<UserProfile>(`${CACHE_KEYS.PROFILE}_${user.id}`);
    if (!isRetry && cachedProfile) {
      setProfile(cachedProfile);
      
      // Also save to session storage for even faster future loads
      profileSessionCache.saveToCache(cachedProfile);
      
      if (loading) setLoading(false);
      if (error) setError(false);
      
      // No need to show "using cached data" if this is just normal loading
      setUsingCachedData(false);
      
      // Still refresh in background without showing loading state
      refreshProfileInBackground();
      return;
    }
    
    // Prevent too many refetch attempts in short succession
    const now = Date.now();
    const lastAttempt = parseInt(localStorage.getItem(CACHE_KEYS.LAST_FETCH_ATTEMPT) || '0');
    
    // If this is not a manual retry and last attempt was less than 10 seconds ago, use cached data
    if (!isRetry && now - lastAttempt < 10000 && cachedProfile) {
      setProfile(cachedProfile);
      setUsingCachedData(true);
      setLoading(false);
      // Don't set an error if we have data to show
      return;
    }
    
    // Update last fetch attempt time
    localStorage.setItem(CACHE_KEYS.LAST_FETCH_ATTEMPT, now.toString());
    
    try {
      if (showLoadingState && !isRetry) setLoading(true);
      if (isRetry) setIsRetrying(true);
      
      // Clear any existing error
      setError(false);
      setUsingCachedData(false);
      
      // Add a small timeout for retries to prevent rapid reconnection attempts
      if (isRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Use Promise.all to fetch profile and stats in parallel
      const [profileResult, statsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, first_name, last_name, email, avatar_url, bio, handicap, location, favorite_course, joined_date')
          .eq('id', user.id)
          .single(),
          
        supabase
          .from('user_stats')
          .select('played_courses, rounds_played')
          .eq('user_id', user.id)
          .single()
      ]);
      
      if (profileResult.error) {
        throw new Error(profileResult.error.message);
      }
      
      // Handle "no rows returned" error gracefully for stats
      const userStats = statsResult.error && statsResult.error.code === 'PGRST116' 
        ? { played_courses: 0, rounds_played: 0 } 
        : statsResult.error 
          ? null 
          : statsResult.data;
      
      // Combine profile and stats data
      const combinedProfile = {
        ...profileResult.data,
        played_courses: userStats?.played_courses || 0,
        rounds_played: userStats?.rounds_played || 0
      };
      
      setProfile(combinedProfile);
      setLoading(false);
      setIsRetrying(false);
      
      // Update both caches
      cacheService.setData(
        `${CACHE_KEYS.PROFILE}_${user.id}`, 
        combinedProfile, 
        CACHE_EXPIRATION.MEDIUM
      );
      
      // Also save to session storage for faster loads
      profileSessionCache.saveToCache(combinedProfile);
      
      // Reset retry count on success
      if (isRetry) setRetryCount(0);
      
      // Clear all feature errors related to profile
      clearFeatureError('profile');
      clearFeatureError('friends');
      clearFeatureError('scores');
      clearFeatureError('courses');

      // Add priority flag to avatar images
      if (profileResult.data?.avatar_url) {
        const img = new Image();
        img.fetchPriority = 'high';
        img.src = profileResult.data.avatar_url;
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      
      // Only update loading state if we asked to show it
      if (showLoadingState) {
        setLoading(false);
      }
      
      setIsRetrying(false);
      
      // Check if we already have profile data 
      if (profile) {
        // If we already have data, don't show the error to the user
        // Just mark that we're using cached data
        setUsingCachedData(true);
        // Don't set the error state if we have data to display
      } else {
        // Only show error if we don't have existing data
        setError("Failed to load your profile. Please try again.");
        
        // Fallback to localStorage data if available on error
        const fallbackUser = localStorage.getItem('golf_community_user');
        if (fallbackUser) {
          try {
            const parsedUser = JSON.parse(fallbackUser);
            const fallbackProfile = {
              id: parsedUser.id,
              username: parsedUser.username || '',
              first_name: parsedUser.firstName || '',
              last_name: parsedUser.lastName || '',
              email: parsedUser.email || '',
              avatar_url: parsedUser.avatar_url,
              handicap: parsedUser.handicap,
              played_courses: 0,
              rounds_played: 0
            };
            
            setProfile(fallbackProfile);
            
            // Save this basic profile to session cache too
            profileSessionCache.saveToCache(fallbackProfile);
            
            setUsingCachedData(true);
            
            // Toast only if we're using fallback data
            toast({
              title: "Using cached profile data",
              description: "We're having trouble connecting to the server. Using your last saved profile.",
              variant: "default"
            });
          } catch (e) {
            console.error("Error parsing fallback user data:", e);
          }
        } else if (!isRetry) {
          // Only show toast for initial load failures, not retries
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again.",
            variant: "destructive"
          });
        }
      }
    }
  }, [user?.id, toast, retryCount, clearFeatureError, profile, error, loading]);
  
  // Handle the retry button click
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchUserProfile(true);
  }, [fetchUserProfile]);
  
  // Function to refresh profile in background without loading state
  const refreshProfileInBackground = async () => {
    // Don't show loading state for background refresh
    fetchUserProfile(false, false);
  };

  // Add more aggressive auto-retry logic for network errors
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>;
    
    // Auto-retry on network/connection errors after 5 seconds
    if (error && typeof error === 'string' && error.includes("Failed to load your profile")) {
      retryTimer = setTimeout(() => {
        console.log("Auto-retrying after network error...");
        handleRetry();
      }, 5000);
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [error, handleRetry]);

  // Update network status monitoring to be more reliable
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network connection restored. Retrying profile fetch...");
      setUsingCachedData(false); // Clear the "using cached data" state
      refreshProfileInBackground();
    };
    
    const handleOffline = () => {
      console.log("Network connection lost. Using cached data...");
      setUsingCachedData(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check on component mount
    if (!navigator.onLine) {
      setUsingCachedData(true);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load profile data when component mounts
  useEffect(() => {
    if (user?.id && !hasAttemptedInitialLoad.current) {
      fetchUserProfile();
    }
  }, [user?.id, fetchUserProfile]);

  // Periodically refresh data in the background
  useEffect(() => {
    // Refresh data every 5 minutes while the page is open
    const refreshInterval = setInterval(() => {
      if (user?.id) {
        console.log("Performing background data refresh");
        refreshProfileInBackground();
      }
    }, 300000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user?.id]);

  // Create a more informative cached data notice
  const CachedDataNotice = () => {
    if (!usingCachedData) return null;
    
    return (
      <div className="fixed bottom-4 right-4 max-w-md bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-yellow-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">Using cached profile data</h3>
            <p className="mt-1 text-xs text-gray-500">
              We're having trouble connecting to the server.
              Using your last saved profile.
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none"
                onClick={handleRetry}
              >
                {isRetrying ? 'Retrying...' : 'Retry Now'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                onClick={() => setUsingCachedData(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Preload avatars for better performance
  useEffect(() => {
    if (profile?.avatar_url) {
      const img = new Image();
      img.src = profile.avatar_url;
    }
  }, [profile?.avatar_url]);

  // Replace error display with a more helpful version
  const ProfileErrorState = () => (
    <div className="bg-[#FBFCFB] rounded-lg shadow p-6 text-center border border-gray-200">
      <div className="bg-red-50 p-6 rounded-lg mb-6 border border-red-200 max-w-lg mx-auto">
        <h3 className="text-lg font-semibold text-red-800">Error</h3>
        <p className="text-red-700 mb-4">Failed to load your profile. Please try again.</p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              'Retry Now'
            )}
          </Button>
          
          <div className="text-sm text-gray-600 mt-4">
            <p className="mb-2">If the problem persists, try these steps:</p>
            <ul className="text-left list-disc ml-6 space-y-1">
              <li>Check your internet connection</li>
              <li>Clear your browser cache and refresh</li>
              <li>Try again in a few minutes</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Add mock data for charts (inside the ProfilePage component, before the return statement)
  const [mockPerformanceData, setMockPerformanceData] = useState([
    { name: "Jan", score: 82, par: 72 },
    { name: "Feb", score: 78, par: 72 },
    { name: "Mar", score: 79, par: 72 },
    { name: "Apr", score: 76, par: 72 },
    { name: "May", score: 75, par: 72 },
    { name: "Jun", score: 74, par: 72 },
  ]);

  const [mockRecentActivity, setMockRecentActivity] = useState([
    {
      id: 1,
      course: "Pine Valley Golf Club",
      date: "2023-06-15",
      score: 78,
      par: 72,
      type: "Full Round",
    },
    {
      id: 2,
      course: "Oakmont Country Club",
      date: "2023-06-08",
      score: 82,
      par: 71,
      type: "Full Round",
    },
    {
      id: 3,
      course: "Pinehurst No. 2",
      date: "2023-05-30",
      score: 80,
      par: 72,
      type: "Full Round",
    },
  ]);

  // Add mockup data for score history and courses if real implementation is pending
  const [mockScoreHistory, setMockScoreHistory] = useState([
    {
      id: 1,
      date: "2023-06-15",
      course: "Pine Valley Golf Club",
      score: 78,
      par: 72,
      result: "+6",
      notes: "Great front nine, struggled on back nine with putting.",
    },
    {
      id: 2,
      date: "2023-06-08",
      course: "Oakmont Country Club",
      score: 82,
      par: 71,
      result: "+11",
      notes: "Windy conditions made the course challenging.",
    },
    {
      id: 3,
      date: "2023-05-30",
      course: "Pinehurst No. 2",
      score: 80,
      par: 72,
      result: "+8",
      notes: "Hit 12 greens in regulation, but struggled with sand traps.",
    },
  ]);

  const [mockPlayedCourses, setMockPlayedCourses] = useState([
    {
      id: 1,
      name: "Pine Valley Golf Club",
      location: "Pine Valley, NJ",
      timesPlayed: 5,
      lastPlayed: "2023-06-15",
      avgScore: 78,
      bestScore: 74,
      image: "https://source.unsplash.com/random/800x600/?golf,course,1",
    },
    {
      id: 2,
      name: "Oakmont Country Club",
      location: "Oakmont, PA",
      timesPlayed: 3,
      lastPlayed: "2023-06-08",
      avgScore: 82,
      bestScore: 79,
      image: "https://source.unsplash.com/random/800x600/?golf,course,2",
    },
    {
      id: 3,
      name: "Pinehurst No. 2",
      location: "Pinehurst, NC",
      timesPlayed: 4,
      lastPlayed: "2023-05-30",
      avgScore: 80,
      bestScore: 77,
      image: "https://source.unsplash.com/random/800x600/?golf,course,3",
    },
  ]);

  // Add mock data for friends
  const [mockFriends, setMockFriends] = useState([
    {
      id: 1,
      name: "John Smith",
      username: "johnsmith",
      location: "San Francisco, CA",
      handicap: 12,
      rounds_played: 32,
      mutual_rounds: 5,
      avatar: "https://source.unsplash.com/random/100x100/?golf,person,1",
      status: "online",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      username: "sarahj",
      location: "Austin, TX",
      handicap: 8,
      rounds_played: 45,
      mutual_rounds: 3,
      avatar: "https://source.unsplash.com/random/100x100/?golf,person,2",
      status: "offline",
    },
    {
      id: 3,
      name: "Mike Wilson",
      username: "mikew",
      location: "Chicago, IL",
      handicap: 15,
      rounds_played: 18,
      mutual_rounds: 0,
      avatar: "https://source.unsplash.com/random/100x100/?golf,person,3",
      status: "online",
    },
    {
      id: 4,
      name: "Jessica Lee",
      username: "jlee",
      location: "Portland, OR",
      handicap: 10,
      rounds_played: 28,
      mutual_rounds: 2,
      avatar: "https://source.unsplash.com/random/100x100/?golf,person,4",
      status: "offline",
    },
  ]);

  // Create wrapper components for feature errors
  const FriendListWrapper = ({ userId }: { userId?: string }) => {
    if (!userId) return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500">Please sign in to view friends</p>
      </div>
    );
    
    return (
      <FeatureErrorBoundary
        fallback={
          <FeatureErrorState 
            message={featureErrors.friends || "Failed to load friends list"} 
            retryFn={() => {
              clearFeatureError('friends');
              // Add retry logic here
            }}
          />
        }
      >
        {featureErrors.friends ? (
          <div className="py-4">
            <FeatureErrorState 
              message={featureErrors.friends} 
              retryFn={() => clearFeatureError('friends')}
            />
            <div className="mt-6">
              {/* Simplified friend items when error */}
              <div className="grid grid-cols-2 gap-3">
                {mockFriends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className="flex items-center bg-white rounded-lg p-3 border border-gray-200 transition-all hover:shadow-md cursor-pointer"
                    role="button"
                    onClick={() => {
                      // Navigate to friend profile
                      console.log(`Navigate to profile of ${friend.username}`);
                    }}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                    <div className="ml-2 flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{friend.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            {/* Simplified friend items UI */}
            <div className="grid grid-cols-2 gap-3">
              {mockFriends.map((friend) => (
                <div 
                  key={friend.id} 
                  className="flex items-center bg-white rounded-lg p-3 border border-gray-200 transition-all hover:shadow-md"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                        {friend.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  </div>
                  <div 
                    className="ml-2 flex-1 min-w-0 cursor-pointer" 
                    role="button"
                    onClick={() => {
                      // Navigate to friend profile
                      console.log(`Navigate to profile of ${friend.username}`);
                    }}
                  >
                    <p className="font-medium text-sm truncate">{friend.name}</p>
                    <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                  </div>
                  <div className="flex space-x-1 ml-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 rounded-full" 
                      title="Message"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Message ${friend.name}`);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#448460]">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </FeatureErrorBoundary>
    );
  };

  // Add preload hint for the active tab data
  useEffect(() => {
    // Preload data for the active tab
    if (activeTab === "stats" && profile) {
      // Add preload hints for stats tab
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = 'https://source.unsplash.com/random/800x600/?golf,course,1';
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [activeTab, profile]);

  // Handle profile save
  const handleSaveProfile = async (data: ProfileFormValues) => {
    try {
      if (!userId) {
        throw new Error("User ID is required for profile update");
      }

      // Convert handicap string to number if present
      const handicapValue = data.handicap ? parseFloat(data.handicap) : undefined;
      
      // Use profile service to update the user profile
      const result = await profileService.updateProfile(userId, {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        bio: data.bio,
        location: data.location,
        favorite_course: data.favorite_course,
        handicap: handicapValue,
        avatar_url: data.avatar_url
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }
      
      // Update the local profile state
      if (profile && result.data) {
        setProfile({
          ...profile,
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          username: result.data.username,
          bio: result.data.bio,
          location: result.data.location,
          favorite_course: result.data.favorite_course,
          handicap: result.data.handicap,
          avatar_url: result.data.avatar_url
        });
        
        // Also update in cache for offline support
        profileSessionCache.saveToCache({
          ...profile,
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          username: result.data.username,
          bio: result.data.bio,
          location: result.data.location,
          favorite_course: result.data.favorite_course,
          handicap: result.data.handicap,
          avatar_url: result.data.avatar_url
        });
        
        cacheService.setData(
          `${CACHE_KEYS.PROFILE}_${userId}`, 
          {
            ...profile,
            first_name: result.data.first_name,
            last_name: result.data.last_name,
            username: result.data.username,
            bio: result.data.bio,
            location: result.data.location,
            favorite_course: result.data.favorite_course,
            handicap: result.data.handicap,
            avatar_url: result.data.avatar_url
          },
          CACHE_EXPIRATION.MEDIUM
        );
      }
      
      // Show success toast
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
      
      // Trigger a background refresh of profile data
      refreshProfileInBackground();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add useEffect to ensure activeTab is always valid
  useEffect(() => {
    // If no tab is selected or an invalid tab is selected, default to stats
    if (!activeTab || !["stats", "score-history", "courses", "friends"].includes(activeTab)) {
      setActiveTab("stats");
    }
  }, [activeTab]);

  // Immediately after the component declaration, add this useEffect to ensure stats tab loads properly
  useEffect(() => {
    // Force stats tab to be active on initial page load
    const initialRender = { current: true };
    
    if (initialRender.current) {
      setActiveTab("stats");
      initialRender.current = false;
    }
  }, []);
  
  // Add an effect to preload images for faster rendering
  useEffect(() => {
    // Preload critical images to avoid flickering
    if (profile?.avatar_url) {
      const img = new Image();
      img.src = profile.avatar_url;
      img.fetchPriority = 'high';
    }
    
    // Preload mock data images
    const preloadUrls = [
      "https://source.unsplash.com/random/100x100/?golf,person,1",
      "https://source.unsplash.com/random/100x100/?golf,person,2",
      "https://source.unsplash.com/random/800x600/?golf,course,1"
    ];
    
    preloadUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [profile?.avatar_url]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar/Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            {error && !profile && !usingCachedData ? (
              <ProfileErrorState />
            ) : (
              <div className="bg-[#FBFCFB] rounded-lg shadow overflow-hidden border border-gray-200">
                {/* Cover Photo */}
                <div className="h-32 bg-gradient-to-r from-[#448460]/40 to-[#448460]" />
                
                {/* User Info */}
                <div className="p-6 relative">
                  {/* Avatar */}
                  <div className="absolute -top-12 left-6 ring-4 ring-[#FBFCFB] rounded-full">
                    {loading ? (
                      <Skeleton className="h-24 w-24 rounded-full" />
                    ) : (
                      <Avatar className="h-24 w-24 border-2 border-[#FBFCFB] bg-[#448460]">
                        <AvatarImage 
                          src={profile?.avatar_url} 
                          alt={profile?.username || 'User'}
                          loading="eager" 
                          fetchPriority="high"
                          className="transition-opacity duration-200 opacity-100"
                          onLoad={(e) => {
                            // Add animation when image loads
                            (e.target as HTMLImageElement).classList.add('opacity-100');
                          }}
                          style={{ opacity: 0 }} // Start with opacity 0
                        />
                        <AvatarFallback className="text-xl text-[#FBFCFB] bg-[#448460]">
                          {profile?.first_name?.[0] || ''}
                          {profile?.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  <div className="mt-14">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-[#1F1E1F]">
                          {profile?.first_name || ''} {profile?.last_name || ''}
                        </h2>
                        <p className="text-gray-600 flex items-center gap-1">
                          @{profile?.username || ''}
                          {profile?.handicap !== undefined && (
                            <Badge variant="outline" className="ml-2 bg-[#448460]/10 text-[#448460] border-[#448460]/20">
                              Handicap: {profile?.handicap}
                            </Badge>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Edit Profile Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-6 right-6 border-[#448460] text-[#448460] hover:bg-[#448460] hover:text-[#FBFCFB]"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                {/* User Details */}
                <div className="px-6 pb-6 pt-2">
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile?.bio && (
                        <p className="text-sm text-[#1F1E1F]">
                          {profile.bio}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {profile?.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-[#448460]" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                        
                        {profile?.favorite_course && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Flag className="h-4 w-4 mr-2 text-[#448460]" />
                            <span>Favorite course: {profile.favorite_course}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2 text-[#448460]" />
                          <span>Joined {formatJoinDate(profile?.joined_date)}</span>
                        </div>
                      </div>
                      
                      <Separator className="bg-gray-200" />
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#1F1E1F]">{profile?.played_courses || 0}</p>
                          <p className="text-sm text-gray-600">Courses Played</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#1F1E1F]">{profile?.rounds_played || 0}</p>
                          <p className="text-sm text-gray-600">Rounds Played</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Add the CachedDataNotice component here */}
            {usingCachedData && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-orange-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">Using cached profile data</p>
                    <p className="text-xs text-orange-700 mt-0.5">We're having trouble connecting to the server.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-3 h-8 border-orange-400 text-orange-700 hover:bg-orange-100"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      'Retry'
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Social/Friends Section */}
            <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-[#1F1E1F] flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#448460]" /> Friends
              </h3>
              
              <Tabs defaultValue="friends" className="w-full">
                <TabsList className="w-full mb-4 bg-gray-100">
                  <TabsTrigger value="friends" className="flex-1 data-[state=active]:bg-[#448460] data-[state=active]:text-[#FBFCFB]">
                    Friends
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex-1 data-[state=active]:bg-[#448460] data-[state=active]:text-[#FBFCFB]">
                    Requests
                  </TabsTrigger>
                  <TabsTrigger value="find" className="flex-1 data-[state=active]:bg-[#448460] data-[state=active]:text-[#FBFCFB]">
                    Find
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="friends">
                  <FriendListWrapper userId={profile?.id} />
                </TabsContent>
                
                <TabsContent value="requests">
                  <FeatureErrorBoundary
                    fallback={
                      <FeatureErrorState 
                        message={featureErrors.requests || "Failed to load friend requests"} 
                        retryFn={() => clearFeatureError('requests')}
                      />
                    }
                  >
                    {/* Replace with mock UI if needed */}
                    <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p className="text-gray-500">No friend requests</p>
                    </div>
                  </FeatureErrorBoundary>
                </TabsContent>
                
                <TabsContent value="find">
                  <FeatureErrorBoundary
                    fallback={
                      <FeatureErrorState 
                        message={featureErrors.search || "Failed to load user search"} 
                        retryFn={() => clearFeatureError('search')}
                      />
                    }
                  >
                    {/* Replace with mock UI if needed */}
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for golfers..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#448460] focus:border-transparent"
                        />
                        <Button
                          size="sm"
                          className="absolute right-1 top-1 bg-[#448460] text-white h-8"
                        >
                          Search
                        </Button>
                      </div>
                      
                      {/* Suggested users */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Suggested Users</h4>
                        <div className="space-y-2">
                          {mockFriends.map((friend) => (
                            <div key={friend.id} className="flex items-center p-2 border border-gray-200 rounded">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={friend.avatar} alt={friend.name} />
                                <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                                  {friend.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{friend.name}</p>
                                <p className="text-xs text-gray-500">@{friend.username}</p>
                              </div>
                              <Button size="sm" variant="outline" className="h-8 border-[#448460] text-[#448460]">
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FeatureErrorBoundary>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full border-b border-gray-200 bg-[#FBFCFB] flex justify-between p-0 h-auto">
                <TabsTrigger 
                  value="stats" 
                  className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460]"
                >
                  Stats
                </TabsTrigger>
                <TabsTrigger 
                  value="score-history" 
                  className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460]"
                >
                  Score History
                </TabsTrigger>
                <TabsTrigger 
                  value="courses" 
                  className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460]"
                >
                  Courses
                </TabsTrigger>
                <TabsTrigger 
                  value="friends" 
                  className="flex-1 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460]"
                >
                  Friends
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="pt-6">
                <LazyLoadTab isVisible={activeTab === "stats"}>
                  {/* Performance Metrics Card */}
                  <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-[#1F1E1F]">Performance Metrics</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-[#448460]/10 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#1F1E1F]">
                          {profile?.handicap !== undefined ? profile.handicap : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">Handicap</p>
                      </div>
                      <div className="bg-[#448460]/10 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#1F1E1F]">{profile?.played_courses || 0}</p>
                        <p className="text-sm text-gray-600">Courses Played</p>
                      </div>
                      <div className="bg-[#448460]/10 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#1F1E1F]">{profile?.rounds_played || 0}</p>
                        <p className="text-sm text-gray-600">Rounds Played</p>
                      </div>
                      <div className="bg-[#448460]/10 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#1F1E1F]">
                          {profile?.joined_date 
                            ? formatJoinDate(profile.joined_date).split(" ")[1] 
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">Member Since</p>
                      </div>
                    </div>
                    
                    {/* Score Trend Chart */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium mb-3 text-[#1F1E1F]">Score Trend</h4>
                      <div className="h-64 w-full bg-white rounded-lg border border-gray-200 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={mockPerformanceData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" />
                            <YAxis stroke="#666" />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: "#FBFCFB", 
                                border: "1px solid #e0e0e0" 
                              }} 
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#448460"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="par"
                              stroke="#1F1E1F"
                              strokeDasharray="5 5"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Skills Analysis */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium mb-3 text-[#1F1E1F]">Skills Analysis</h4>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Driving Accuracy</span>
                              <span className="text-sm font-medium text-[#1F1E1F]">65%</span>
                            </div>
                            <Progress value={65} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Greens in Regulation</span>
                              <span className="text-sm font-medium text-[#1F1E1F]">58%</span>
                            </div>
                            <Progress value={58} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Scrambling</span>
                              <span className="text-sm font-medium text-[#1F1E1F]">45%</span>
                            </div>
                            <Progress value={45} className="h-2 bg-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Putting Average</span>
                              <span className="text-sm font-medium text-[#1F1E1F]">1.8</span>
                            </div>
                            <Progress value={72} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Sand Saves</span>
                              <span className="text-sm font-medium text-[#1F1E1F]">40%</span>
                            </div>
                            <Progress value={40} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Drive Distance</span>
                              <span className="text-sm font-medium text-[#1F1E1F]">250 yds</span>
                            </div>
                            <Progress value={68} className="h-2 bg-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity Card */}
                  <div className="mt-6 bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-[#1F1E1F]">Recent Activity</h3>
                    
                    {mockRecentActivity && mockRecentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {mockRecentActivity.map((activity) => (
                          <Card key={activity.id} className="border border-gray-200">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-md">{activity.course}</CardTitle>
                                  <CardDescription>
                                    {new Date(activity.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })} • {activity.type}
                                  </CardDescription>
                                </div>
                                <Badge 
                                  className={
                                    activity.score <= activity.par 
                                      ? "bg-green-100 text-green-800 border-green-200" 
                                      : activity.score <= activity.par + 5
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : "bg-red-100 text-red-800 border-red-200"
                                  }
                                >
                                  {activity.score > activity.par ? "+" + (activity.score - activity.par) : "E"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Score: {activity.score}</span>
                                <span className="text-gray-500">Par: {activity.par}</span>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0 h-auto text-[#448460]"
                                  onClick={() => setActiveTab("score-history")}
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <div className="flex justify-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-[#FBFCFB] text-[#448460] border-[#448460] hover:bg-[#448460] hover:text-[#FBFCFB]"
                            onClick={() => setActiveTab("score-history")}
                          >
                            View All Activity
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                        <div className="text-center">
                          <CircleUser className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">Your recent golf activity will appear here</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4 bg-[#FBFCFB] text-[#448460] border-[#448460] hover:bg-[#448460] hover:text-[#FBFCFB]"
                            onClick={() => setActiveTab("score-history")}
                          >
                            Log a Round
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </LazyLoadTab>
              </TabsContent>
              
              <TabsContent value="score-history" className="pt-6">
                {profile ? (
                  <>
                    <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-[#1F1E1F]">Score History</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-[#FBFCFB] text-[#448460] border-[#448460] hover:bg-[#448460] hover:text-[#FBFCFB]"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Filter by Date
                        </Button>
                      </div>
                      
                      {mockScoreHistory && mockScoreHistory.length > 0 ? (
                        <div className="space-y-4">
                          {mockScoreHistory.map((round) => (
                            <Card key={round.id} className="border border-gray-200">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-md">{round.course}</CardTitle>
                                    <CardDescription>
                                      {new Date(round.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </CardDescription>
                                  </div>
                                  <Badge 
                                    className={
                                      round.score <= round.par 
                                        ? "bg-green-100 text-green-800 border-green-200" 
                                        : round.score <= round.par + 5
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                        : "bg-red-100 text-red-800 border-red-200"
                                    }
                                  >
                                    {round.result}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                  <div className="flex items-center">
                                    <Award className="h-4 w-4 mr-2 text-[#448460]" />
                                    <span className="text-sm text-gray-700">Score: {round.score}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Flag className="h-4 w-4 mr-2 text-[#448460]" />
                                    <span className="text-sm text-gray-700">Par: {round.par}</span>
                                  </div>
                                </div>
                                {round.notes && (
                                  <div className="text-sm text-gray-600 mt-2 border-t border-gray-100 pt-2">
                                    <p className="italic">{round.notes}</p>
                                  </div>
                                )}
                                <div className="flex justify-end mt-2">
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 h-auto text-[#448460]"
                                  >
                                    View Full Scorecard
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No scores recorded yet</h3>
                          <p className="text-gray-500 mb-4">Start tracking your golf performance by logging your rounds</p>
                        </div>
                      )}
                      
                      <div className="flex justify-center mt-6 gap-2">
                        <ScoreCardEntry userId={profile.id} onSuccess={refreshProfileInBackground} />
                        <HoleByHoleScoreCard userId={profile.id} onScoreSubmit={refreshProfileInBackground} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-[#1F1E1F]">Score History</h3>
                    <div className="bg-gray-100 p-6 rounded-lg border border-dashed border-gray-300 text-center">
                      <p className="text-gray-500">No score history available</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="courses" className="pt-6">
                {profile ? (
                  <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-[#1F1E1F]">Courses Played</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-[#FBFCFB] text-[#1F1E1F] border-gray-300 hover:bg-gray-100"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Filter by Location
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-[#FBFCFB] text-[#1F1E1F] border-gray-300 hover:bg-gray-100"
                        >
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Sort by Score
                        </Button>
                      </div>
                    </div>
                    
                    {mockPlayedCourses && mockPlayedCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockPlayedCourses.map((course) => (
                          <Card key={course.id} className="overflow-hidden border border-gray-200">
                            <div className="h-40 w-full overflow-hidden">
                              <img 
                                src={course.image} 
                                alt={course.name} 
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                              />
                            </div>
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-md">{course.name}</CardTitle>
                              <CardDescription className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 inline" />
                                {course.location}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="grid grid-cols-2 gap-4 mb-2">
                                <div className="text-sm">
                                  <span className="text-gray-500">Times Played:</span>
                                  <span className="ml-1 font-medium">{course.timesPlayed}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Last Played:</span>
                                  <span className="ml-1 font-medium">
                                    {new Date(course.lastPlayed).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Avg Score:</span>
                                  <span className="ml-1 font-medium">{course.avgScore}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Best Score:</span>
                                  <span className="ml-1 font-medium text-[#448460]">{course.bestScore}</span>
                                </div>
                              </div>
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0 h-auto text-[#448460]"
                                >
                                  View Course Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Flag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No courses played yet</h3>
                        <p className="text-gray-500 mb-4">Start exploring golf courses and check-in when you play</p>
                      </div>
                    )}
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        className="bg-[#448460] hover:bg-[#448460]/90 text-[#FBFCFB]"
                      >
                        Explore Courses
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-[#1F1E1F]">Courses Played</h3>
                    <div className="bg-gray-100 p-6 rounded-lg border border-dashed border-gray-300 text-center">
                      <p className="text-gray-500">No course history available</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="friends" className="pt-6">
                <div className="bg-[#FBFCFB] rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#1F1E1F]">Friends</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-[#FBFCFB] text-[#1F1E1F] border-gray-300 hover:bg-gray-100"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Find Friends
                      </Button>
                    </div>
                  </div>
                  
                  {/* Friend cards with simplified layout */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockFriends.map((friend) => (
                      <div 
                        key={friend.id} 
                        className="flex flex-col items-center bg-white rounded-lg pt-4 pb-2 px-3 border border-gray-200 transition-all hover:shadow-md"
                      >
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => {
                            // Navigate to friend profile
                            console.log(`Navigate to profile of ${friend.username}`);
                          }}
                        >
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback className="bg-[#448460] text-[#FBFCFB] text-lg">
                              {friend.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div 
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          ></div>
                        </div>
                        
                        <div className="mt-2 text-center">
                          <p 
                            className="font-medium text-sm cursor-pointer" 
                            onClick={() => {
                              // Navigate to friend profile
                              console.log(`Navigate to profile of ${friend.username}`);
                            }}
                          >
                            {friend.name}
                          </p>
                          <p className="text-xs text-gray-500">@{friend.username}</p>
                        </div>
                        
                        <div className="flex justify-center space-x-2 mt-3 w-full">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2 text-xs border-[#448460] text-[#448460] hover:bg-[#448460] hover:text-white"
                          >
                            Message
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2 text-xs border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Suggested Friends Section */}
                  <div className="mt-6 bg-[#448460]/5 rounded-lg p-4 border border-[#448460]/10">
                    <h4 className="font-medium text-[#1F1E1F] mb-3">Suggested Friends</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center bg-white p-3 rounded-md border border-gray-200">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="https://source.unsplash.com/random/100x100/?golf,person,5" />
                          <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                            RD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#1F1E1F] truncate">Robert Davis</p>
                          <p className="text-xs text-gray-500 truncate">3 mutual friends</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-2 h-8 px-2 border-[#448460] text-[#448460]">
                          Add
                        </Button>
                      </div>
                      <div className="flex items-center bg-white p-3 rounded-md border border-gray-200">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="https://source.unsplash.com/random/100x100/?golf,person,6" />
                          <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                            LK
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#1F1E1F] truncate">Laura Kim</p>
                          <p className="text-xs text-gray-500 truncate">5 mutual friends</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-2 h-8 px-2 border-[#448460] text-[#448460]">
                          Add
                        </Button>
                      </div>
                      <div className="flex items-center bg-white p-3 rounded-md border border-gray-200">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="https://source.unsplash.com/random/100x100/?golf,person,7" />
                          <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                            TJ
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#1F1E1F] truncate">Tom Jackson</p>
                          <p className="text-xs text-gray-500 truncate">2 mutual friends</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-2 h-8 px-2 border-[#448460] text-[#448460]">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Form */}
      {profile && (
        <EditProfileForm
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
          initialData={{
            first_name: profile.first_name,
            last_name: profile.last_name,
            username: profile.username,
            bio: profile.bio,
            location: profile.location,
            favorite_course: profile.favorite_course,
            handicap: profile.handicap,
            avatar_url: profile.avatar_url,
          }}
          userId={userId || ""}
        />
      )}
      
      {/* Cached Data Notice */}
      <CachedDataNotice />
    </div>
  );
};

export default ProfilePage; 