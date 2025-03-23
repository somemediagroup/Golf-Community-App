import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Calendar, Filter, ChevronDown, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Interfaces
interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  date: string;
  content: string;
  photos: string[];
  likes: number;
  isHelpful?: boolean;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Mock data
const mockRatingStats: RatingStats = {
  average: 4.2,
  total: 126,
  distribution: {
    5: 64,
    4: 38,
    3: 18,
    2: 4,
    1: 2
  }
};

const mockReviews: Review[] = [
  {
    id: "1",
    authorId: "user1",
    authorName: "Michael Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    date: "2023-09-15T09:24:00Z",
    content: "Absolutely stunning course! The fairways were immaculate and the greens were rolling true. The staff was friendly and accommodating. I'll definitely be back soon. The views on the back nine are simply spectacular, especially at sunset.",
    photos: [
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=500&q=60"
    ],
    likes: 24
  },
  {
    id: "2",
    authorId: "user2",
    authorName: "Sarah Williams",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    date: "2023-08-22T14:15:00Z",
    content: "Great course layout and challenging holes. The only downside was the pace of play was a bit slow on a busy Saturday. The staff was very professional and the clubhouse facilities are excellent. Would recommend playing on weekdays if possible.",
    photos: [],
    likes: 15
  },
  {
    id: "3",
    authorId: "user3",
    authorName: "David Thompson",
    authorAvatar: "",
    rating: 3,
    date: "2023-07-10T11:30:00Z",
    content: "Decent course but a bit overpriced for what you get. The conditions were good but not spectacular. Bunkers needed some maintenance. Pro shop staff was helpful and the food at the clubhouse was excellent.",
    photos: [
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=500&q=60"
    ],
    likes: 8
  },
  {
    id: "4",
    authorId: "user4",
    authorName: "Emma Davis",
    authorAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 5,
    date: "2023-06-18T16:45:00Z",
    content: "One of the best golf experiences I've had! The course was in perfect condition and the layout is challenging but fair. The staff went above and beyond to make our group feel welcome. The practice facilities are also top-notch.",
    photos: [],
    likes: 32
  },
  {
    id: "5",
    authorId: "user5",
    authorName: "Robert Wilson",
    authorAvatar: "",
    rating: 2,
    date: "2023-05-30T10:15:00Z",
    content: "Disappointed with the condition of the greens. They were recently aerated and this wasn't mentioned when I booked. The layout is good but several areas were under maintenance. Hopefully it will be better when I return in a few months.",
    photos: [],
    likes: 3
  }
];

const CourseRating = () => {
  const { id } = useParams<{ id: string }>();
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "helpful">("recent");
  const [hasPhotosOnly, setHasPhotosOnly] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch data from an API
        // const [statsResponse, reviewsResponse] = await Promise.all([
        //   api.getCourseRatingStats(id),
        //   api.getCourseReviews(id)
        // ]);
        
        setRatingStats(mockRatingStats);
        setReviews(mockReviews);
        setFilteredReviews(mockReviews);
      } catch (error) {
        console.error("Error fetching course ratings:", error);
        setError("Failed to load ratings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Apply filters and sorting
  useEffect(() => {
    if (!reviews.length) return;
    
    let result = [...reviews];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(review => 
        review.content.toLowerCase().includes(query) || 
        review.authorName.toLowerCase().includes(query)
      );
    }
    
    // Filter by rating
    if (ratingFilter.length > 0) {
      result = result.filter(review => ratingFilter.includes(review.rating));
    }
    
    // Filter by photos
    if (hasPhotosOnly) {
      result = result.filter(review => review.photos.length > 0);
    }
    
    // Sort reviews
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "helpful":
        result.sort((a, b) => b.likes - a.likes);
        break;
    }
    
    setFilteredReviews(result);
  }, [reviews, searchQuery, ratingFilter, sortBy, hasPhotosOnly]);
  
  // Toggle rating filter
  const toggleRatingFilter = (rating: number) => {
    setRatingFilter(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Calculate percentage for rating distribution
  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };
  
  // Mark review as helpful
  const markHelpful = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId
          ? { ...review, likes: review.likes + 1, isHelpful: true }
          : review
      )
    );
  };
  
  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (!ratingStats) {
    return (
      <div className="text-center p-8">
        <p>No ratings available for this course yet.</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container max-w-4xl mx-auto"
    >
      {/* Rating Summary */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-bold text-green-700">{ratingStats.average.toFixed(1)}</span>
              <div className="flex items-center my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(ratingStats.average)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">Based on {ratingStats.total} reviews</span>
            </div>
            
            {/* Rating Distribution */}
            <div className="col-span-2">
              <h3 className="font-medium mb-3">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center">
                    <span className="w-8 text-sm">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-2" />
                    <Progress 
                      value={calculatePercentage(ratingStats.distribution[rating as keyof typeof ratingStats.distribution], ratingStats.total)} 
                      className="h-2 flex-1" 
                    />
                    <span className="w-12 text-right text-sm text-gray-500">
                      {ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reviews"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-200" variant="outline">
                  {ratingFilter.length || hasPhotosOnly ? ratingFilter.length + (hasPhotosOnly ? 1 : 0) : 0}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <h4 className="font-medium mb-2">Rating</h4>
                <div className="flex flex-wrap gap-1 mb-4">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Button
                      key={rating}
                      variant={ratingFilter.includes(rating) ? "default" : "outline"}
                      size="sm"
                      className="gap-1"
                      onClick={() => toggleRatingFilter(rating)}
                    >
                      {rating} <Star className={`h-3 w-3 ${ratingFilter.includes(rating) ? "" : "text-yellow-400"}`} />
                    </Button>
                  ))}
                </div>
                
                <h4 className="font-medium mb-2">Additional Filters</h4>
                <Button
                  variant={hasPhotosOnly ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start mb-2"
                  onClick={() => setHasPhotosOnly(!hasPhotosOnly)}
                >
                  With Photos Only
                </Button>
                
                <Separator className="my-2" />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setRatingFilter([]);
                    setHasPhotosOnly(false);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as "recent" | "rating" | "helpful")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.authorAvatar} />
                    <AvatarFallback>{getInitials(review.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between flex-wrap">
                      <h3 className="font-medium">{review.authorName}</h3>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.content}</p>
                    
                    {review.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 gap-1"
                        disabled={review.isHelpful}
                        onClick={() => markHelpful(review.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {review.isHelpful ? "Marked as helpful" : "Helpful"} ({review.likes})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">No reviews match your filters</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setRatingFilter([]);
                setHasPhotosOnly(false);
                setSortBy("recent");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseRating; 