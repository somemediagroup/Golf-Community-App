import supabase from '@/lib/supabase';

/**
 * Course types for Golf Community App
 */
export interface Course {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  geo_location?: any;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  holes: number;
  par: number;
  course_type: string;
  established_year?: number;
  amenities?: any;
  price_range: string;
  created_at: string;
  updated_at?: string;
  is_verified?: boolean;
  image_url?: string;
  rating?: number;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text: string;
  pros?: string;
  cons?: string;
  visit_date: string;
  created_at: string;
  updated_at?: string;
  helpful_count?: number;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export interface CourseFilters {
  course_type?: string;
  price_range?: string;
  state?: string;
  city?: string;
  holes?: number;
  [key: string]: any;
}

/**
 * Course service for the Golf Community App
 */
export const courseService = {
  /**
   * Get all courses with pagination
   */
  async getCourses({ limit = 10, offset = 0, filters = {} as CourseFilters } = {}) {
    let query = supabase
      .from('golf_courses')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (filters.course_type) {
      query = query.eq('course_type', filters.course_type);
    }
    
    if (filters.price_range) {
      query = query.eq('price_range', filters.price_range);
    }
    
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1);
    
    return { courses: data as Course[], count, error };
  },
  
  /**
   * Get a course by ID
   */
  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('golf_courses')
      .select(`
        *,
        course_holes(*),
        course_media(*)
      `)
      .eq('id', id)
      .single();
    
    return { course: data as Course & { course_holes: any[], course_media: any[] }, error };
  },
  
  /**
   * Search courses by name, location, or description
   */
  async searchCourses(query: string) {
    const { data, error } = await supabase
      .from('golf_courses')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, city.ilike.%${query}%, state.ilike.%${query}%`);
    
    return { courses: data as Course[], error };
  },
  
  /**
   * Get course reviews
   */
  async getCourseReviews(courseId: string) {
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    
    return { reviews: data as CourseReview[], error };
  },
  
  /**
   * Add a course review
   */
  async addCourseReview(review: Partial<CourseReview>) {
    const { data, error } = await supabase
      .from('course_reviews')
      .insert(review)
      .select()
      .single();
    
    return { review: data as CourseReview, error };
  },
  
  /**
   * Check in to a course
   */
  async checkInToCourse(userId: string, courseId: string, comment?: string, geoLocation?: any) {
    const checkInData = {
      user_id: userId,
      course_id: courseId,
      check_in_time: new Date(),
      comment,
      geo_location: geoLocation,
      visibility: 'public',
    };
    
    const { data, error } = await supabase
      .from('check_ins')
      .insert(checkInData)
      .select()
      .single();
    
    return { checkIn: data, error };
  },
};

export default courseService; 