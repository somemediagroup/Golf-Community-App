import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Filter, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for golf courses
const mockCourses = [
  {
    id: "1",
    name: "Pine Valley Golf Club",
    location: "Pine Valley, NJ",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 4.9,
    reviews: 142,
    holeCount: 18,
    par: 70,
    length: 7181,
    difficulty: "Championship",
    priceRange: "$$$",
    amenities: ["Pro Shop", "Driving Range", "Restaurant", "Caddies"],
    description: "Pine Valley Golf Club consistently ranks as one of the top golf courses in the world, known for its challenging layout and beautiful surroundings."
  },
  {
    id: "2",
    name: "Augusta National Golf Club",
    location: "Augusta, GA",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 5.0,
    reviews: 210,
    holeCount: 18,
    par: 72,
    length: 7475,
    difficulty: "Championship",
    priceRange: "$$$$",
    amenities: ["Pro Shop", "Driving Range", "Restaurant", "Caddies", "Clubhouse"],
    description: "Home of the Masters Tournament, Augusta National is one of the most famous golf courses in the world, known for its immaculate conditions and rich history."
  },
  {
    id: "3",
    name: "Pebble Beach Golf Links",
    location: "Pebble Beach, CA",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 4.8,
    reviews: 189,
    holeCount: 18,
    par: 72,
    length: 7075,
    difficulty: "Championship",
    priceRange: "$$$$",
    amenities: ["Pro Shop", "Driving Range", "Restaurant", "Caddies", "Clubhouse", "Ocean Views"],
    description: "Set along the rugged coastline of the Monterey Peninsula, Pebble Beach offers breathtaking views and one of the most exciting layouts in golf."
  },
  {
    id: "4",
    name: "St Andrews Links (Old Course)",
    location: "St Andrews, Scotland",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    reviews: 231,
    holeCount: 18,
    par: 72,
    length: 7305,
    difficulty: "Championship",
    priceRange: "$$$",
    amenities: ["Pro Shop", "Driving Range", "Restaurant", "Caddies", "Historic"],
    description: "Known as the 'Home of Golf', the Old Course at St Andrews is the oldest golf course in the world and offers a unique and traditional golfing experience."
  },
  {
    id: "5",
    name: "Torrey Pines Golf Course",
    location: "La Jolla, CA",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    reviews: 156,
    holeCount: 18,
    par: 72,
    length: 7607,
    difficulty: "Difficult",
    priceRange: "$$$",
    amenities: ["Pro Shop", "Driving Range", "Restaurant", "Ocean Views"],
    description: "Perched on the cliffs overlooking the Pacific Ocean, Torrey Pines has hosted multiple U.S. Opens and offers spectacular views along its challenging layout."
  },
  {
    id: "6",
    name: "Pinehurst Resort (No. 2)",
    location: "Pinehurst, NC",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    reviews: 178,
    holeCount: 18,
    par: 72,
    length: 7588,
    difficulty: "Championship",
    priceRange: "$$$",
    amenities: ["Pro Shop", "Driving Range", "Restaurant", "Clubhouse", "Resort"],
    description: "A masterpiece of course design by Donald Ross, Pinehurst No. 2 has hosted multiple U.S. Opens and is known for its crowned greens and strategic layout."
  }
];

// Course difficulty options
const difficultyOptions = [
  { value: "beginner", label: "Beginner Friendly" },
  { value: "intermediate", label: "Intermediate" },
  { value: "difficult", label: "Difficult" },
  { value: "championship", label: "Championship" },
];

export default function CourseExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState("grid");

  // All possible amenities
  const allAmenities = Array.from(
    new Set(mockCourses.flatMap((course) => course.amenities))
  ).sort();

  // Filter and sort courses
  const filteredCourses = mockCourses
    .filter((course) => {
      // Search query filter
      if (
        searchQuery &&
        !course.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      // Price filter
      if (priceFilter.length > 0 && !priceFilter.includes(course.priceRange)) {
        return false;
      }
      
      // Difficulty filter
      if (
        difficultyFilter &&
        course.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()
      ) {
        return false;
      }
      
      // Amenity filter
      if (
        amenityFilter.length > 0 &&
        !amenityFilter.every((amenity) => 
          course.amenities.some((a) => a.toLowerCase() === amenity.toLowerCase())
        )
      ) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "rating") {
        return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
      } else if (sortBy === "name") {
        return sortOrder === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else if (sortBy === "reviews") {
        return sortOrder === "desc" ? b.reviews - a.reviews : a.reviews - b.reviews;
      }
      return 0;
    });

  // Toggle price filter
  const togglePriceFilter = (price: string) => {
    if (priceFilter.includes(price)) {
      setPriceFilter(priceFilter.filter((p) => p !== price));
    } else {
      setPriceFilter([...priceFilter, price]);
    }
  };
  
  // Toggle amenity filter
  const toggleAmenityFilter = (amenity: string) => {
    if (amenityFilter.includes(amenity)) {
      setAmenityFilter(amenityFilter.filter((a) => a !== amenity));
    } else {
      setAmenityFilter([...amenityFilter, amenity]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setPriceFilter([]);
    setDifficultyFilter("");
    setAmenityFilter([]);
    setDistanceRange([0, 100]);
    setSortBy("rating");
    setSortOrder("desc");
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Golf Courses</h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by name or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="reviews">Reviews</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="h-10 w-10"
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
          
          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(priceFilter.length > 0 || difficultyFilter || amenityFilter.length > 0) && (
                  <Badge variant="secondary" className="ml-1">
                    {priceFilter.length + (difficultyFilter ? 1 : 0) + amenityFilter.length}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter Courses</DrawerTitle>
                <DrawerDescription>
                  Narrow down courses based on your preferences
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="px-4 py-2">
                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Price Range</h4>
                    <div className="flex flex-wrap gap-2">
                      {["$", "$$", "$$$", "$$$$"].map((price) => (
                        <Button
                          key={price}
                          variant={priceFilter.includes(price) ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePriceFilter(price)}
                        >
                          {price}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Distance */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm font-medium">Distance</Label>
                      <span className="text-sm text-muted-foreground">
                        {distanceRange[0]} - {distanceRange[1]} miles
                      </span>
                    </div>
                    <Slider
                      value={distanceRange}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={setDistanceRange}
                      className="my-4"
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Difficulty */}
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <Select
                      value={difficultyFilter}
                      onValueChange={setDifficultyFilter}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Any difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any difficulty</SelectItem>
                        {difficultyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  {/* Amenities */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {allAmenities.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Switch
                            id={`amenity-${amenity}`}
                            checked={amenityFilter.includes(amenity)}
                            onCheckedChange={() => toggleAmenityFilter(amenity)}
                          />
                          <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <DrawerFooter>
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
                <DrawerClose asChild>
                  <Button>Apply Filters</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          
          <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
            <TabsList className="h-10">
              <TabsTrigger value="grid" className="px-3">Grid</TabsTrigger>
              <TabsTrigger value="list" className="px-3">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {mockCourses.length} courses
        </p>
        
        {(priceFilter.length > 0 || difficultyFilter || amenityFilter.length > 0) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Course Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white text-primary hover:bg-white">
                      {course.par} Par • {course.holeCount} Holes
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{course.name}</h3>
                      <div className="flex items-center mt-1 text-muted-foreground text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {course.location}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({course.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-4">
                    <Badge variant="outline">{course.difficulty}</Badge>
                    <Badge variant="outline">{course.priceRange}</Badge>
                    {course.amenities.slice(0, 2).map((amenity) => (
                      <Badge variant="outline" key={amenity}>
                        {amenity}
                      </Badge>
                    ))}
                    {course.amenities.length > 2 && (
                      <Badge variant="outline">+{course.amenities.length - 2} more</Badge>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="border-t p-4">
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Course List */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-40 md:h-auto overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{course.name}</h3>
                        <div className="flex items-center mt-1 text-muted-foreground text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {course.location}
                        </div>
                        
                        <div className="mt-3 flex items-center gap-6">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                            <span className="font-medium">{course.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">({course.reviews})</span>
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Par:</span> {course.par}
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Length:</span> {course.length} yds
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2 hidden md:block">
                          {course.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge>{course.priceRange}</Badge>
                        <Badge variant="outline">{course.difficulty}</Badge>
                        
                        <div className="flex flex-wrap gap-1 mt-auto justify-end">
                          {course.amenities.slice(0, 3).map((amenity) => (
                            <Badge variant="secondary" key={amenity} className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex md:flex-col justify-between items-center border-t md:border-t-0 md:border-l">
                    <Button className="w-full">View Details</Button>
                    <Button variant="outline" size="icon" className="mt-2">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No courses found matching your criteria.</p>
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      )}
    </div>
  );
} 