import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Map, Flag, Star, Calendar, Check, Route, Search, Filter, ChevronDown } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";

// Types
interface Course {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  holes: number;
  par: number;
  difficulty: string;
  visited: boolean;
  lastPlayed?: string;
}

interface CourseFilter {
  search: string;
  difficulty: string[];
  visited: boolean | null;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CourseFilter>({
    search: "",
    difficulty: [],
    visited: null
  });
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('courses')
        //   .select('*')
        //   .order('name');
        
        // if (error) throw error;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockCourses: Course[] = [
          {
            id: "1",
            name: "Pine Valley Golf Club",
            location: "Pine Valley, NJ",
            imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
            rating: 4.9,
            reviewCount: 142,
            holes: 18,
            par: 72,
            difficulty: "Championship",
            visited: true,
            lastPlayed: "2023-09-15"
          },
          {
            id: "2",
            name: "Augusta National Golf Club",
            location: "Augusta, GA",
            imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
            rating: 5.0,
            reviewCount: 210,
            holes: 18,
            par: 72,
            difficulty: "Championship",
            visited: false
          },
          {
            id: "3",
            name: "Pebble Beach Golf Links",
            location: "Pebble Beach, CA",
            imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
            rating: 4.8,
            reviewCount: 189,
            holes: 18,
            par: 72,
            difficulty: "Difficult",
            visited: true,
            lastPlayed: "2023-07-22"
          },
          {
            id: "4",
            name: "St Andrews Links",
            location: "St Andrews, Scotland",
            imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
            rating: 4.7,
            reviewCount: 231,
            holes: 18,
            par: 72,
            difficulty: "Championship",
            visited: false
          },
          {
            id: "5",
            name: "Bethpage Black",
            location: "Farmingdale, NY",
            imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
            rating: 4.6,
            reviewCount: 178,
            holes: 18,
            par: 71,
            difficulty: "Difficult",
            visited: true,
            lastPlayed: "2023-08-05"
          }
        ];
        
        setCourses(mockCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  const toggleCourseVisited = async (courseId: string) => {
    try {
      // Find the course to toggle
      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
          const visited = !course.visited;
          const lastPlayed = visited ? new Date().toISOString().split('T')[0] : undefined;
          
          // In a real app, update in Supabase
          // await supabase
          //   .from('user_courses')
          //   .upsert({ 
          //     user_id: auth.user.id, 
          //     course_id: courseId,
          //     visited,
          //     last_played: lastPlayed
          //   });
          
          return { ...course, visited, lastPlayed };
        }
        return course;
      });
      
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };
  
  // Filter courses based on the active tab and filters
  const filteredCourses = courses.filter(course => {
    // Tab filter
    if (activeTab === "visited" && !course.visited) return false;
    if (activeTab === "wishlist" && course.visited) return false;
    
    // Search filter
    if (filter.search && !course.name.toLowerCase().includes(filter.search.toLowerCase()) && 
        !course.location.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    // Difficulty filter
    if (filter.difficulty.length > 0 && !filter.difficulty.includes(course.difficulty)) {
      return false;
    }
    
    // Visited filter
    if (filter.visited !== null && course.visited !== filter.visited) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Golf Courses</h1>
          <p className="text-muted-foreground mb-6">
            Discover, track, and review golf courses you've played
          </p>
          
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses by name or location..."
                className="pl-9"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setFilter({...filter, difficulty: []})}>
                  Clear Filters
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({...filter, visited: filter.visited === true ? null : true})}>
                  {filter.visited === true ? "✓" : ""} Played Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({...filter, visited: filter.visited === false ? null : false})}>
                  {filter.visited === false ? "✓" : ""} Not Played Yet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({...filter, difficulty: filter.difficulty.includes("Beginner") ? 
                  filter.difficulty.filter(d => d !== "Beginner") : [...filter.difficulty, "Beginner"]})}>
                  {filter.difficulty.includes("Beginner") ? "✓" : ""} Beginner Friendly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({...filter, difficulty: filter.difficulty.includes("Intermediate") ? 
                  filter.difficulty.filter(d => d !== "Intermediate") : [...filter.difficulty, "Intermediate"]})}>
                  {filter.difficulty.includes("Intermediate") ? "✓" : ""} Intermediate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({...filter, difficulty: filter.difficulty.includes("Difficult") ? 
                  filter.difficulty.filter(d => d !== "Difficult") : [...filter.difficulty, "Difficult"]})}>
                  {filter.difficulty.includes("Difficult") ? "✓" : ""} Difficult
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({...filter, difficulty: filter.difficulty.includes("Championship") ? 
                  filter.difficulty.filter(d => d !== "Championship") : [...filter.difficulty, "Championship"]})}>
                  {filter.difficulty.includes("Championship") ? "✓" : ""} Championship
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="visited">
                <Check className="h-4 w-4 mr-2" />
                Played
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Flag className="h-4 w-4 mr-2" />
                Wishlist
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton loaders while loading
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden group">
                <CardHeader className="p-0 relative">
                  <img 
                    src={course.imageUrl} 
                    alt={course.name} 
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant={course.visited ? "default" : "secondary"}
                      className="h-8 w-8 rounded-full"
                      onClick={() => toggleCourseVisited(course.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Link to={`/courses/${course.id}`} className="hover:underline">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                  </Link>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Map className="h-3 w-3 mr-1" />
                    {course.location}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-muted-foreground text-xs ml-1">({course.reviewCount})</span>
                    </div>
                    <Badge variant="outline">{course.difficulty}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Flag className="h-3 w-3 mr-1" />
                      {course.holes} holes
                    </div>
                    <div className="flex items-center">
                      <Route className="h-3 w-3 mr-1" />
                      Par {course.par}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 bg-muted/20 flex justify-between items-center">
                  {course.visited ? (
                    <div className="text-xs flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Played: {course.lastPlayed}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Not played yet</div>
                  )}
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/courses/${course.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(CoursesPage); 