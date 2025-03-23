import { useState, useEffect } from "react";
import { Users, Search, UserMinus, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase";

interface Friend {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  friendship_id: string;
}

// Define interface for component props
interface FriendListProps {
  userId?: string;
  expanded?: boolean;
}

const FriendList: React.FC<FriendListProps> = ({ userId, expanded = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Use userId prop if provided, otherwise fallback to auth context user id
    const effectiveUserId = userId || user?.id;
    if (effectiveUserId) {
      fetchFriends(effectiveUserId);
    }
  }, [userId, user?.id]);

  // Apply search filter when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFriends(friends);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      setFilteredFriends(
        friends.filter(
          (friend) =>
            friend.first_name.toLowerCase().includes(lowercaseSearch) ||
            friend.last_name.toLowerCase().includes(lowercaseSearch) ||
            friend.username.toLowerCase().includes(lowercaseSearch)
        )
      );
    }
  }, [searchTerm, friends]);

  // Fetch user's friends
  const fetchFriends = async (effectiveUserId: string) => {
    if (!effectiveUserId) return;
    
    setLoading(true);
    try {
      // Fetch friends where user sent the request
      const { data: sentRequests, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          created_at,
          friend:profiles!friend_id(id, username, first_name, last_name, avatar_url)
        `)
        .eq('user_id', effectiveUserId)
        .eq('status', 'accepted');
      
      if (sentError) throw sentError;
      
      // Fetch friends where user received the request
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          created_at,
          friend:profiles!user_id(id, username, first_name, last_name, avatar_url)
        `)
        .eq('friend_id', effectiveUserId)
        .eq('status', 'accepted');
      
      if (receivedError) throw receivedError;
      
      // Process and merge both lists
      const sentFriends = sentRequests.map((item: any) => ({
        id: item.friend.id,
        username: item.friend.username,
        first_name: item.friend.first_name,
        last_name: item.friend.last_name,
        avatar_url: item.friend.avatar_url,
        friendship_id: item.id
      }));
      
      const receivedFriends = receivedRequests.map((item: any) => ({
        id: item.friend.id,
        username: item.friend.username,
        first_name: item.friend.first_name,
        last_name: item.friend.last_name, 
        avatar_url: item.friend.avatar_url,
        friendship_id: item.id
      }));
      
      const allFriends = [...sentFriends, ...receivedFriends];
      setFriends(allFriends);
      setFilteredFriends(allFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast({
        title: "Error",
        description: "Failed to load friends list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a friend
  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendToRemove.friendship_id);
      
      if (error) throw error;
      
      // Update state
      setFriends(prev => prev.filter(friend => friend.id !== friendToRemove.id));
      setFilteredFriends(prev => prev.filter(friend => friend.id !== friendToRemove.id));
      
      toast({
        title: "Friend Removed",
        description: `${friendToRemove.first_name} ${friendToRemove.last_name} has been removed from your friends.`
      });
      
      // Close dialog
      setIsDialogOpen(false);
      setFriendToRemove(null);
    } catch (error) {
      console.error("Error removing friend:", error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive"
      });
    }
  };

  // Handle opening chat with friend (placeholder)
  const handleOpenChat = (friendId: string) => {
    // Placeholder - would navigate to chat or open chat UI
    toast({
      title: "Chat Feature",
      description: "Chat functionality will be implemented in a future update."
    });
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(5)
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
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ));
  };

  // Include expanded view with additional content when expanded prop is true
  const renderExpandedContent = () => {
    if (!expanded) return null;
    
    return (
      <div className="mt-4 pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-2">Friend Suggestions</h3>
        <p className="text-muted-foreground text-sm">Coming soon: Friend suggestions based on your golfing preferences and location.</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Friends
            </CardTitle>
            <CardDescription>
              {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {loading ? (
            renderSkeletons()
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-muted-foreground">No friends match your search</p>
              ) : (
                <p className="text-muted-foreground">You haven't added any friends yet</p>
              )}
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url} alt={friend.username} />
                    <AvatarFallback>
                      {friend.first_name.charAt(0) + friend.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {friend.first_name} {friend.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">@{friend.username}</div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenChat(friend.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setFriendToRemove(friend);
                      setIsDialogOpen(true);
                    }}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {renderExpandedContent()}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Friend</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                {friendToRemove ? `${friendToRemove.first_name} ${friendToRemove.last_name}` : "this friend"}{" "}
                from your friends list?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setFriendToRemove(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveFriend}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FriendList; 