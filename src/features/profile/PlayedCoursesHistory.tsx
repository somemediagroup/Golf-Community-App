import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Trophy, 
  Calendar, 
  Clock, 
  Star, 
  Flag, 
  HeartIcon,
  ThumbsUp,
  Clock4,
  Map,
  Search,
  CalendarRange,
  Eye,
  MapIcon
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ScoreCardHistory from "./ScoreCardHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import supabase from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

// Define interface for component props
interface PlayedCoursesHistoryProps {
  userId?: string;
  viewOnly?: boolean;
}

interface CoursePlayHistory {
  id: string;
  course_name: string;
  course_id: string;
  location: string;
  last_played: string;
  times_played: number;
  best_score?: number;
  image_url?: string;
  rating?: number;
}

// Mock data for played courses
const mockCourseHistory: CoursePlayHistory[] = [
  {
    id: "1",
    course_name: "Pine Valley Golf Club",
    course_id: "pine-valley",
    location: "Pine Valley, NJ",
    last_played: "2023-06-15",
    times_played: 5,
    best_score: 82,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    rating: 4.8
  },
  {
    id: "2",
    course_name: "Augusta National Golf Club",
    course_id: "augusta-national",
    location: "Augusta, GA",
    last_played: "2023-05-20",
    times_played: 3,
    best_score: 85,
    image_url: "https://images.unsplash.com/photo-1580155940271-cb309d687f4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    rating: 4.9
  },
  {
    id: "3",
    course_name: "Pebble Beach Golf Links",
    course_id: "pebble-beach",
    location: "Pebble Beach, CA",
    last_played: "2023-04-10",
    times_played: 2,
    best_score: 88,
    image_url: "https://images.unsplash.com/photo-1510558359271-8f231e226cf3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    rating: 4.7
  },
  {
    id: "4",
    course_name: "St Andrews Links",
    course_id: "st-andrews",
    location: "St Andrews, Scotland",
    last_played: "2023-03-18",
    times_played: 1,
    best_score: 90,
    image_url: "https://images.unsplash.com/photo-1589163825265-83984c8c6e96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    rating: 4.6
  },
  {
    id: "5",
    course_name: "TPC Sawgrass",
    course_id: "tpc-sawgrass",
    location: "Ponte Vedra Beach, FL",
    last_played: "2023-02-05",
    times_played: 4,
    best_score: 86,
    image_url: "https://images.unsplash.com/photo-1556746834-1cb442368c76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    rating: 4.5
  }
];

const timeFilterOptions = [
  { value: "all", label: "All Time" },
  { value: "year", label: "Past Year" },
  { value: "6month", label: "Past 6 Months" },
  { value: "3month", label: "Past 3 Months" },
  { value: "month", label: "Past Month" }
];

const PlayedCoursesHistory = ({ userId, viewOnly = false }: PlayedCoursesHistoryProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [courseHistory, setCourseHistory] = useState<CoursePlayHistory[]>(mockCourseHistory);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // In a real app, this would use userId to fetch courses data
  // console.log(`Fetching played courses for user: ${userId}`);

  const coursesByView = {
    all: mockCourseHistory,
    favorites: mockCourseHistory.filter(course => course.favorite),
    recent: [...mockCourseHistory].sort((a, b) => 
      new Date(b.last_played).getTime() - new Date(a.last_played).getTime()
    ).slice(0, 3),
    mostPlayed: [...mockCourseHistory].sort((a, b) => b.times_played - a.times_played)
  };

  const coursesToDisplay = coursesByView[activeTab as keyof typeof coursesByView] || coursesByView.all;
  const selectedCourseData = selectedCourse 
    ? mockCourseHistory.find(c => c.id === selectedCourse) 
    : null;

  useEffect(() => {
    // In a real implementation, this would load course history from the database
    // For now, we're using mock data
    const loadCourseHistory = async () => {
      try {
        setLoading(true);
        
        // This would be replaced with actual API call
        // const { data, error } = await supabase
        //   .from('played_courses')
        //   .select('*')
        //   .eq('user_id', userId || '');
        
        // if (error) throw error;
        // setCourseHistory(data);

        // Using mock data for now
        setTimeout(() => {
          setCourseHistory(mockCourseHistory);
          setLoading(false);
        }, 500);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load course history",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    loadCourseHistory();
  }, [userId, toast]);

  // Filter and sort courses
  const filteredCourses = courseHistory
    .filter(course => {
      // Search filter
      const matchesSearch = search === "" ||
        course.course_name.toLowerCase().includes(search.toLowerCase()) ||
        course.location.toLowerCase().includes(search.toLowerCase());
      
      // Time filter
      let matchesTime = true;
      const lastPlayedDate = new Date(course.last_played);
      const now = new Date();
      
      if (timeFilter === "year") {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        matchesTime = lastPlayedDate >= yearAgo;
      } else if (timeFilter === "6month") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        matchesTime = lastPlayedDate >= sixMonthsAgo;
      } else if (timeFilter === "3month") {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        matchesTime = lastPlayedDate >= threeMonthsAgo;
      } else if (timeFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        matchesTime = lastPlayedDate >= monthAgo;
      }
      
      return matchesSearch && matchesTime;
    })
    .sort((a, b) => {
      // Sort options
      if (sortBy === "recent") {
        return new Date(b.last_played).getTime() - new Date(a.last_played).getTime();
      } else if (sortBy === "mostPlayed") {
        return b.times_played - a.times_played;
      } else if (sortBy === "bestScore") {
        if (!a.best_score) return 1;
        if (!b.best_score) return -1;
        return a.best_score - b.best_score;
      } else if (sortBy === "rating") {
        if (!a.rating) return 1;
        if (!b.rating) return -1;
        return b.rating - a.rating;
      }
      return 0;
    });

  // Calculate stats
  const uniqueCourses = courseHistory.length;
  const totalRounds = courseHistory.reduce((sum, course) => sum + course.times_played, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 text-sm bg-white">
            <MapPin className="w-3.5 h-3.5 mr-1" /> 
            {uniqueCourses} Courses
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm bg-white">
            {totalRounds} Total Rounds
          </Badge>
        </div>
        
        {!viewOnly && (
          <Button
            className="bg-[#448460] hover:bg-[#448460]/90 text-white"
            onClick={() => {/* Add course visit functionality */}}
          >
            Add Course Visit
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Played Courses</CardTitle>
          <CardDescription>
            View your course play history and statistics
          </CardDescription>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search courses..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select
              value={timeFilter}
              onValueChange={setTimeFilter}
            >
              <SelectTrigger>
                <CalendarRange className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                {timeFilterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="mostPlayed">Most Played</SelectItem>
                <SelectItem value="bestScore">Best Score</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 animate-pulse">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-[#F7F7F7] rounded-lg h-32"></div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center p-6 bg-[#FBFCFB] border border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">No courses match your search criteria</p>
              {search !== "" || timeFilter !== "all" ? (
                <Button 
                  variant="link" 
                  className="mt-2 text-[#448460]"
                  onClick={() => {
                    setSearch("");
                    setTimeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                !viewOnly && (
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => {/* Add course visit functionality */}}
                  >
                    Add Your First Course
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCourses.map(course => (
                <div 
                  key={course.id}
                  className="flex flex-col sm:flex-row border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md"
                >
                  <div 
                    className="h-40 sm:h-auto sm:w-1/3 md:w-1/4 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${course.image_url || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'})` }}
                  ></div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{course.course_name}</h3>
                        <p className="text-gray-500 flex items-center text-sm">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {course.location}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {course.rating && (
                          <div className="flex items-center bg-[#FBFCFB] px-2 py-0.5 rounded-md border border-gray-100">
                            <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-[#FBFCFB] px-3 py-2 rounded-md">
                        <p className="text-xs text-gray-500">Last Played</p>
                        <p className="font-medium text-sm">{format(new Date(course.last_played), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="bg-[#FBFCFB] px-3 py-2 rounded-md">
                        <p className="text-xs text-gray-500">Times Played</p>
                        <p className="font-medium text-sm">{course.times_played}</p>
                      </div>
                      <div className="bg-[#FBFCFB] px-3 py-2 rounded-md">
                        <p className="text-xs text-gray-500">Best Score</p>
                        <p className="font-medium text-sm">{course.best_score || '-'}</p>
                      </div>
                      <div className="flex items-center justify-end md:justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full"
                          title="View Course Details"
                          onClick={() => {/* View course details */}}
                        >
                          <Eye className="h-4 w-4 text-[#448460]" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full"
                          title="View Course on Map"
                          onClick={() => {/* View on map */}}
                        >
                          <MapIcon className="h-4 w-4 text-[#448460]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface CourseCardProps {
  course: typeof mockCourseHistory[0];
  onClick: () => void;
}

function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="relative h-36">
        <img 
          src={course.image_url} 
          alt={course.course_name} 
          className="w-full h-full object-cover"
        />
        {course.favorite && (
          <div className="absolute top-2 right-2 bg-[#448460] text-white p-1 rounded-full">
            <HeartIcon className="h-4 w-4 fill-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#1F1E1F] truncate">{course.course_name}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{course.location}</span>
        </div>
        
        <div className="flex justify-between items-center mt-3 text-sm">
          <div className="flex items-center text-gray-700">
            <Trophy className="h-4 w-4 mr-1 text-[#448460]" />
            <span>{course.best_score}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-1 text-[#448460]" />
            <span className="text-xs">{format(new Date(course.last_played), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <ThumbsUp className="h-4 w-4 mr-1 text-[#448460]" />
            <span>{course.times_played}x</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PlayedCoursesHistory; 