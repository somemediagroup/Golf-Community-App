// Supabase API client for the Golf Community App
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/config/env";
import supabase from "@/lib/supabase";

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  handicap?: number;
  bio?: string;
  location?: string;
  avatar_url?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

// Course types
export interface Course {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website: string;
  phone: string;
  image_url: string;
  price_range: string;
  difficulty: string;
  holes: number;
  course_type: string;
  par: number;
  length_yards: number;
  rating?: number;
  reviews_count?: number;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  image_url?: string;
  created_at: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

// Social types
export interface Post {
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

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
  likes_count?: number;
  user_has_liked?: boolean;
}

// News types
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  published_at: string;
  author: string;
  author_title?: string;
  source?: string;
  category: string;
  featured: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url?: string;
  prize?: string;
  featured: boolean;
  leaderboard?: any;
}

export interface GolfTip {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  author_avatar?: string;
  image_url?: string;
  video_url?: string;
}

// Authentication API
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      // Special handling for test users
      if (
        (email === 'john.smith@example.com' && password === 'password123') ||
        (email === 'emma.johnson@example.com' && password === 'password123')
      ) {
        // Simulate successful login for test users
        const testUser = email === 'john.smith@example.com'
          ? {
              id: '1',
              email: 'john.smith@example.com',
              first_name: 'John',
              last_name: 'Smith',
              username: 'johnsmith',
              handicap: 12,
              bio: 'Golf enthusiast from California',
              location: 'Los Angeles, CA',
              avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg'
            }
          : {
              id: '2',
              email: 'emma.johnson@example.com',
              first_name: 'Emma',
              last_name: 'Johnson',
              username: 'emmaj',
              handicap: 8,
              bio: 'Professional golf instructor',
              location: 'Phoenix, AZ',
              avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg'
            };
        
        return { user: testUser, error: null };
      }

      // Regular user authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          username: profileData?.username || '',
          handicap: profileData?.handicap,
          bio: profileData?.bio,
          location: profileData?.location,
          avatar_url: profileData?.avatar_url,
        };

        return { user, error: null };
      }

      return { user: null, error: new Error('No user returned from auth') };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error };
    }
  },

  async register(email: string, password: string, userData: Partial<User>): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile in the profiles table
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            email: email,
            handicap: userData.handicap || 0,
            bio: userData.bio || '',
            location: userData.location || '',
          },
        ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          username: userData.username || '',
          handicap: userData.handicap,
          bio: userData.bio,
          location: userData.location,
        };

        return { user, error: null };
      }

      return { user: null, error: new Error('No user returned from auth') };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error };
    }
  },

  async logout(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  },
};

// Courses API
export const coursesAPI = {
  async getCourses({ limit = 10, offset = 0 } = {}): Promise<{ courses: Course[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { courses: data || [], error: null };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { courses: [], error };
    }
  },

  async getCourseById(id: string): Promise<{ course: Course | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { course: data, error: null };
    } catch (error) {
      console.error(`Error fetching course with id ${id}:`, error);
      return { course: null, error };
    }
  },

  async getCourseReviews(courseId: string): Promise<{ reviews: CourseReview[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          *,
          user:profiles(username, first_name, last_name, avatar_url)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { reviews: data || [], error: null };
    } catch (error) {
      console.error(`Error fetching reviews for course ${courseId}:`, error);
      return { reviews: [], error };
    }
  },

  async addCourseReview(courseId: string, userId: string, review: Partial<CourseReview>): Promise<{ review: CourseReview | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert([
          {
            course_id: courseId,
            user_id: userId,
            rating: review.rating,
            review_text: review.review_text,
            image_url: review.image_url,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { review: data, error: null };
    } catch (error) {
      console.error('Error adding course review:', error);
      return { review: null, error };
    }
  },

  async searchCourses(query: string): Promise<{ courses: Course[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`);

      if (error) throw error;

      return { courses: data || [], error: null };
    } catch (error) {
      console.error('Error searching courses:', error);
      return { courses: [], error };
    }
  },
};

// Social API
export const socialAPI = {
  async getPosts({ limit = 10, offset = 0 } = {}): Promise<{ posts: Post[]; error: any }> {
    try {
      // For now, return mock data
      const mockPosts: Post[] = [
        {
          id: '1',
          content: 'Just had an amazing round at Pine Valley! Shot a 76, which is my personal best at this course. The greens were in perfect condition.',
          image_url: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/02/5a8f2cb5a3066628018b53d2_18_Oakmont-Church-Pews.jpg',
          created_at: new Date().toISOString(),
          likes_count: 24,
          comments_count: 5,
          author: {
            id: '101',
            name: 'Michael Thompson',
            username: 'mikethompson',
            avatar_url: 'https://randomuser.me/api/portraits/men/42.jpg'
          }
        },
        {
          id: '2',
          content: 'Looking for a playing partner at Pebble Beach this Saturday. Anyone interested in joining? I have a tee time at 10:30 AM. Weather looks perfect!',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          likes_count: 15,
          comments_count: 8,
          author: {
            id: '102',
            name: 'Sarah Johnson',
            username: 'sarahj',
            avatar_url: 'https://randomuser.me/api/portraits/women/22.jpg'
          }
        },
        {
          id: '3',
          content: 'Just got fitted for a new driver and gained 15 yards off the tee! Can\'t wait to try it out on the course this weekend.',
          image_url: 'https://www.golfchannel.com/sites/default/files/2019/01/09/graves_970_mayers_distance.jpg',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          likes_count: 32,
          comments_count: 12,
          author: {
            id: '103',
            name: 'David Wilson',
            username: 'davewilson',
            avatar_url: 'https://randomuser.me/api/portraits/men/65.jpg'
          }
        }
      ];

      return { posts: mockPosts, error: null };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], error };
    }
  },

  async createPost(userId: string, content: string, imageUrl?: string): Promise<{ post: Post | null; error: any }> {
    try {
      // In a real implementation, we would save to Supabase here
      console.log('Creating post for user:', userId, content, imageUrl);
      return { 
        post: {
          id: Date.now().toString(),
          content,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          author: {
            id: userId,
            name: 'Current User',
            username: 'currentuser',
            avatar_url: undefined
          }
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return { post: null, error };
    }
  },
};

// News API
export const newsAPI = {
  async getNewsArticles({ limit = 10, offset = 0 } = {}): Promise<{ articles: NewsArticle[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { articles: data || [], error: null };
    } catch (error) {
      console.error('Error fetching news articles:', error);
      return { articles: [], error };
    }
  },

  async getFeaturedArticle(): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching featured article:', error);
      return null;
    }
  },

  async getTournaments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }
  },

  async getGolfTips(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('golf_tips')
        .select('*');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching golf tips:', error);
      return [];
    }
  },
};

export default {
  auth: authAPI,
  courses: coursesAPI,
  social: socialAPI,
  news: newsAPI
}; 