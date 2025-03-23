import supabase from '@/lib/supabase';

/**
 * Activity service interfaces
 */
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'check_in' | 'review' | 'score_card' | 'friend_add' | 'post' | 'achievement';
  activity_data: any;
  related_entity_id?: string;
  created_at: string;
  visibility: 'public' | 'friends' | 'private';
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface CheckIn {
  id: string;
  user_id: string;
  course_id: string;
  check_in_time: string;
  comment?: string;
  geo_location?: any;
  weather_conditions?: any;
  visibility: 'public' | 'friends' | 'private';
  course?: {
    id: string;
    name: string;
    location: string;
    image_url?: string;
  };
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

/**
 * Activity service for the Golf Community App
 */
export const activityService = {
  /**
   * Get user activity feed
   */
  async getUserActivityFeed(userId: string, { limit = 10, offset = 0 } = {}) {
    // Get user's friends
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    const friendIds = friendships ? friendships.map(f => f.friend_id) : [];
    
    // Get activities from user and friends based on visibility
    let query = supabase
      .from('user_activities')
      .select(`
        *,
        user:profiles!user_id(id, username, avatar_url)
      `, { count: 'exact' });
    
    // Build visibility filter
    // Public activities from everyone
    // Friend-visible activities from friends
    // Private activities only from the user
    const visibilityFilter = `
      (visibility.eq.public) or
      (user_id.eq.${userId}) or
      (visibility.eq.friends and user_id.in.(${friendIds.length > 0 ? friendIds.join(',') : '0'}))
    `;
    
    const { data, error, count } = await query
      .or(visibilityFilter)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { activities: data as UserActivity[], count, error };
  },
  
  /**
   * Log a user activity
   */
  async logActivity(activity: Omit<UserActivity, 'id' | 'created_at'>) {
    const activityData = {
      ...activity,
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('user_activities')
      .insert(activityData)
      .select()
      .single();
    
    return { activity: data as UserActivity, error };
  },
  
  /**
   * Get user check-ins
   */
  async getUserCheckIns(userId: string, { limit = 10, offset = 0 } = {}) {
    const { data, error, count } = await supabase
      .from('check_ins')
      .select(`
        *,
        course:golf_courses(id, name, location, image_url),
        user:profiles(id, username, avatar_url)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('check_in_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { checkIns: data as CheckIn[], count, error };
  },
  
  /**
   * Get course check-ins
   */
  async getCourseCheckIns(courseId: string, { limit = 10, offset = 0 } = {}) {
    const { data, error, count } = await supabase
      .from('check_ins')
      .select(`
        *,
        user:profiles(id, username, avatar_url)
      `, { count: 'exact' })
      .eq('course_id', courseId)
      .eq('visibility', 'public')
      .order('check_in_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { checkIns: data as CheckIn[], count, error };
  },
  
  /**
   * Add check-in
   */
  async addCheckIn(checkIn: Omit<CheckIn, 'id' | 'user' | 'course'>) {
    const checkInData = {
      ...checkIn,
      check_in_time: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('check_ins')
      .insert(checkInData)
      .select()
      .single();
    
    // Log activity after successful check-in
    if (data && !error) {
      await this.logActivity({
        user_id: checkIn.user_id,
        activity_type: 'check_in',
        activity_data: {
          course_id: checkIn.course_id,
          check_in_time: checkInData.check_in_time,
        },
        related_entity_id: data.id,
        visibility: checkIn.visibility,
      });
    }
    
    return { checkIn: data as CheckIn, error };
  },
};

export default activityService; 