import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  Flag,
  CircleUser,
  MapPin,
  Users,
  Loader2,
  RefreshCw,
  Award,
  Trophy,
  BarChart2,
  Calendar,
  MessageCircle,
  UserPlus,
  UserMinus,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase";
import ScoreCardHistory from "@/features/profile/ScoreCardHistory";
import PlayedCoursesHistory from "@/features/profile/PlayedCoursesHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from 'react-router-dom';

// Define interfaces for data types
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
  average_score?: number;
  best_score?: number;
  handicap_trend?: number;
}

interface FriendshipStatus {
  status: 'friends' | 'pending_sent' | 'pending_received' | 'none';
  id?: string;
  user_id?: string;
  friend_id?: string;
}

// Error state component
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

// Loading skeleton for tabs
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

const FriendProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("stats");
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>({ status: 'none' });
  const [isRetrying, setIsRetrying] = useState(false);
  const [featureErrors, setFeatureErrors] = useState<Record<string, string>>({});
  const hasAttemptedInitialLoad = useRef(false);
  
  // Function to clear a feature error
  const clearFeatureError = useCallback((feature: string) => {
    setFeatureErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[feature];
      return newErrors;
    });
  }, []);
  
  // Add function to track feature errors
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

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!userId || !user) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      // Fetch user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      if (!profileData) throw new Error("User not found");
      
      // Fetch user stats from Supabase
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      
      // Check friendship status
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('id, status, user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .single();
      
      if (friendError && friendError.code !== 'PGRST116') throw friendError;
      
      // Set friendship status
      if (friendData) {
        const status: FriendshipStatus['status'] = 
          friendData.status === 'accepted' ? 'friends' :
          (friendData.user_id && friendData.user_id === user.id) ? 'pending_sent' : 'pending_received';
          
        setFriendshipStatus({ 
          status, 
          id: friendData.id,
          user_id: friendData.user_id,
          friend_id: friendData.friend_id
        });
      } else {
        setFriendshipStatus({ status: 'none' });
      }
      
      // Format and set profile data
      setProfile({
        ...profileData,
        played_courses: statsData?.played_courses || 0,
        rounds_played: statsData?.rounds_played || 0,
      });
      
      // Set stats
      setStats(statsData || {
        played_courses: 0,
        rounds_played: 0,
      });
      
      setLoading(false);
    } catch (err: any) {
      console.error("Error loading friend profile:", err);
      setError(err.message || "Failed to load profile");
      setLoading(false);
    }
  }, [userId, user]);
  
  // Load profile on component mount
  useEffect(() => {
    if (!hasAttemptedInitialLoad.current) {
      hasAttemptedInitialLoad.current = true;
      loadProfile();
    }
  }, [loadProfile]);
  
  // Function to retry loading data
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    loadProfile().finally(() => setIsRetrying(false));
  }, [loadProfile]);
  
  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  };
  
  // Friendship management functions
  const handleAddFriend = async () => {
    if (!userId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: userId,
          status: 'pending'
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      setFriendshipStatus({ 
        status: 'pending_sent',
        id: data.id,
        user_id: user.id,
        friend_id: userId
      });
      
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully",
      });
    } catch (err: any) {
      console.error("Error sending friend request:", err);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAcceptFriend = async () => {
    if (!friendshipStatus.id) return;
    
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipStatus.id);
      
      if (error) throw error;
      
      setFriendshipStatus({ 
        status: 'friends',
        id: friendshipStatus.id,
        user_id: friendshipStatus.user_id,
        friend_id: friendshipStatus.friend_id
      });
      
      toast({
        title: "Friend request accepted",
        description: "You are now friends",
      });
    } catch (err: any) {
      console.error("Error accepting friend request:", err);
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveFriend = async () => {
    if (!friendshipStatus.id) return;
    
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipStatus.id);
      
      if (error) throw error;
      
      setFriendshipStatus({ status: 'none' });
      
      toast({
        title: "Friend removed",
        description: "Friend has been removed successfully",
      });
    } catch (err: any) {
      console.error("Error removing friend:", err);
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Error state display
  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-[#1F1E1F] p-6 rounded-lg border border-red-200 my-4 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Profile</h2>
          <p className="mb-4">{typeof error === 'string' ? error : "Failed to load user profile"}</p>
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="outline"
            className="bg-white text-red-700 border-red-300 hover:bg-red-100"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
  
  // Loading skeleton display
  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-48 mt-4" />
              <Skeleton className="h-4 w-32 mt-2" />
              <div className="w-full mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Skeleton className="h-10 w-full mb-6" />
            <TabContentSkeleton />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Card */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}`} />
              <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-gray-500">@{profile?.username}</p>
            
            {/* Additional profile info */}
            <div className="w-full mt-4 space-y-3 text-sm">
              {profile?.location && (
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile?.handicap !== undefined && (
                <div className="flex items-center justify-center gap-1">
                  <Flag className="h-4 w-4 text-gray-400" />
                  <span>Handicap: {profile.handicap}</span>
                </div>
              )}
              
              {profile?.joined_date && (
                <div className="flex items-center justify-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>Joined {formatJoinDate(profile.joined_date)}</span>
                </div>
              )}
            </div>
            
            {/* Bio section */}
            {profile?.bio && (
              <div className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4 w-full">
                <p>{profile.bio}</p>
              </div>
            )}
            
            {/* Friend management buttons */}
            <div className="mt-6 flex gap-2">
              {friendshipStatus.status === 'none' && (
                <Button onClick={handleAddFriend} className="bg-[#448460] hover:bg-[#448460]/90 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Friend
                </Button>
              )}
              
              {friendshipStatus.status === 'pending_sent' && (
                <Button variant="outline" disabled className="text-gray-600">
                  <Loader2 className="mr-2 h-4 w-4" />
                  Request Sent
                </Button>
              )}
              
              {friendshipStatus.status === 'pending_received' && (
                <Button onClick={handleAcceptFriend} className="bg-[#448460] hover:bg-[#448460]/90 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Accept Request
                </Button>
              )}
              
              {friendshipStatus.status === 'friends' && (
                <>
                  <Button 
                    onClick={() => {/* Send message implementation */}}
                    variant="outline"
                    className="flex-1"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button 
                    onClick={handleRemoveFriend}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Unfriend
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b border-gray-200 bg-[#FBFCFB] flex justify-between p-0 h-auto">
              <TabsTrigger
                value="stats"
                className="flex-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460] transition-all"
              >
                Statistics
              </TabsTrigger>
              <TabsTrigger
                value="score-history"
                className="flex-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460] transition-all"
              >
                Score History
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="flex-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460] transition-all"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="mutual-friends"
                className="flex-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#448460] data-[state=active]:text-[#448460] transition-all"
              >
                Mutual Friends
              </TabsTrigger>
            </TabsList>
            
            {/* Stats Tab */}
            <TabsContent value="stats" className="pt-6">
              {featureErrors.stats ? (
                <FeatureErrorState 
                  message={featureErrors.stats} 
                  retryFn={() => {
                    clearFeatureError('stats');
                    // Reload stats
                  }} 
                />
              ) : (
                <div className="space-y-6">
                  {/* Stats Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Trophy className="h-8 w-8 text-[#448460] mb-2" />
                        <p className="text-sm text-gray-500">Rounds Played</p>
                        <p className="text-2xl font-bold">{stats?.rounds_played || 0}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Flag className="h-8 w-8 text-[#448460] mb-2" />
                        <p className="text-sm text-gray-500">Courses Played</p>
                        <p className="text-2xl font-bold">{stats?.played_courses || 0}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Award className="h-8 w-8 text-[#448460] mb-2" />
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="text-2xl font-bold">{stats?.average_score || '-'}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Activity className="h-8 w-8 text-[#448460] mb-2" />
                        <p className="text-sm text-gray-500">Handicap</p>
                        <p className="text-2xl font-bold">{profile?.handicap || '-'}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Performance Charts Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Score Progression</CardTitle>
                      <CardDescription>
                        Score trends over recent rounds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center text-gray-500 border border-dashed border-gray-200 rounded-md">
                        <p>Score progression chart will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Key Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Fairways Hit</span>
                              <span>62%</span>
                            </div>
                            <Progress value={62} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Greens in Regulation</span>
                              <span>48%</span>
                            </div>
                            <Progress value={48} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Putts per Round</span>
                              <span>32</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Up and Down %</span>
                              <span>40%</span>
                            </div>
                            <Progress value={40} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recent Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Personal Best Score</p>
                              <p className="text-sm text-gray-500">78 at Pine Valley Golf Club</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Trophy className="h-5 w-5 text-[#448460] mt-0.5" />
                            <div>
                              <p className="font-medium">Milestone: 10 Rounds</p>
                              <p className="text-sm text-gray-500">Completed 10 full rounds</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Flag className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="font-medium">5 Different Courses</p>
                              <p className="text-sm text-gray-500">Played at 5 unique courses</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Score History Tab */}
            <TabsContent value="score-history" className="pt-6">
              {featureErrors.scoreHistory ? (
                <FeatureErrorState 
                  message={featureErrors.scoreHistory} 
                  retryFn={() => {
                    clearFeatureError('scoreHistory');
                    // Reload score history
                  }} 
                />
              ) : (
                <ScoreCardHistory userId={userId || ''} viewOnly={true} />
              )}
            </TabsContent>
            
            {/* Courses Tab */}
            <TabsContent value="courses" className="pt-6">
              {featureErrors.courses ? (
                <FeatureErrorState 
                  message={featureErrors.courses} 
                  retryFn={() => {
                    clearFeatureError('courses');
                    // Reload courses
                  }} 
                />
              ) : (
                <PlayedCoursesHistory userId={userId || ''} viewOnly={true} />
              )}
            </TabsContent>
            
            {/* Mutual Friends Tab */}
            <TabsContent value="mutual-friends" className="pt-6">
              {featureErrors.mutualFriends ? (
                <FeatureErrorState 
                  message={featureErrors.mutualFriends} 
                  retryFn={() => {
                    clearFeatureError('mutualFriends');
                    // Reload mutual friends
                  }} 
                />
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mutual Friends</CardTitle>
                      <CardDescription>
                        Friends you have in common with {profile?.first_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* This would be populated with actual mutual friends */}
                        <div className="flex items-center bg-white rounded-lg p-3 border border-gray-200 transition-all hover:shadow-md">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">JD</AvatarFallback>
                          </Avatar>
                          <div className="ml-2 flex-1 min-w-0 cursor-pointer">
                            <p className="font-medium text-sm truncate">John Doe</p>
                            <p className="text-xs text-gray-500 truncate">@johndoe</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 rounded-full" 
                            title="View Profile"
                            onClick={() => navigate(`/profile/${userId}`)}
                          >
                            <CircleUser className="h-4 w-4 text-[#448460]" />
                          </Button>
                        </div>
                        <div className="flex items-center bg-white rounded-lg p-3 border border-gray-200 transition-all hover:shadow-md">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#448460] text-[#FBFCFB]">JS</AvatarFallback>
                          </Avatar>
                          <div className="ml-2 flex-1 min-w-0 cursor-pointer">
                            <p className="font-medium text-sm truncate">Jane Smith</p>
                            <p className="text-xs text-gray-500 truncate">@janesmith</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 rounded-full" 
                            title="View Profile"
                            onClick={() => navigate(`/profile/${userId}`)}
                          >
                            <CircleUser className="h-4 w-4 text-[#448460]" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FriendProfilePage; 