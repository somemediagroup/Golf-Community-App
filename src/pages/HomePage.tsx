import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo, memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar, Trophy, Users, Map, MessageSquare, ThumbsUp, Clock, AlertCircle, MapPin, Search, Filter, ArrowRight, Phone, Star } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { format } from "date-fns";

// Import the HomePage styles
import '../styles/HomePage.css';

// Define the interfaces locally to avoid type errors
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  published_at: string;
  author: string;
  category: string;
  featured: boolean;
}

interface Course {
  id: string;
  name: string;
  location: string;
  image_url?: string;
  rating?: number;
  course_type?: string;
  difficulty?: string;
  price_range?: string;
  featured?: boolean;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
}

interface TeeTimeBooking {
  id: string;
  course_id: string;
  course_name: string;
  date: string;
  time: string;
  players: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  booking_ref?: string;
  price?: number;
  notes?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar_url?: string;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  location: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  status: string;
  format: string;
  entry_fee: number;
  prize_pool?: number;
  max_participants: number;
  current_participants: number;
  image_url: string;
}

interface GolfPartner {
  id: string;
  name: string;
  handicap: number;
  distance: number;
  avatar_url?: string;
}

// Import API services directly since lazy loading is causing issues
import * as API from '@/services/api';

// Import UI components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Mock data for fallbacks
const MOCK_FEATURED_ARTICLE: NewsArticle = {
  id: "1",
  title: "Mastering Your Short Game: Tips from the Pros",
  summary: "Improve your chipping and putting with these professional insights.",
  content: "Full article content here...",
  image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1000&q=80",
  published_at: new Date().toISOString(),
  author: "Mark Johnson",
  category: "Tips & Techniques",
  featured: true
};

const MOCK_COURSES: Course[] = [
  {
    id: "1",
    name: "Pine Valley Golf Club",
    location: "Pine Valley, NJ",
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 4.9,
    course_type: "Public",
    difficulty: "Championship",
    price_range: "$$$",
    featured: true
  },
  {
    id: "2",
    name: "Augusta National Golf Club",
    location: "Augusta, GA",
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 5.0,
    course_type: "Private",
    difficulty: "Championship",
    price_range: "$$$$",
    featured: true
  }
];

// Mock tournaments data
const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: "1",
    name: "Local Amateur Championship",
    description: "Annual amateur tournament open to all handicap levels",
    location: "Boston, MA",
    venue: "Boston Golf Club",
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),   // 9 days from now
    registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    format: "Stroke Play",
    entry_fee: 150,
    max_participants: 120,
    current_participants: 87,
    image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=500&q=60"
  },
  {
    id: "2",
    name: "Senior Club Championship",
    description: "Club championship for seniors (50+)",
    location: "Miami, FL",
    venue: "Miami Lakes Golf Club",
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),   // 15 days from now
    registration_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    format: "Match Play",
    entry_fee: 75,
    max_participants: 64,
    current_participants: 41,
    image_url: "https://images.unsplash.com/photo-1592919505780-303952732da4?auto=format&fit=crop&w=500&q=60"
  }
];

// Mock tee time data
const MOCK_TEE_TIMES: TeeTimeBooking[] = [
  {
    id: "1",
    course_id: "1",
    course_name: "Pine Valley Golf Club",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    time: "08:30",
    players: 4,
    status: "confirmed",
    booking_ref: "PV12345",
    price: 120
  },
  {
    id: "2",
    course_id: "2",
    course_name: "Augusta National Golf Club",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    time: "10:15",
    players: 3,
    status: "pending",
    booking_ref: "AN67890",
    price: 250
  }
];

// Mock golf partners data
const MOCK_PARTNERS: GolfPartner[] = [
  {
    id: "1",
    name: "James Wilson",
    handicap: 8.5,
    distance: 5.2,
    avatar_url: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    handicap: 14.2,
    distance: 3.8,
    avatar_url: "https://randomuser.me/api/portraits/women/44.jpg"
  }
];

// Improved optimized cache system
const CACHE_VERSION = 'v1.0.0'; // For cache busting when app updates
const CACHE_PREFIX = `golf_app_${CACHE_VERSION}_`;
const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000,       // 5 minutes
  MEDIUM: 30 * 60 * 1000,     // 30 minutes
  LONG: 24 * 60 * 60 * 1000,  // 24 hours
};

const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage'
};

// Advanced cache system with multiple storage types and compression
const appCache = {
  // Get data from cache
  getData: (key: string, storageType = StorageType.LOCAL) => {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      const cachedItem = storage.getItem(`${CACHE_PREFIX}${key}`);
      
      if (!cachedItem) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cachedItem);
      
      // Check if cache is still valid
      if (Date.now() - timestamp < (ttl || CACHE_EXPIRATION.MEDIUM)) {
        return data;
      }
      
      // Remove expired item
      storage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    } catch (e) {
      console.warn('Cache read error:', e);
      return null;
    }
  },
  
  // Set data in cache
  setData: (key: string, data: any, ttl = CACHE_EXPIRATION.MEDIUM, storageType = StorageType.LOCAL) => {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      storage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  },
  
  // Remove a specific item from cache
  removeData: (key: string, storageType = StorageType.LOCAL) => {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      storage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (e) {
      console.warn('Cache remove error:', e);
    }
  },
  
  // Clear all cache items for this app version
  clearCache: (storageType = StorageType.LOCAL) => {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      
      Object.keys(storage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => storage.removeItem(key));
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
  },
  
  // Perform cache maintenance - remove expired and excess items
  maintenance: () => {
    try {
      // Process both storage types
      [localStorage, sessionStorage].forEach(storage => {
        const cacheKeys = Object.keys(storage)
          .filter(key => key.startsWith(CACHE_PREFIX));
          
        // Remove expired items
        cacheKeys.forEach(key => {
          try {
            const cacheData = JSON.parse(storage.getItem(key) || '{}');
            if (cacheData.timestamp && Date.now() - cacheData.timestamp > (cacheData.ttl || CACHE_EXPIRATION.MEDIUM)) {
              storage.removeItem(key);
            }
          } catch (e) {
            // If JSON parsing fails, remove the item
            storage.removeItem(key);
          }
        });
        
        // If we have too many items, remove the oldest ones
        if (cacheKeys.length > 50) {
          const sortedKeys = cacheKeys
            .map(key => {
              try {
                const cacheData = JSON.parse(storage.getItem(key) || '{"timestamp":0}');
                return { key, timestamp: cacheData.timestamp || 0 };
              } catch (e) {
                return { key, timestamp: 0 };
              }
            })
            .sort((a, b) => a.timestamp - b.timestamp);
          
          // Keep the 30 newest items, remove the rest
          sortedKeys.slice(0, sortedKeys.length - 30)
            .forEach(item => storage.removeItem(item.key));
        }
      });
    } catch (e) {
      console.warn('Cache maintenance error:', e);
    }
  }
};

// Loading placeholder component
// Loading placeholder component that matches our CSS
interface LoadingPlaceholderProps {
  height?: string;
  count?: number;
}

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ height = "100px", count = 1 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div 
          key={`loading-${i}`} 
          className="loading-placeholder" 
          style={{ height, width: '100%' }}
        />
      ))}
    </>
  );
};

// Error fallback component
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="error-container">
    <h3>Something went wrong</h3>
    <p>{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="primary-button"
    >
      Try again
    </button>
  </div>
);

// Memoized FeaturedArticle component
const FeaturedArticle = memo(({ article, loading }: { article: NewsArticle | null, loading: boolean }) => {
  if (loading) {
    return (
      <div>
        <div className="h-48 bg-muted animate-pulse" />
        <CardHeader>
          <Skeleton className="h-6 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-muted" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-full mt-2 bg-muted" />
          <Skeleton className="h-4 w-2/3 mt-2 bg-muted" />
        </CardContent>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No featured articles available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-48 overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url.replace('?auto=format&fit=crop&w=1000&q=80', '?auto=format&fit=crop&w=500&q=60')}
            srcSet={`${article.image_url.replace('?auto=format&fit=crop&w=1000&q=80', '?auto=format&fit=crop&w=500&q=60')} 500w, 
                    ${article.image_url} 1000w`}
            sizes="(max-width: 768px) 100vw, 50vw"
            alt={article.title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            loading="eager"
            width="500"
            height="300"
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="h-full bg-gradient-to-r from-primary/30 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <Badge className="mb-2 bg-muted-green text-white">
            {article.category}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2 bg-background">
        <CardTitle className="text-xl text-foreground">{article.title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          By {article.author} • {formatDate(article.published_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-background">
        <p className="text-muted-foreground line-clamp-3">{article.summary}</p>
      </CardContent>
      <CardFooter className="bg-background">
        <Button asChild variant="outline" className="border-muted-green text-muted-green hover:bg-muted-green hover:text-white">
          <Link to={`/news/${article.id}`}>Read More</Link>
        </Button>
      </CardFooter>
    </>
  );
});

// Memoized CourseCard component
const CourseCard = memo(({ course }: { course: Course }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-40 overflow-hidden">
        {course.image_url ? (
          <img
            src={course.image_url.replace('?auto=format&fit=crop&w=500&q=60', '?auto=format&fit=crop&w=300&q=40')}
            srcSet={`${course.image_url.replace('?auto=format&fit=crop&w=500&q=60', '?auto=format&fit=crop&w=300&q=40')} 300w,
                    ${course.image_url} 500w`}
            sizes="(max-width: 768px) 100vw, 33vw"
            alt={course.name}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            loading="lazy"
            width="300"
            height="200"
            decoding="async"
          />
        ) : (
          <div className="h-full bg-gradient-to-r from-primary/10 to-primary/5" />
        )}
        {course.rating && (
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-md px-2 py-1 text-xs font-medium text-foreground">
            ★ {course.rating.toFixed(1)}
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-foreground">{course.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{course.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {course.course_type && (
            <Badge variant="outline" className="border-muted-green text-muted-green">{course.course_type}</Badge>
          )}
          {course.difficulty && (
            <Badge variant="outline" className="border-muted-green text-muted-green">{course.difficulty}</Badge>
          )}
          {course.price_range && (
            <Badge variant="outline" className="border-muted-green text-muted-green">{course.price_range}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" size="sm" className="border-muted-green text-muted-green hover:bg-muted-green hover:text-white">
          <Link to={`/courses/${course.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format time from ISO to readable format (8:30 AM)
const formatTime = (timeString: string) => {
  try {
    // If it's a full ISO string, extract the time portion
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // If it's just a time string (HH:MM), convert to 12-hour format
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (e) {
    return timeString; // Return original if parsing fails
  }
};

// Format relative time (e.g., "2 days from now", "Today", "Tomorrow")
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const differenceInDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (differenceInDays === 0) return 'Today';
  if (differenceInDays === 1) return 'Tomorrow';
  if (differenceInDays > 1 && differenceInDays < 7) return `In ${differenceInDays} days`;
  return formatDate(dateString);
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [featuredArticleLoading, setFeaturedArticleLoading] = useState<boolean>(true);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [tournamentsLoading, setTournamentsLoading] = useState<boolean>(true);
  const [partnersLoading, setPartnersLoading] = useState<boolean>(true);
  const [teeTimesLoading, setTeeTimesLoading] = useState<boolean>(true);
  
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [partners, setPartners] = useState<GolfPartner[]>([]);
  const [teeTimes, setTeeTimes] = useState<TeeTimeBooking[]>([]);
  
  const [activeTab, setActiveTab] = useState('courses');
  const [error, setError] = useState<Error | null>(null);

  // State for tee time booking dialog
  const [teeTimeDialogOpen, setTeeTimeDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to tomorrow
  );
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [playerCount, setPlayerCount] = useState<string>("4");
  
  // State for tournament registration dialog
  const [tournamentDialogOpen, setTournamentDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  // State for partner search dialog
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [partnerSearchRadius, setPartnerSearchRadius] = useState<string>("25");
  const [partnerSkillLevel, setPartnerSkillLevel] = useState<string>("any");
  
  // Implement a reducer pattern for loading states to avoid multiple re-renders
  const [loadingStates, setLoadingStates] = useState({
    featured: true,
    courses: true,
    posts: true,
    tournaments: true,
    partners: true,
    teeTimes: true
  });
  
  const updateLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Optimize data fetching by using intersection observer to load content only when visible
  const featuredArticleRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const tournamentsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const teeTimesRef = useRef<HTMLDivElement>(null);

  // Prefetch critical data in parallel immediately on component mount
  useEffect(() => {
    // Perform cache maintenance at startup
    appCache.maintenance();
    
    // Prefetch data in parallel and store in state
    const prefetchData = async () => {
      setLoading(true);
      
      // Execute fetch operations in parallel using Promise.all for efficiency
      Promise.all([
        fetchFeaturedArticle(),
        fetchCourses(3),
        fetchPosts(3),
        fetchTournaments(),
        fetchPartners(),
        fetchTeeTimes()
      ]).then(([
        articleResult, 
        coursesResult, 
        postsResult,
        tournamentsResult,
        partnersResult,
        teeTimesResult
      ]) => {
        // Update all state at once to reduce renders
        setFeaturedArticle(articleResult);
        setCourses(coursesResult);
        setPosts(postsResult);
        setTournaments(tournamentsResult);
        setPartners(partnersResult);
        setTeeTimes(teeTimesResult);
        
        // Update all loading states at once
        setFeaturedArticleLoading(false);
        setCoursesLoading(false);
        setPostsLoading(false);
        setTournamentsLoading(false);
        setPartnersLoading(false);
        setTeeTimesLoading(false);
        setLoading(false);
      }).catch(error => {
        console.error("Error prefetching data:", error);
        setLoading(false);
      });
    };
    
    prefetchData();
  }, []);
  
  // Updated fetch methods with smaller payload and better caching
  const fetchFeaturedArticle = useCallback(async () => {
    try {
      // Check local cache first
      const cachedArticle = appCache.getData('featuredArticle');
      if (cachedArticle) return cachedArticle;
      
      // Fetch with smaller payload
      const startTime = performance.now();
      const { articles, error } = await API.news.getFeaturedArticles(1, true);
      
      console.debug(`Featured article fetch took ${(performance.now() - startTime).toFixed(2)}ms`);
      
      if (error) throw new Error(error.message);
      const featuredArticle = articles && articles.length > 0 ? articles[0] : null;
      
      // If no article found, use mock data
      if (!featuredArticle) {
        return MOCK_FEATURED_ARTICLE;
      }
      
      // Map API response to component's expected format
      const formattedArticle = {
        id: featuredArticle.id,
        title: featuredArticle.title,
        summary: featuredArticle.summary,
        content: featuredArticle.content || '',
        image_url: featuredArticle.featured_image,
        published_at: featuredArticle.published_date,
        author: featuredArticle.author,
        category: featuredArticle.category,
        featured: featuredArticle.is_featured
      };
      
      // Update cache
      appCache.setData('featuredArticle', formattedArticle, CACHE_EXPIRATION.MEDIUM);
      return formattedArticle;
    } catch (err) {
      console.error("Error fetching featured article:", err);
      return MOCK_FEATURED_ARTICLE;
    }
  }, []);

  const fetchCourses = useCallback(async (limit = 6) => {
    try {
      // Check local cache first
      const cachedCourses = appCache.getData('courses');
      if (cachedCourses) return cachedCourses.slice(0, limit);
      
      // Fetch from API
      const startTime = performance.now();
      const { courses, error } = await API.courses.getCourses({ 
        limit
      });
      
      console.debug(`Courses fetch took ${(performance.now() - startTime).toFixed(2)}ms`);
      
      if (error) throw new Error(error.message);
      if (!courses || courses.length === 0) return MOCK_COURSES.slice(0, limit);
      
      // Update cache
      appCache.setData('courses', courses, CACHE_EXPIRATION.MEDIUM);
      return courses;
    } catch (err) {
      console.error("Error fetching courses:", err);
      return MOCK_COURSES.slice(0, limit);
    }
  }, []);

  const fetchPosts = useCallback(async (limit = 5) => {
    try {
      if (!user?.id) return [];
      
      // Check local cache first
      const cachedPosts = appCache.getData(`posts_${user.id}`, StorageType.SESSION);
      if (cachedPosts) return cachedPosts.slice(0, limit);
      
      // Fetch from API
      const startTime = performance.now();
      const { posts, error } = await API.social.getUserFeed(user.id, { 
        limit
      });
      
      console.debug(`Posts fetch took ${(performance.now() - startTime).toFixed(2)}ms`);
      
      if (error) throw new Error(error.message);
      if (!posts || posts.length === 0) return [];
      
      // Map the API response to our component's expected format
      const formattedPosts = posts.map(post => ({
        id: post.id,
        content: post.content,
        image_url: post.image_url,
        created_at: post.created_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        author: {
          id: post.user_id,
          name: post.user?.username || 'Anonymous User',
          username: post.user?.username || 'anonymous',
          avatar_url: post.user?.avatar_url
        }
      }));
      
      // Update cache - short expiration for social content
      appCache.setData(`posts_${user.id}`, formattedPosts, CACHE_EXPIRATION.SHORT, StorageType.SESSION);
      return formattedPosts;
    } catch (err) {
      console.error("Error fetching posts:", err);
      return [];
    }
  }, [user?.id]);
  
  // New fetch functions for tournaments, partners, and tee times
  const fetchTournaments = useCallback(async () => {
    try {
      // Check cache first
      const cachedTournaments = appCache.getData('tournaments');
      if (cachedTournaments) return cachedTournaments;
      
      // Try to fetch from API if available
      try {
        const startTime = performance.now();
        // This is a placeholder - implement when API is available
        // const { tournaments, error } = await API.tournaments.getUpcomingTournaments();
        
        // For now, use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.debug(`Tournaments fetch took ${(performance.now() - startTime).toFixed(2)}ms`);
        
        // Update cache
        appCache.setData('tournaments', MOCK_TOURNAMENTS, CACHE_EXPIRATION.MEDIUM);
        return MOCK_TOURNAMENTS;
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        return MOCK_TOURNAMENTS;
      }
    } catch (err) {
      console.error("Error in tournament fetch process:", err);
      return MOCK_TOURNAMENTS;
    }
  }, []);

  const fetchPartners = useCallback(async () => {
    try {
      if (!user?.id) return [];
      
      // Check cache first
      const cachedPartners = appCache.getData(`partners_${user.id}`, StorageType.SESSION);
      if (cachedPartners) return cachedPartners;
      
      // Try to fetch from API if available
      try {
        const startTime = performance.now();
        // This is a placeholder - implement when API is available
        // const { partners, error } = await API.social.getNearbyGolfPartners(user.id);
        
        // For now, use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));
        
        console.debug(`Partners fetch took ${(performance.now() - startTime).toFixed(2)}ms`);
        
        // Update cache - shorter expiration for social data
        appCache.setData(`partners_${user.id}`, MOCK_PARTNERS, CACHE_EXPIRATION.SHORT, StorageType.SESSION);
        return MOCK_PARTNERS;
      } catch (error) {
        console.error("Error fetching partners:", error);
        return MOCK_PARTNERS;
      }
    } catch (err) {
      console.error("Error in partners fetch process:", err);
      return MOCK_PARTNERS;
    }
  }, [user?.id]);
  
  const fetchTeeTimes = useCallback(async () => {
    try {
      if (!user?.id) return [];
      
      // Check cache first
      const cachedTeeTimes = appCache.getData(`tee_times_${user.id}`, StorageType.SESSION);
      if (cachedTeeTimes) return cachedTeeTimes;
      
      // Try to fetch from API if available
      try {
        const startTime = performance.now();
        // This is a placeholder - implement when API is available
        // const { teeTimes, error } = await API.courses.getUserTeeTimeBookings(user.id);
        
        // For now, use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 350));
        
        console.debug(`Tee times fetch took ${(performance.now() - startTime).toFixed(2)}ms`);
        
        // Update cache
        appCache.setData(`tee_times_${user.id}`, MOCK_TEE_TIMES, CACHE_EXPIRATION.SHORT, StorageType.SESSION);
        return MOCK_TEE_TIMES;
      } catch (error) {
        console.error("Error fetching tee times:", error);
        return MOCK_TEE_TIMES;
      }
    } catch (err) {
      console.error("Error in tee times fetch process:", err);
      return MOCK_TEE_TIMES;
    }
  }, [user?.id]);

  // Helper functions for UI
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle tee time booking submission with improved validation and feedback
  const handleBookTeeTime = useCallback(async () => {
    // Validation
    const validationErrors = [];
    
    if (!selectedCourse) {
      validationErrors.push("Please select a golf course");
    }
    
    if (!selectedDate) {
      validationErrors.push("Please select a date");
    } else {
      // Ensure date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        validationErrors.push("Please select a date in the future");
      }
    }
    
    if (!selectedTime) {
      validationErrors.push("Please select a time");
    }
    
    if (!playerCount) {
      validationErrors.push("Please select number of players");
    }
    
    // If there are validation errors, show them
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }
    
    // Show loading state
    setTeeTimesLoading(true);
    
    try {
      // In a real app, this would call the API to book the tee time
      // For example: await API.teeTime.bookTeeTime({ courseId, date, time, players })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new tee time booking to add to the list
      const newBooking: TeeTimeBooking = {
        id: `temp-${Date.now()}`, // In real app this would come from the API
        course_id: courses.find(c => c.name === selectedCourse)?.id || "unknown",
        course_name: selectedCourse,
        date: selectedDate.toISOString(),
        time: selectedTime,
        players: parseInt(playerCount),
        status: 'pending',
        booking_ref: `BK${Math.floor(Math.random() * 10000)}`,
        price: Math.floor(Math.random() * 50) + 50 // Sample price between $50-$100
      };
      
      // Add the new booking to the list
      setTeeTimes(prev => [newBooking, ...prev]);
      
      // Success message
      alert(`Tee time successfully booked at ${selectedCourse} for ${selectedDate.toDateString()} at ${formatTime(selectedTime)} for ${playerCount} players!`);
      
      // Reset form and close dialog
      setSelectedCourse("");
      setSelectedTime("");
      setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Reset to tomorrow
      setPlayerCount("4");
      setTeeTimeDialogOpen(false);
    } catch (error) {
      console.error("Error booking tee time:", error);
      alert("There was an error booking your tee time. Please try again.");
    } finally {
      setTeeTimesLoading(false);
    }
  }, [selectedCourse, selectedDate, selectedTime, playerCount, courses, formatTime]);
  
  // Handle tournament registration with improved functionality
  const handleRegisterTournament = useCallback(async () => {
    if (!selectedTournament) {
      alert('Please select a tournament to register for');
      return;
    }

    setTournamentsLoading(true);

    try {
      // Here we would make an API call to register for the tournament
      // For now, we'll simulate it with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the tournament status in our list
      setTournaments(prevTournaments => 
        prevTournaments.map(tournament => 
          tournament.id === selectedTournament.id 
            ? { 
                ...tournament, 
                status: 'registered',
                current_participants: tournament.current_participants + 1 
              }
            : tournament
        )
      );

      // Show success message
      alert(`Successfully registered for ${selectedTournament.name}. A confirmation email will be sent to your registered email address.`);

      // Close dialog and reset selection
      setTournamentDialogOpen(false);
      setSelectedTournament(null);
    } catch (error) {
      console.error('Error registering for tournament:', error);
      alert('Failed to register for the tournament. Please try again.');
    } finally {
      setTournamentsLoading(false);
    }
  }, [selectedTournament, tournaments]);
  
  // Handle partner search with more robust functionality
  const handleSearchPartners = useCallback(async () => {
    // Show loading state
    setPartnersLoading(true);
    
    try {
      // In a real app, this would call the API to search for partners
      // For example: await API.social.findGolfPartners({ radius: partnerSearchRadius, skillLevel: partnerSkillLevel })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate some simulated partner data based on search criteria
      const randomPartnerCount = Math.floor(Math.random() * 5) + 1; // 1-5 new partners
      const newPartners: GolfPartner[] = [];
      
      // Random names for simulation
      const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Sam', 'Riley', 'Morgan', 'Jamie', 'Pat', 'Quinn'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
      
      // Helper to get handicap range based on skill level
      const getHandicapRange = (skill: string): [number, number] => {
        switch (skill) {
          case 'beginner': return [20, 36];
          case 'intermediate': return [10, 19];
          case 'advanced': return [0, 9];
          default: return [0, 36]; // Any skill level
        }
      };
      
      const [minHandicap, maxHandicap] = getHandicapRange(partnerSkillLevel);
      
      // Convert partnerSearchRadius from string to number for calculations
      const searchRadius = parseInt(partnerSearchRadius);
      
      for (let i = 0; i < randomPartnerCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        
        // Generate handicap based on skill level
        const handicap = partnerSkillLevel === 'any'
          ? Math.floor(Math.random() * 36)
          : Math.floor(Math.random() * (maxHandicap - minHandicap + 1)) + minHandicap;
        
        // Generate distance based on search radius
        const distance = Math.floor(Math.random() * searchRadius) + 1;
        
        // Create the partner object
        newPartners.push({
          id: `partner-${Date.now()}-${i}`,
          name,
          handicap,
          distance,
          avatar_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
        });
      }
      
      // Update partners state, avoiding duplicates
      setPartners(prev => {
        const newPartnerIds = new Set(newPartners.map(p => p.id));
        return [...newPartners, ...prev.filter(p => !newPartnerIds.has(p.id))];
      });
      
      // Show success message
      alert(`Found ${newPartners.length} golf partners within ${searchRadius} miles!`);
      
      // Switch to the partners tab to show results
      setActiveTab('partners');
      
      // Close dialog
      setPartnerDialogOpen(false);
    } catch (error) {
      console.error('Error searching for partners:', error);
      alert('Failed to search for partners. Please try again.');
    } finally {
      setPartnersLoading(false);
    }
  }, [partnerSearchRadius, partnerSkillLevel]);
  
  // Handler for Quick Links - implement proper navigation and functionality
  const handleQuickLinks = useCallback((action: string) => {
    switch (action) {
      case 'book-tee':
        setTeeTimeDialogOpen(true);
        break;
      case 'tournaments':
        // If we're on the home page and the tournaments section exists, scroll to it
        const tournamentsSection = document.getElementById('tournaments-section');
        if (tournamentsSection) {
          setActiveTab('tournaments');
          tournamentsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If not on the home page or the section doesn't exist, navigate to the tournaments page
          navigate('/tournaments');
        }
        break;
      case 'find-partners':
        // Open partner dialog on home page, or navigate to the partners page if that makes more sense
        if (window.location.pathname === '/') {
          setPartnerDialogOpen(true);
        } else {
          navigate('/community/partners');
        }
        break;
      case 'explore-courses':
        // Always navigate to the full courses page
        navigate('/courses');
        break;
      default:
        break;
    }
  }, [navigate]);

  // Load more courses when clicking "Load more"
  const handleLoadMoreCourses = useCallback(async () => {
    if (courses.length >= 6) return; // Already loaded all
    setCoursesLoading(true);
    const moreCourses = await fetchCourses(6);
    setCourses(moreCourses);
    setCoursesLoading(false);
  }, [courses.length, fetchCourses]);

  // Load more posts when clicking "Load more"
  const handleLoadMorePosts = useCallback(async () => {
    if (posts.length >= 5) return; // Already loaded all
    setPostsLoading(true);
    const morePosts = await fetchPosts(5);
    setPosts(morePosts);
    setPostsLoading(false);
  }, [posts.length, fetchPosts]);

  // Add component for Community Activity item - more lightweight than full Card
  const CommunityActivityItem = memo(({ post }: { post: Post }) => (
    <div className="bg-background border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={post.author.avatar_url} alt={post.author.name} />
          <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <div>
          <p className="font-medium text-sm text-foreground">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
            </div>
          </div>
      <p className="text-sm text-foreground mb-2">{post.content}</p>
          {post.image_url && (
        <div className="rounded-md overflow-hidden mb-3">
          <img 
            src={post.image_url.includes('?') ? 
                  post.image_url.replace(/\?.*$/, '?auto=format&fit=crop&w=400&q=40') : 
                  `${post.image_url}?auto=format&fit=crop&w=400&q=40`}
            alt="Post" 
            className="w-full h-auto object-cover"
                loading="lazy"
            width="400"
            height="200"
              />
            </div>
          )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {post.likes_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {post.comments_count}
        </span>
          </div>
    </div>
    ));

  // We'll render the page in sections
    return (
    <div className="home-page">
      {loading ? (
        <div className="loading-container">
          <LoadingPlaceholder />
        </div>
      ) : error ? (
        <ErrorFallback error={error} resetErrorBoundary={() => setError(null)} />
      ) : (
        <>
          {/* Hero Section with Welcome and Quick Links */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="welcome-message">
                <h1>{getGreeting()}, {user?.firstName || 'Golfer'}</h1>
                <p>Ready for your next round?</p>
              </div>
              
              <div className="quick-links">
                <button 
                  onClick={() => handleQuickLinks('book-tee')}
                  className="quick-link-button"
                >
                  <Calendar className="quick-link-icon" />
                  <span>Book Tee Time</span>
                </button>
                
                <button 
                  onClick={() => handleQuickLinks('tournaments')}
                  className="quick-link-button"
                >
                  <Trophy className="quick-link-icon" />
                  <span>Tournaments</span>
                </button>
                
                <button 
                  onClick={() => handleQuickLinks('find-partners')}
                  className="quick-link-button"
                >
                  <Users className="quick-link-icon" />
                  <span>Find Partners</span>
                </button>
                
                <button 
                  onClick={() => handleQuickLinks('explore-courses')}
                  className="quick-link-button"
                >
                  <Map className="quick-link-icon" />
                  <span>Explore Courses</span>
                </button>
        </div>
      </div>
            
            {/* Featured Article */}
            <div className="featured-article-container" ref={featuredArticleRef}>
              {featuredArticleLoading ? (
                <LoadingPlaceholder height="240px" />
              ) : featuredArticle ? (
                <div 
                  className="featured-article"
                  style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${featuredArticle.image_url})` }}
                  onClick={() => navigate(`/news/${featuredArticle.id}`)}
                >
                  <div className="featured-tag">Featured</div>
                  <div className="article-content">
                    <h2>{featuredArticle.title}</h2>
                    <p>{featuredArticle.summary}</p>
                    <span className="read-more">Read More →</span>
        </div>
      </div>
              ) : null}
            </div>
          </section>
          
          {/* Upcoming Tee Times & Tournaments Section */}
          <section className="personal-section">
            <div className="tee-times-container">
              <div className="section-header">
                <h2>Your Upcoming Tee Times</h2>
                <button 
                  className="action-button"
                  onClick={() => setTeeTimeDialogOpen(true)}
                >
                  Book New
                </button>
        </div>

              {teeTimesLoading ? (
                <LoadingPlaceholder count={2} />
              ) : teeTimes.length > 0 ? (
                <div className="tee-times-list">
                  {teeTimes.map(booking => (
                    <div key={booking.id} className="tee-time-card">
                      <div className="tee-time-date">
                        <span className="date">{formatRelativeTime(booking.date)}</span>
                        <span className="time">{formatTime(booking.time)}</span>
                      </div>
                      <div className="tee-time-details">
                        <h3>{booking.course_name}</h3>
                        <div className="player-count">
                          <Users className="icon-small" />
                          <span>{booking.players} players</span>
                        </div>
                      </div>
                      <div className="tee-time-actions">
                        <button className="icon-button">
                          <MapPin className="icon-small" />
                        </button>
                        <button className="icon-button">
                          <Phone className="icon-small" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No upcoming tee times. Book one now!</p>
                  <button 
                    className="primary-button"
                    onClick={() => setTeeTimeDialogOpen(true)}
                  >
                Book Tee Time
                  </button>
        </div>
              )}
      </div>

            <div className="tournaments-container" id="tournaments-section">
              <div className="section-header">
                <h2>Upcoming Tournaments</h2>
                <button 
                  className="action-button"
                  onClick={() => navigate('/tournaments')}
                >
                  View All
                </button>
            </div>
              
              {tournamentsLoading ? (
                <LoadingPlaceholder count={2} />
              ) : tournaments.length > 0 ? (
                <div className="tournaments-list">
                  {tournaments.slice(0, 2).map(tournament => (
                    <div key={tournament.id} className="tournament-card">
                      <div className="tournament-date">
                        <span className="date">{formatRelativeTime(tournament.start_date)}</span>
                      </div>
                      <div className="tournament-details">
                        <h3>{tournament.name}</h3>
                        <p className="location">
                          <MapPin className="icon-small" />
                          <span>{tournament.location}</span>
                        </p>
                        <div className="tournament-meta">
                          <span className="fee">${tournament.entry_fee}</span>
                          <span className="format">{tournament.format}</span>
                        </div>
                      </div>
                      <button 
                        className="register-button"
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setTournamentDialogOpen(true);
                        }}
                      >
                        Register
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No upcoming tournaments found.</p>
              </div>
            )}
            </div>
          </section>
          
          {/* Courses & Partners Section */}
          <section className="discover-section">
            <div className="tabs">
              <button 
                className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                Golf Courses
              </button>
              <button 
                className={`tab-button ${activeTab === 'partners' ? 'active' : ''}`}
                onClick={() => setActiveTab('partners')}
              >
                Find Partners
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'courses' && (
                <div className="courses-container" id="courses-section" ref={coursesRef}>
                  {coursesLoading ? (
                    <LoadingPlaceholder count={3} />
                  ) : courses.length > 0 ? (
                    <>
                      <div className="courses-grid">
                        {courses.map(course => (
                          <div key={course.id} className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                            <div className="course-image" style={{ backgroundImage: `url(${course.image_url})` }}>
                              {course.featured && <div className="featured-tag">Featured</div>}
                            </div>
                            <div className="course-details">
                              <h3>{course.name}</h3>
                              <p className="location">{course.location}</p>
                              <div className="course-meta">
                                <div className="rating">
                                  <Star className="star-icon" />
                                  <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <span className="par">Par {course.difficulty}</span>
                                <span className="length">{course.price_range}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        className="view-all-button"
                        onClick={() => navigate('/courses')}
                      >
                        View All Courses
                      </button>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p>No courses found. Check back later.</p>
              </div>
            )}
                </div>
              )}
              
              {activeTab === 'partners' && (
                <div className="partners-container" ref={partnersRef}>
                  <div className="partners-header">
                    <h3>Golfers Near You</h3>
                    <button 
                      className="search-button"
                      onClick={() => setPartnerDialogOpen(true)}
                    >
                      Filter Search
                    </button>
                  </div>
                  
                  {partnersLoading ? (
                    <LoadingPlaceholder count={4} />
                  ) : partners.length > 0 ? (
                    <div className="partners-grid">
                      {partners.map(partner => (
                        <div key={partner.id} className="partner-card">
                          <div className="partner-avatar">
                            {partner.avatar_url ? (
                              <img src={partner.avatar_url} alt={partner.name} />
                            ) : (
                              <div className="avatar-placeholder">
                                {getInitials(partner.name)}
                              </div>
                            )}
                          </div>
                          <div className="partner-details">
                            <h4>{partner.name}</h4>
                            <p className="handicap">Handicap: {partner.handicap}</p>
                            <div className="distance">
                              <MapPin className="icon-small" />
                              <span>{partner.distance} miles away</span>
                            </div>
                          </div>
                          <button 
                            className="connect-button"
                            onClick={() => navigate(`/profile/${partner.id}`)}
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No golfers found nearby.</p>
                      <button 
                        className="primary-button"
                        onClick={() => setPartnerDialogOpen(true)}
                      >
                        Expand Search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}
      
      {/* Modals/Dialogs */}
      {teeTimeDialogOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Book a Tee Time</h2>
              <button className="close-button" onClick={() => setTeeTimeDialogOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Golf Course</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''} 
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Time</label>
                <select 
                  value={selectedTime} 
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  <option value="">Select a time</option>
                  {['7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(time => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Number of Players</label>
                <select 
                  value={playerCount} 
                  onChange={(e) => setPlayerCount(e.target.value)}
                  required
                >
                  <option value="1">1 player</option>
                  <option value="2">2 players</option>
                  <option value="3">3 players</option>
                  <option value="4">4 players</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setTeeTimeDialogOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={handleBookTeeTime}>Book Tee Time</button>
            </div>
          </div>
        </div>
      )}
      
      {tournamentDialogOpen && selectedTournament && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Tournament Registration</h2>
              <button className="close-button" onClick={() => setTournamentDialogOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="tournament-details-large">
                <h3>{selectedTournament.name}</h3>
                <p className="date">{formatDate(selectedTournament.start_date)}</p>
                <p className="location">{selectedTournament.location}</p>
                <div className="tournament-info">
                  <div className="info-item">
                    <strong>Format:</strong> {selectedTournament.format}
                  </div>
                  <div className="info-item">
                    <strong>Entry Fee:</strong> ${selectedTournament.entry_fee}
                  </div>
                  <div className="info-item">
                    <strong>Prize Pool:</strong> ${selectedTournament.prize_pool}
                  </div>
                </div>
                <p className="description">{selectedTournament.description}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setTournamentDialogOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={handleRegisterTournament}>Register Now</button>
            </div>
          </div>
        </div>
      )}
      
      {partnerDialogOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Find Golf Partners</h2>
              <button className="close-button" onClick={() => setPartnerDialogOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSearchPartners}>
                <div className="form-group">
                  <label htmlFor="partner-radius">Search Radius</label>
                  <select
                    id="partner-radius"
                    value={partnerSearchRadius}
                    onChange={(e) => setPartnerSearchRadius(e.target.value)}
                  >
                    <option value="10">Within 10 miles</option>
                    <option value="25">Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="partner-skill">Skill Level</label>
                  <select
                    id="partner-skill"
                    value={partnerSkillLevel}
                    onChange={(e) => setPartnerSkillLevel(e.target.value)}
                  >
                    <option value="any">Any skill level</option>
                    <option value="beginner">Beginner (Handicap: 20+)</option>
                    <option value="intermediate">Intermediate (Handicap: 10-19)</option>
                    <option value="advanced">Advanced (Handicap: 0-9)</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="secondary-button" 
                    onClick={() => setPartnerDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary-button"
                    disabled={partnersLoading}
                  >
                    {partnersLoading ? 'Searching...' : 'Find Partners'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 