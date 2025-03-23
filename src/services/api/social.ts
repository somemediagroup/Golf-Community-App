import supabase from '@/lib/supabase';
import { User } from '@/types/user';

/**
 * Social feature interfaces for Golf Community App
 */
export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  visibility: 'public' | 'friends' | 'private';
  likes_count?: number;
  comments_count?: number;
  user?: {
    id: string;
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
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  friend: UserProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  sent_at: string;
  read_at?: string;
  is_read: boolean;
  sender?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  recipient?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

/**
 * Social service for the Golf Community App
 */
export const socialService = {
  /**
   * Get user feed (posts from friends and public posts)
   */
  async getUserFeed(userId: string, { limit = 10, offset = 0 } = {}) {
    // First get user's friends
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    const friendIds = friendships ? friendships.map(f => f.friend_id) : [];
    
    // Get posts from friends and public posts
    const { data, error, count } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact' })
      .eq('activity_type', 'post')
      .or(`user_id.eq.${userId},visibility.eq.public${friendIds.length > 0 ? `,user_id.in.(${friendIds.join(',')})` : ''}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { posts: data as Post[], count, error };
  },
  
  /**
   * Create a new post
   */
  async createPost(userId: string, content: string, visibility: 'public' | 'friends' | 'private' = 'public', imageUrl?: string) {
    const post = {
      user_id: userId,
      content,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      visibility,
    };
    
    const { data, error } = await supabase
      .from('user_activities')
      .insert(post)
      .select(`
        *,
        user:profiles(id, username, avatar_url)
      `)
      .single();
    
    return { post: data as Post, error };
  },
  
  /**
   * Get post comments
   */
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(id, username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    return { comments: data as Comment[], error };
  },
  
  /**
   * Add a comment to a post
   */
  async addComment(userId: string, postId: string, content: string) {
    const comment = {
      user_id: userId,
      post_id: postId,
      content,
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();
    
    return { comment: data as Comment, error };
  },
  
  /**
   * Search for users by name, username, or email
   */
  searchUsers: async (query: string, currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(10);
      
      if (error) throw error;
      
      return { users: data as UserProfile[], error: null };
    } catch (error) {
      console.error("Error searching users:", error);
      return { users: [], error };
    }
  },
  
  /**
   * Get pending friend requests for a user
   */
  getPendingFriendRequests: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          profiles:profiles!user_id(id, username, first_name, last_name, avatar_url)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Transform the data to match the FriendRequest interface
      const formattedData = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        friend_id: item.friend_id,
        status: item.status,
        created_at: item.created_at,
        friend: {
          id: item.profiles.id,
          username: item.profiles.username,
          first_name: item.profiles.first_name,
          last_name: item.profiles.last_name,
          avatar_url: item.profiles.avatar_url
        }
      }));
      
      return { requests: formattedData as FriendRequest[], error: null };
    } catch (error) {
      console.error("Error getting friend requests:", error);
      return { requests: [], error };
    }
  },
  
  /**
   * Check if a friend request exists
   */
  checkFriendRequest: async (userId: string, friendId: string) => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .limit(1);
      
      if (error) throw error;
      
      return { 
        exists: data.length > 0,
        status: data.length > 0 ? data[0].status : null,
        id: data.length > 0 ? data[0].id : null,
        error: null 
      };
    } catch (error) {
      console.error("Error checking friend request:", error);
      return { exists: false, status: null, id: null, error };
    }
  },
  
  /**
   * Send a friend request
   */
  sendFriendRequest: async (userId: string, friendId: string) => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .insert([
          { user_id: userId, friend_id: friendId, status: 'pending' }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return { request: data, error: null };
    } catch (error) {
      console.error("Error sending friend request:", error);
      return { request: null, error };
    }
  },
  
  /**
   * Update friend request status (accept or reject)
   */
  updateFriendRequestStatus: async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { request: data, error: null };
    } catch (error) {
      console.error(`Error ${status === 'accepted' ? 'accepting' : 'rejecting'} friend request:`, error);
      return { request: null, error };
    }
  },
  
  /**
   * Get user's friends list
   */
  getFriends: async (userId: string) => {
    try {
      // Get friends where user sent the request
      const { data: sentRequests, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          created_at,
          friend:profiles!friend_id(id, username, first_name, last_name, avatar_url)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');
      
      if (sentError) throw sentError;
      
      // Get friends where user received the request
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          created_at,
          friend:profiles!user_id(id, username, first_name, last_name, avatar_url)
        `)
        .eq('friend_id', userId)
        .eq('status', 'accepted');
      
      if (receivedError) throw receivedError;
      
      // Format and combine both lists
      const sentFriends = sentRequests.map(item => ({
        id: item.friend.id,
        username: item.friend.username,
        first_name: item.friend.first_name,
        last_name: item.friend.last_name,
        avatar_url: item.friend.avatar_url,
        friendship_id: item.id,
        created_at: item.created_at
      }));
      
      const receivedFriends = receivedRequests.map(item => ({
        id: item.friend.id,
        username: item.friend.username,
        first_name: item.friend.first_name,
        last_name: item.friend.last_name,
        avatar_url: item.friend.avatar_url,
        friendship_id: item.id,
        created_at: item.created_at
      }));
      
      const friends = [...sentFriends, ...receivedFriends];
      
      return { friends, error: null };
    } catch (error) {
      console.error("Error getting friends:", error);
      return { friends: [], error };
    }
  },
  
  /**
   * Get user's messages
   */
  async getMessages(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, username, avatar_url),
        recipient:profiles!recipient_id(id, username, avatar_url)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('sent_at', { ascending: true });
    
    return { messages: data as Message[], error };
  },
  
  /**
   * Send a message
   */
  async sendMessage(senderId: string, recipientId: string, content: string) {
    const message = {
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      sent_at: new Date().toISOString(),
      is_read: false,
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    return { message: data as Message, error };
  },
  
  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();
    
    return { message: data as Message, error };
  },
};

export default socialService; 