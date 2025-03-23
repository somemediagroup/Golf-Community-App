import { useState, useEffect } from "react";
import { Check, X, UserCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";

// Define request type locally to avoid dependencies
interface FriendRequestWithProfile {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

// Define interface for component props
interface FriendRequestsProps {
  userId?: string;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ userId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<FriendRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Use userId prop if provided, otherwise fallback to auth context user id
    const effectiveUserId = userId || user?.id;
    if (effectiveUserId) {
      fetchFriendRequests(effectiveUserId);
    }
  }, [userId, user?.id]);

  // Fetch pending friend requests
  const fetchFriendRequests = async (effectiveUserId: string) => {
    if (!effectiveUserId) return;
    
    setLoading(true);
    try {
      // Get friend requests where current user is the friend_id (receiving the request)
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          status,
          created_at,
          sender:profiles!user_id(id, username, first_name, last_name, avatar_url)
        `)
        .eq('friend_id', effectiveUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process data into correct format
      const processedRequests: FriendRequestWithProfile[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        created_at: item.created_at,
        sender: item.sender
      }));
      
      setRequests(processedRequests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast({
        title: "Error",
        description: "Failed to load friend requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  };

  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) return;
    
    // Prevent double-clicks
    if (processingIds[requestId]) return;
    
    setProcessingIds(prev => ({ ...prev, [requestId]: true }));
    
    try {
      // Update the friendship status to 'accepted'
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('friend_id', user.id);
      
      if (error) throw error;
      
      // Update the local state to remove this request
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Friend Request Accepted",
        description: "You are now friends",
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Handle rejecting a friend request
  const handleRejectRequest = async (requestId: string) => {
    if (!user?.id) return;
    
    // Prevent double-clicks
    if (processingIds[requestId]) return;
    
    setProcessingIds(prev => ({ ...prev, [requestId]: true }));
    
    try {
      // Delete the friendship record
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('friend_id', user.id);
      
      if (error) throw error;
      
      // Update the local state to remove this request
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Friend Request Rejected",
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Error",
        description: "Failed to reject friend request",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
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
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          Pending Friend Requests
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {loading ? (
            renderSkeletons()
          ) : requests.length === 0 ? (
            <div className="text-center py-6">
              <UserCheck className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
              <p className="text-sm text-muted-foreground">No pending friend requests</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.sender.avatar_url} alt={request.sender.username} />
                      <AvatarFallback>
                        {request.sender.first_name[0]}
                        {request.sender.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium text-sm">
                        {request.sender.first_name} {request.sender.last_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">@{request.sender.username}</p>
                        <Badge variant="outline" className="text-xs py-0 h-4">
                          {formatTimeAgo(request.created_at)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full border-green-500 text-green-500 hover:bg-green-50"
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={processingIds[request.id]}
                    >
                      {processingIds[request.id] ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="sr-only">Accept</span>
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={processingIds[request.id]}
                    >
                      {processingIds[request.id] ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="sr-only">Reject</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendRequests; 