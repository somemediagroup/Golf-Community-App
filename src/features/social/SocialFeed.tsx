import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, ThumbsUp, Bookmark, Flag, Send, UserPlus, X, Search, TrendingUp, Users, Loader2, MessageSquare } from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { useRef } from "react";

// Types
interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  timestamp: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: string;
  isFavorite: boolean;
}

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  mutualFriends: number;
}

interface TrendingTopic {
  id: string;
  name: string;
  count: number;
}

// Mock data for development
const mockPosts: Post[] = Array(20).fill(0).map((_, i) => ({
  id: `post-${i}`,
  authorId: `author-${i % 5}`,
  authorName: `Golf User ${i % 5}`,
  authorAvatar: i % 3 === 0 ? `https://i.pravatar.cc/150?u=${i}` : undefined,
  content: `This is a sample post ${i} about golf. #golf #community`,
  images: i % 4 === 0 ? [`https://picsum.photos/seed/${i}/600/400`] : undefined,
  likes: Math.floor(Math.random() * 50),
  comments: Array(Math.floor(Math.random() * 5)).fill(0).map((_, j) => ({
    id: `comment-${i}-${j}`,
    authorId: `commenter-${j}`,
    authorName: `Commenter ${j}`,
    authorAvatar: j % 2 === 0 ? `https://i.pravatar.cc/150?u=${i+100+j}` : undefined,
    content: `This is comment ${j} on post ${i}. Great content!`,
    likes: Math.floor(Math.random() * 10),
    timestamp: `${Math.floor(Math.random() * 24)}h ago`
  })),
  shares: Math.floor(Math.random() * 10),
  timestamp: `${Math.floor(Math.random() * 24)}h ago`,
  isFavorite: i % 7 === 0
}));

const mockFriendRecommendations: Friend[] = Array(5).fill(0).map((_, i) => ({
  id: `friend-${i}`,
  name: `Golf Friend ${i}`,
  username: `golfer${i}`,
  avatar: i % 2 === 0 ? `https://i.pravatar.cc/150?u=${i+200}` : undefined,
  mutualFriends: Math.floor(Math.random() * 15)
}));

const mockTrendingTopics: TrendingTopic[] = [
  { id: "t1", name: "#MastersWeek", count: 2453 },
  { id: "t2", name: "#GolfTips", count: 1876 },
  { id: "t3", name: "#PGATour", count: 1254 },
  { id: "t4", name: "#GolfEquipment", count: 987 }
];

// Post Component with optimized rendering
const PostCard = memo(({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onFavorite 
}: { 
  post: Post, 
  onLike: (id: string) => void,
  onComment: (id: string, comment: string) => void,
  onShare: (id: string) => void,
  onFavorite: (id: string) => void
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoize handlers to prevent unnecessary rerenders
  const handleLike = useCallback(() => onLike(post.id), [onLike, post.id]);
  const handleShare = useCallback(() => onShare(post.id), [onShare, post.id]);
  const handleFavorite = useCallback(() => onFavorite(post.id), [onFavorite, post.id]);

  const handleSubmitComment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    }
  }, [commentText, onComment, post.id, toast]);

  // Only load comments in DOM when they're shown
  const commentsSection = useMemo(() => {
    if (!showComments) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 py-2 bg-muted/30"
      >
        {/* Comment form */}
        <form onSubmit={handleSubmitComment} className="flex gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url} alt={user?.username} />
            <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-r-none"
            />
            <Button 
              type="submit" 
              variant="default" 
              size="icon" 
              className="h-10 w-10 rounded-l-none"
              disabled={!commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Comment list with virtualized rendering for performance */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                <AvatarFallback>{comment.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-background rounded-lg p-2">
                  <h4 className="text-sm font-medium">{comment.authorName}</h4>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <button className="text-muted-foreground hover:text-foreground">Like</button>
                  <button className="text-muted-foreground hover:text-foreground">Reply</button>
                  <span className="text-muted-foreground">{comment.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }, [showComments, user, commentText, handleSubmitComment, post.comments]);

  // Use lazy loading for post images
  const postImage = useMemo(() => {
    if (!post.images || post.images.length === 0) return null;
    
    return (
      <div className="rounded-md overflow-hidden mb-3">
        <img 
          src={post.images[0]} 
          alt="Post content" 
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>
    );
  }, [post.images]);

  return (
    <Card className="mb-4 overflow-hidden border-muted">
      {/* Post header */}
      <CardHeader className="p-4 flex flex-row justify-between items-center space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback>{post.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{post.authorName}</h3>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleFavorite}>
              <Bookmark className="h-4 w-4 mr-2" />
              {post.isFavorite ? "Remove from favorites" : "Save to favorites"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Flag className="h-4 w-4 mr-2" />
              Report post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Post content */}
      <CardContent className="px-4 pt-0 pb-3">
        <p className="text-sm mb-3">{post.content}</p>
        {postImage}
      </CardContent>

      {/* Post stats */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          <span>{post.likes} likes</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{post.comments.length} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      <Separator />

      {/* Post actions */}
      <CardFooter className="px-2 py-1 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 flex items-center justify-center"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 mr-2 ${post.likes > 0 ? "fill-red-500 text-red-500" : ""}`} />
          Like
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 flex items-center justify-center"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Comment
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 flex items-center justify-center"
          onClick={handleShare}
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </CardFooter>

      {/* Comments section */}
      <AnimatePresence>
        {commentsSection}
      </AnimatePresence>
    </Card>
  );
});

// Post creation dialog
const CreatePostDialog = ({ onPostCreated }: { onPostCreated: (content: string, image?: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onPostCreated(content, image);
      setContent("");
      setImage(undefined);
      setIsOpen(false);
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="mb-6 cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="py-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar_url} alt={user?.username} />
              <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-full px-4 py-2.5 text-muted-foreground">
              What's on your mind?
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>Share updates, photos, or thoughts with your golf community</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={user?.avatar_url} alt={user?.username} />
              <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <Select defaultValue="public">
                <SelectTrigger className="h-7 text-xs w-[110px]">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="private">Only me</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Textarea 
            placeholder="What's on your mind?" 
            className="mb-4 min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          {image && (
            <div className="relative mb-4">
              <img src={image} alt="Upload preview" className="rounded-md max-h-60 w-auto mx-auto" />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                type="button"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer"
                  asChild
                >
                  <div>Add Photo</div>
                </Button>
              </label>
            </div>
            <Button type="submit" disabled={!content.trim()}>Post</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Friend recommendation component
const FriendRecommendation = ({ friend, onAdd, onDismiss }: {
  friend: Friend;
  onAdd: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback>{friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{friend.name}</p>
          <p className="text-xs text-muted-foreground">@{friend.username}</p>
          {friend.mutualFriends > 0 && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {friend.mutualFriends} mutual friend{friend.mutualFriends !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="default" className="h-8" onClick={() => onAdd(friend.id)}>
          <UserPlus className="h-3 w-3 mr-1" />
          Add
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onDismiss(friend.id)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Load with skeleton
const PostSkeleton = () => (
  <Card className="mb-4">
    <CardHeader className="p-4 flex flex-row items-center space-y-0 pb-2">
      <div className="flex items-center gap-3 w-full">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-3 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <Skeleton className="h-48 w-full mt-2" />
    </CardContent>
  </Card>
);

// Main SocialFeed component
const SocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [friendRecommendations, setFriendRecommendations] = useState<Friend[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [activeTab, setActiveTab] = useState("following");
  const [sortOption, setSortOption] = useState("recent");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Add caching mechanism
  const cacheRef = useRef<{
    posts: { data: Post[], timestamp: number, tab: string, sort: string },
    recommendations: { data: Friend[], timestamp: number },
    trending: { data: TrendingTopic[], timestamp: number }
  }>({
    posts: { data: [], timestamp: 0, tab: "", sort: "" },
    recommendations: { data: [], timestamp: 0 },
    trending: { data: [], timestamp: 0 }
  });
  
  // Cache expiration time (5 minutes)
  const CACHE_EXPIRATION = 5 * 60 * 1000;
  
  // Optimize intersection observer with useCallback
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasMore && !loading) {
      loadMorePosts();
    }
  }, [hasMore, loading]);
  
  // Use memo for filtered posts to avoid unnecessary recalculations
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Filter by tab
    if (activeTab === "following") {
      // In a real app, we would filter by followed users
      filtered = filtered;
    } else if (activeTab === "popular") {
      // Sort by most likes and comments
      filtered = filtered.sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length));
    } else if (activeTab === "favorites") {
      filtered = filtered.filter(post => post.isFavorite);
    }
    
    // Apply sorting
    if (sortOption === "recent") {
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortOption === "popular") {
      filtered.sort((a, b) => b.likes - a.likes);
    }
    
    return filtered;
  }, [posts, activeTab, sortOption]);

  // Initialize virtualizer for post list
  const virtualizer = useVirtualizer({
    count: filteredPosts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimated post height
    overscan: 5
  });

  // Render post items
  const renderPosts = () => {
    if (initialLoading) {
      return (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      );
    }
    
    if (filteredPosts.length === 0) {
      return (
        <Card className="py-12 text-center">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No posts found</p>
            {activeTab === "favorites" && (
              <p className="text-sm text-muted-foreground mt-2">
                Save posts to your favorites to see them here
              </p>
            )}
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveTab("following")}
            >
              Browse all posts
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const post = filteredPosts[virtualItem.index];
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <PostCard
                post={post}
                onLike={handleLikePost}
                onComment={handleAddComment}
                onShare={handleSharePost}
                onFavorite={handleFavoritePost}
              />
            </motion.div>
          );
        })}
        {hasMore && (
          <div ref={loadMoreRef} className="py-4 flex justify-center" style={{ marginTop: virtualizer.getTotalSize() }}>
            {loading && !initialLoading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading more posts...</span>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // Initial data fetch with cache consideration
  const fetchInitialData = useCallback(async () => {
    setInitialLoading(true);
    setLoading(true);
    
    try {
      // Check if we have valid cached data for the current tab/sort combination
      const now = Date.now();
      const cache = cacheRef.current;
      const cacheIsValid = cache.posts.data.length > 0 && 
                          (now - cache.posts.timestamp) < CACHE_EXPIRATION &&
                          cache.posts.tab === activeTab &&
                          cache.posts.sort === sortOption;
      
      if (cacheIsValid) {
        // Use cached data
        setPosts(cache.posts.data);
        setHasMore(cache.posts.data.length < mockPosts.length);
        setPage(Math.ceil(cache.posts.data.length / 2));
        
        // Still refresh in background after using cache
        refreshDataInBackground();
      } else {
        // Reset pagination when switching tabs/sort
        setPage(1);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // In a real app, we would fetch from Supabase with proper pagination
        // const { data, error } = await supabase
        //  .from('posts')
        //  .select()
        //  .order('created_at', { ascending: false })
        //  .limit(5); // Small initial page size for fast first load
        
        // Filter/sort mock data based on active tab and sort option
        let initialPosts = [...mockPosts];
        
        if (activeTab === "popular") {
          initialPosts.sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length));
        } else if (activeTab === "favorites") {
          initialPosts = initialPosts.filter(post => post.isFavorite);
        }
        
        if (sortOption === "recent") {
          initialPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else if (sortOption === "popular") {
          initialPosts.sort((a, b) => b.likes - a.likes);
        }
        
        // Only show first 2 posts for fast initial render
        setPosts(initialPosts.slice(0, 2)); 
        setHasMore(initialPosts.length > 2);
        
        // Update cache
        cacheRef.current.posts = {
          data: initialPosts.slice(0, 2),
          timestamp: now,
          tab: activeTab,
          sort: sortOption
        };
      }
      
      // Check for cached recommendations and trending topics
      const recommendationCacheValid = cache.recommendations.data.length > 0 && 
                                      (now - cache.recommendations.timestamp) < CACHE_EXPIRATION;
      
      const trendingCacheValid = cache.trending.data.length > 0 && 
                                (now - cache.trending.timestamp) < CACHE_EXPIRATION;
      
      if (!recommendationCacheValid || !trendingCacheValid) {
        // Fetch friend recommendations and trending topics in parallel
        const [friends, topics] = await Promise.all([
          // In real app: supabase.from('friend_recommendations').select().eq('user_id', user.id),
          Promise.resolve(mockFriendRecommendations),
          Promise.resolve(mockTrendingTopics)
        ]);
        
        if (!recommendationCacheValid) {
          setFriendRecommendations(friends);
          cacheRef.current.recommendations = { data: friends, timestamp: now };
        }
        
        if (!trendingCacheValid) {
          setTrendingTopics(topics);
          cacheRef.current.trending = { data: topics, timestamp: now };
        }
      } else {
        // Use cached data for sidebar components
        setFriendRecommendations(cache.recommendations.data);
        setTrendingTopics(cache.trending.data);
      }
    } catch (error) {
      console.error("Error fetching social feed data:", error);
      toast({
        title: "Error",
        description: "Failed to load social feed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [activeTab, sortOption, toast]);

  // Refresh data in background without showing loading states
  const refreshDataInBackground = async () => {
    try {
      // In a real app, we would fetch fresh data from the API
      // but we wouldn't show loading indicators to the user
      
      // This would be a Supabase query in a real app
      // For now, we'll use our mock data but simulate an API delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error in background refresh:", error);
      // Don't show toast errors for background refreshes
    }
  };

  // Load more posts for infinite scroll with debounce
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      // Simulate pagination API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app:
      // const { data, error } = await supabase
      //   .from('posts')
      //   .select()
      //   .order('created_at', { ascending: false })
      //   .range((nextPage-1)*5, nextPage*5-1);
      
      // For demo, we'll just add more mock posts
      const startIdx = posts.length;
      const endIdx = Math.min(startIdx + 2, mockPosts.length); 
      const moreItems = mockPosts.slice(startIdx, endIdx);
      
      if (moreItems.length > 0) {
        // Update state and cache
        const newPosts = [...posts, ...moreItems];
        setPosts(newPosts);
        setPage(nextPage);
        setHasMore(newPosts.length < mockPosts.length);
        
        // Update cache
        cacheRef.current.posts = {
          data: newPosts,
          timestamp: Date.now(),
          tab: activeTab,
          sort: sortOption
        };
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, posts, activeTab, sortOption]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Setup infinite scroll with proper cleanup
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    
    const observer = new IntersectionObserver(observerCallback, { rootMargin: '100px' });
    observer.observe(loadMoreRef.current);
    
    return () => observer.disconnect();
  }, [hasMore, observerCallback]);

  // Memoized handlers for event functions
  const handleLikePost = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  }, []);

  const handleAddComment = useCallback((postId: string, commentText: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: `temp-${Date.now()}`,
                  authorId: user?.id || "unknown",
                  authorName: `${user?.firstName} ${user?.lastName}`,
                  authorAvatar: user?.avatar_url,
                  content: commentText,
                  likes: 0,
                  timestamp: "Just now"
                },
              ],
            }
          : post
      )
    );
  }, [user]);

  const handleSharePost = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      )
    );
    
    toast({
      title: "Post shared",
      description: "Post has been shared to your profile",
    });
  }, [toast]);

  const handleFavoritePost = useCallback((postId: string) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.map(post =>
        post.id === postId
          ? { ...post, isFavorite: !post.isFavorite }
          : post
      );
      
      // Update cache with new posts
      cacheRef.current.posts = {
        data: newPosts,
        timestamp: Date.now(),
        tab: activeTab,
        sort: sortOption
      };
      
      return newPosts;
    });
  }, [activeTab, sortOption]);

  const handleCreatePost = useCallback((content: string, image?: string) => {
    const newPost: Post = {
      id: `temp-${Date.now()}`,
      authorId: user?.id || "unknown",
      authorName: `${user?.firstName} ${user?.lastName}`,
      authorAvatar: user?.avatar_url,
      content,
      images: image ? [image] : undefined,
      likes: 0,
      comments: [],
      shares: 0,
      timestamp: "Just now",
      isFavorite: false
    };
    
    setPosts(prevPosts => {
      const newPosts = [newPost, ...prevPosts];
      
      // Update cache with new posts
      cacheRef.current.posts = {
        data: newPosts,
        timestamp: Date.now(),
        tab: activeTab,
        sort: sortOption
      };
      
      return newPosts;
    });
  }, [user, activeTab, sortOption]);

  const handleAddFriend = useCallback((friendId: string) => {
    // In a real app, we would send a friend request
    setFriendRecommendations(prev => {
      const newRecommendations = prev.filter(friend => friend.id !== friendId);
      
      // Update cache
      cacheRef.current.recommendations = {
        data: newRecommendations,
        timestamp: Date.now()
      };
      
      return newRecommendations;
    });
    
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent successfully",
    });
  }, [toast]);

  const handleDismissFriend = useCallback((friendId: string) => {
    setFriendRecommendations(prev => {
      const newRecommendations = prev.filter(friend => friend.id !== friendId);
      
      // Update cache
      cacheRef.current.recommendations = {
        data: newRecommendations,
        timestamp: Date.now()
      };
      
      return newRecommendations;
    });
  }, []);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <CreatePostDialog onPostCreated={handleCreatePost} />
          
          {/* Post list with virtualization */}
          <div 
            ref={parentRef} 
            className="overflow-auto max-h-[calc(100vh-220px)]"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div 
              style={{ 
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative'
              }}
            >
              {renderPosts()}
            </div>
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search in community..." className="pl-10" />
          </div>
          
          {/* Friend Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">People You May Know</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {initialLoading ? (
                <>
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </>
              ) : friendRecommendations.length > 0 ? (
                <div className="divide-y">
                  {friendRecommendations.map(friend => (
                    <FriendRecommendation 
                      key={friend.id}
                      friend={friend}
                      onAdd={handleAddFriend}
                      onDismiss={handleDismissFriend}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No recommendations right now</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary">See More</Button>
            </CardFooter>
          </Card>
          
          {/* Trending Topics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Trending in Golf</CardTitle>
            </CardHeader>
            <CardContent>
              {initialLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingTopics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-muted">{topic.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary">View All Topics</Button>
            </CardFooter>
          </Card>
          
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Golf Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {initialLoading ? (
                  [1, 2].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium text-sm">Local Tournament</h3>
                      <p className="text-xs text-muted-foreground">Pine Valley Golf Club</p>
                      <p className="text-xs text-muted-foreground mt-1">June 15, 2023</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium text-sm">Community Meetup</h3>
                      <p className="text-xs text-muted-foreground">Olympic Club</p>
                      <p className="text-xs text-muted-foreground mt-1">June 22, 2023</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary">See All Events</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper component for empty states
const EmptyState = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="text-center py-12">
    <div className="mx-auto mb-4 opacity-30">{icon}</div>
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);

export default SocialFeed; 