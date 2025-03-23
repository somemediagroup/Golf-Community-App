import { useState, useEffect } from "react";
import { MapPin, Calendar, Star, Users, Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

// Mock data for recent activity
const recentActivity = [
  {
    id: 1,
    type: "check-in",
    user: {
      name: "Alex Johnson",
      avatar: "",
      initials: "AJ"
    },
    course: "Pine Valley Golf Club",
    time: "2 hours ago"
  },
  {
    id: 2,
    type: "review",
    user: {
      name: "Sarah Williams",
      avatar: "",
      initials: "SW"
    },
    course: "Augusta National Golf Club",
    rating: 4.5,
    time: "Yesterday"
  },
  {
    id: 3,
    type: "scorecard",
    user: {
      name: "Mike Roberts",
      avatar: "",
      initials: "MR"
    },
    course: "St Andrews Links",
    score: 82,
    par: 72,
    time: "2 days ago"
  }
];

// Mock data for upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: "Weekend Tournament",
    course: "Pebble Beach Golf Links",
    date: "This Saturday, 8:00 AM",
    participants: 16
  },
  {
    id: 2,
    title: "Friendly Match",
    course: "Torrey Pines Golf Course",
    date: "Next Monday, 10:00 AM",
    participants: 4
  }
];

// Mock data for news
const latestNews = [
  {
    id: 1,
    title: "PGA Championship Results: Brooks Koepka Takes the Title",
    excerpt: "Brooks Koepka secured his fifth major championship with an impressive display at...",
    imageUrl: "https://placehold.co/600x400",
    time: "1 day ago"
  },
  {
    id: 2,
    title: "New Golf Rules for 2025 Season Announced",
    excerpt: "The R&A and USGA have announced several rule changes that will take effect in the 2025 season...",
    imageUrl: "https://placehold.co/600x400",
    time: "3 days ago"
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState({
    temperature: 72,
    condition: "Sunny",
    windSpeed: 8,
    precipitation: 0
  });
  
  // Mock stats
  const stats = {
    roundsPlayed: 24,
    averageScore: 86,
    bestScore: 78,
    handicapTrend: "improving" // improving, declining, stable
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={item}>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || "Golfer"}!
              </h1>
              <p className="text-primary-foreground/80">
                {weatherData.condition} and {weatherData.temperature}°F. Great day for golf!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="secondary">
                Find a Course
              </Button>
              <Button variant="secondary">
                Record a Score
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Stats and Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats Card */}
        <motion.div variants={item} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Golf Performance</CardTitle>
              <CardDescription>Recent stats and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Rounds Played</p>
                  <p className="text-2xl font-bold">{stats.roundsPlayed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Average Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Best Score</p>
                  <p className="text-2xl font-bold">{stats.bestScore}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Handicap Progress</p>
                  <p className="text-sm text-muted-foreground">18.2</p>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Stats
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Quick Links */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Check in at a Course</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Rate a Course</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Schedule a Tee Time</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Find Playing Partners</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  <span>Join a Tournament</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Activity, Events, and News */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>From your golf community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type === "check-in" && (
                        <>Checked in at <span className="font-medium">{activity.course}</span></>
                      )}
                      {activity.type === "review" && (
                        <>Rated <span className="font-medium">{activity.course}</span> {activity.rating} stars</>
                      )}
                      {activity.type === "scorecard" && (
                        <>Scored {activity.score} at <span className="font-medium">{activity.course}</span></>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1">
                View All Activity <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Upcoming Events */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled golf activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{event.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {event.participants} participants
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.course}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{event.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1">
                View Calendar <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Latest News */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Latest Golf News</CardTitle>
              <CardDescription>Updates from the golf world</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestNews.map((news) => (
                <div key={news.id} className="space-y-2">
                  <div 
                    className="aspect-video rounded-md bg-cover bg-center" 
                    style={{ backgroundImage: `url(${news.imageUrl})` }}
                  />
                  <h3 className="font-medium">{news.title}</h3>
                  <p className="text-sm text-muted-foreground">{news.excerpt}</p>
                  <p className="text-xs text-muted-foreground">{news.time}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1">
                Read More News <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 