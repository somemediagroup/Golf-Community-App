import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, Check, Users, AlertCircle } from "lucide-react";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase";

// Types
interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
}

interface PendingRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending';
}

// Define interface for component props
interface UserSearchProps {
  userId?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ userId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Use userId prop if provided, otherwise fallback to auth context user id
  const effectiveUserId = userId || user?.id;

  // Load pending friend requests on component mount
  useEffect(() => {
    if (effectiveUserId) {
      loadPendingRequests(effectiveUserId);
    }
  }, [effectiveUserId]);

  // Load pending friend requests sent by the current user
  const loadPendingRequests = async (currentUserId: string) => {
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id, friend_id')
        .eq('user_id', currentUserId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Create a map of user IDs with pending requests
      const pendingMap: Record<string, boolean> = {};
      data.forEach((request: PendingRequest) => {
        pendingMap[request.friend_id] = true;
      });
      
      setPendingRequests(pendingMap);
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Error loading pending requests:", error);
    }
  };

  // Check if users are already friends
  const checkExistingFriendships = async (userIds: string[]) => {
    if (!effectiveUserId || userIds.length === 0) return {};
    
    try {
      // Check for accepted friendships in both directions
      const { data: sentRequests, error: sentError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', effectiveUserId)
        .eq('status', 'accepted')
        .in('friend_id', userIds);
      
      if (sentError) throw sentError;
      
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friendships')
        .select('user_id')
        .eq('friend_id', effectiveUserId)
        .eq('status', 'accepted')
        .in('user_id', userIds);
      
      if (receivedError) throw receivedError;
      
      // Create a map of friend IDs
      const friendMap: Record<string, boolean> = {};
      
      sentRequests.forEach((request: any) => {
        friendMap[request.friend_id] = true;
      });
      
      receivedRequests.forEach((request: any) => {
        friendMap[request.user_id] = true;
      });
      
      return friendMap;
    } catch (error) {
      console.error("Error checking existing friendships:", error);
      return {};
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !effectiveUserId) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      try {
        // Search users by name or username
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url')
          .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
          .neq('id', effectiveUserId) // Exclude the current user
          .limit(10);
        
        if (error) throw error;
        
        // Filter out users who are already friends
        const friendMap = await checkExistingFriendships(data.map((user: UserProfile) => user.id));
        const filteredResults = data.filter((user: UserProfile) => !friendMap[user.id]);
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        toast({
          title: "Search Error",
          description: "Failed to search for users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 500),
    [effectiveUserId]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Don't search if query is empty
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    debouncedSearch(query);
  };

  const handleSendRequest = async (friendId: string, friendName: string) => {
    if (!effectiveUserId) return;
    
    try {
      // Check if a request already exists in either direction
      const { data: existingRequests, error: checkError } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${effectiveUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${effectiveUserId})`)
        .limit(1);
      
      if (checkError) throw checkError;
      
      // If request already exists, return early
      if (existingRequests.length > 0) {
        const status = existingRequests[0].status;
        
        if (status === 'accepted') {
          toast({
            title: "Already Friends",
            description: `You are already friends with ${friendName}`,
          });
        } else if (status === 'pending') {
          toast({
            title: "Request Pending",
            description: `A friend request with ${friendName} is already pending`,
          });
        } else {
          toast({
            title: "Request Error",
            description: `There was an issue with your friend request`,
            variant: "destructive"
          });
        }
        
        return;
      }
      
      // Insert new friend request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: effectiveUserId,
          friend_id: friendId,
          status: 'pending'
        });
      
      if (error) throw error;
      
      // Update local state
      setPendingRequests(prev => ({ ...prev, [friendId]: true }));
      
      toast({
        title: "Friend Request Sent",
        description: `Request sent to ${friendName}`,
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Request Failed",
        description: "There was a problem sending your friend request",
        variant: "destructive"
      });
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          Find Friends
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Initial state before any search */}
        {!searchQuery && !loading && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
            <p className="text-sm text-muted-foreground">Search for other golf players to add as friends</p>
          </div>
        )}
        
        {/* No results state */}
        {searchQuery && !loading && searchResults.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
            <p className="text-sm text-muted-foreground">No users found matching "{searchQuery}"</p>
          </div>
        )}
        
        {/* Loading results */}
        {loading && (
          <div className="space-y-2 mt-2">
            {renderSkeletons()}
          </div>
        )}
        
        {/* Search results */}
        {!loading && searchResults.length > 0 && (
          <div className="space-y-2 mt-2 max-h-[350px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {searchResults.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={profile.avatar_url} alt={profile.username} />
                      <AvatarFallback>
                        {profile.first_name[0]}
                        {profile.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium text-sm">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{profile.username}
                      </p>
                    </div>
                  </div>
                  
                  {initialLoadDone && (
                    pendingRequests[profile.id] ? (
                      <Badge variant="outline" className="bg-muted/30 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Request Sent</span>
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleSendRequest(profile.id, `${profile.first_name} ${profile.last_name}`)}
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Add Friend</span>
                      </Button>
                    )
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSearch; 