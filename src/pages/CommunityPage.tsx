import { useState, useEffect, useMemo, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Users, MessageSquare, Trophy, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import SocialFeed from "@/features/social/SocialFeed";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { withAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface CommunityStats {
  totalMembers: number;
  onlineMembers: number;
  totalPosts: number;
  activeDiscussions: number;
  upcomingEvents: number;
}

const CommunityPage = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    onlineMembers: 0,
    totalPosts: 0,
    activeDiscussions: 0,
    upcomingEvents: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    const fetchCommunityStats = async () => {
      setLoadingStats(true);
      try {
        // In a real app, we would fetch data from Supabase
        // const { data, error } = await supabase.rpc('get_community_stats');
        // if (error) throw error;
        
        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        setStats({
          totalMembers: 3742,
          onlineMembers: 127,
          totalPosts: 8954,
          activeDiscussions: 43,
          upcomingEvents: 12
        });
      } catch (error) {
        console.error("Error fetching community stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchCommunityStats();
  }, []);

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary/80 to-primary pt-16 pb-12 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Golf Community</h1>
            <p className="text-white/80 max-w-2xl mb-8">
              Connect with golf enthusiasts, share your experiences, discover events, and improve your game with tips from the community.
            </p>
            
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCard
                icon={<Users className="h-5 w-5" />}
                title="Members"
                value={loadingStats ? null : formatNumber(stats.totalMembers)}
                subtitle={`${loadingStats ? '–' : stats.onlineMembers} online now`}
              />
              <StatsCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="Posts"
                value={loadingStats ? null : formatNumber(stats.totalPosts)}
                subtitle={`${loadingStats ? '–' : stats.activeDiscussions} active discussions`}
              />
              <StatsCard
                icon={<TrendingUp className="h-5 w-5" />}
                title="Course Reviews"
                value={loadingStats ? null : "1,245"}
              />
              <StatsCard
                icon={<Trophy className="h-5 w-5" />}
                title="Tournaments"
                value={loadingStats ? null : "38"}
                subtitle="This season"
              />
              <StatsCard
                icon={<Calendar className="h-5 w-5" />}
                title="Events"
                value={loadingStats ? null : formatNumber(stats.upcomingEvents)}
                subtitle="Coming up"
              />
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Community Content */}
      <section className="flex-1 bg-background">
        <div className="container mx-auto px-4 -mt-6">
          <Card className="mb-6">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-card h-14 px-4">
                  <TabsTrigger
                    value="feed"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-14"
                  >
                    Social Feed
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-14"
                  >
                    Groups
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-14"
                  >
                    Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboards"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-14"
                  >
                    Leaderboards
                  </TabsTrigger>
                  <TabsTrigger
                    value="courses"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 h-14"
                  >
                    Courses
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Tab Content */}
          <div className="pb-12">
            {activeTab === "feed" && <SocialFeed />}
            {activeTab === "groups" && <GroupsPlaceholder />}
            {activeTab === "events" && <EventsPlaceholder />}
            {activeTab === "leaderboards" && <LeaderboardsPlaceholder />}
            {activeTab === "courses" && <CoursesPlaceholder />}
          </div>
        </div>
      </section>
    </div>
  );
};

// Stats card component
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  subtitle 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | null; 
  subtitle?: string 
}) => {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {value === null ? (
          <Skeleton className="h-7 w-16 bg-white/20" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

// Placeholder components for other tabs
const GroupsPlaceholder = () => (
  <div className="text-center py-16">
    <h3 className="text-2xl font-bold mb-4">Groups Coming Soon</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      Create and join groups based on location, skill level, or special interests within the golf community.
    </p>
    <Button variant="outline">Get Notified When Available</Button>
  </div>
);

const EventsPlaceholder = () => (
  <div className="text-center py-16">
    <h3 className="text-2xl font-bold mb-4">Events Coming Soon</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      Discover local tournaments, meetups, and golf events happening in your area.
    </p>
    <Button variant="outline">Get Notified When Available</Button>
  </div>
);

const LeaderboardsPlaceholder = () => (
  <div className="text-center py-16">
    <h3 className="text-2xl font-bold mb-4">Leaderboards Coming Soon</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      Track your performance against friends and other golfers in your community.
    </p>
    <Button variant="outline">Get Notified When Available</Button>
  </div>
);

const CoursesPlaceholder = () => (
  <div className="text-center py-16">
    <h3 className="text-2xl font-bold mb-4">Golf Courses</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      Discover and track golf courses you've played, read and write reviews, and find new places to golf near you.
    </p>
    <div className="flex gap-4 justify-center">
      <Button variant="default" asChild>
        <Link to="/courses-list">Browse Courses</Link>
      </Button>
      <Button variant="outline">Get Course Recommendations</Button>
    </div>
  </div>
);

export default withAuth(CommunityPage); 