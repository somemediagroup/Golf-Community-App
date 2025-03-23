import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Star, 
  UserCheck, 
  Check, 
  ChevronLeft,
  ArrowLeft,
  Calendar,
  Flag,
  Wind,
  Droplet,
  Thermometer,
  Info,
  CheckCircle,
  Image,
  Share2,
  StarIcon,
  MapPinIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import CourseRating from '@/features/courses/CourseRating';

// Types
interface Course {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  details: {
    type: string; // Public, Private, Resort, etc.
    holes: number;
    par: number;
    length: number; // in yards
    rating: number; // course rating
    slope: number; // slope rating
    yearEstablished: number;
    architect: string;
    difficulty: string; // Beginner, Intermediate, Advanced, Championship
  };
  pricing: {
    weekday: string; // pricing range
    weekend: string;
    twilight: string;
    cart: string;
  };
  amenities: string[]; // Driving Range, Pro Shop, Restaurant, etc.
  features: string[]; // Water Hazards, Bunkers, etc.
  images: {
    main: string;
    gallery: string[];
  };
  weather?: {
    condition: string;
    temperature: number;
    wind: number;
    precipitation: number;
  };
  stats: {
    rating: number;
    reviewCount: number;
    checkInsCount: number;
  };
}

interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  image_url: string;
  created_at: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    avatar_url: string;
  };
}

interface CheckIn {
  id: string;
  course_id: string;
  user_id: string;
  created_at: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    avatar_url: string;
  };
}

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reviewText, setReviewText] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        if (!id) return;

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch course reviews with user info
        const reviewsQuery = `
          id, course_id, user_id, rating, review_text, image_url, created_at,
          user:profiles!user_id(username, firstName, lastName, avatar_url)
        `;

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('course_reviews')
          .select(reviewsQuery)
          .eq('course_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        if (reviewsData) {
          const formattedReviews = reviewsData.map(review => ({
            ...review,
            user: Array.isArray(review.user) ? review.user[0] : review.user
          }));
          setReviews(formattedReviews as CourseReview[]);
        }

        // Calculate average rating
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(Math.round((total / reviewsData.length) * 10) / 10);
        }

        // Fetch check-ins with user info
        const checkInsQuery = `
          id, course_id, user_id, created_at,
          user:profiles!user_id(username, firstName, lastName, avatar_url)
        `;

        const { data: checkInsData, error: checkInsError } = await supabase
          .from('course_check_ins')
          .select(checkInsQuery)
          .eq('course_id', id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (checkInsError) throw checkInsError;
        if (checkInsData) {
          const formattedCheckIns = checkInsData.map(checkIn => ({
            ...checkIn,
            user: Array.isArray(checkIn.user) ? checkIn.user[0] : checkIn.user
          }));
          setCheckIns(formattedCheckIns as CheckIn[]);
        }

      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const handleCheckIn = () => {
    if (!course) return;
    navigate(`/courses/${id}/check-in`);
  };
  
  const handleRating = () => {
    if (!course) return;
    navigate(`/courses/${id}/ratings`);
  };

  const handleSubmitReview = async () => {
    if (!user || !course) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('course_reviews')
        .insert([
          { 
            course_id: course.id, 
            user_id: user.id,
            rating,
            review_text: reviewText
          }
        ]);
        
      if (error) throw error;
      
      setSuccess('Your review has been submitted!');
      
      // Add the new review to the list
      const newReview = {
        id: 'temp-id', // Will be replaced when we refresh
        course_id: course.id,
        user_id: user.id,
        rating,
        review_text: reviewText,
        image_url: null,
        created_at: new Date().toISOString(),
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar_url: user.avatar_url
        }
      };
      
      setReviews([newReview, ...reviews]);
      
      // Reset form
      setReviewText('');
      setRating(5);
      
      // Recalculate average rating
      const total = [...reviews, newReview].reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(Math.round((total / (reviews.length + 1)) * 10) / 10);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/courses">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-16"
    >
      {/* Hero Section */}
      <div 
        className="h-80 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${course.images.main})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="container max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <Badge variant="outline" className="mb-2 bg-green-700/80 text-white border-none w-fit">
            {course.details.type} Course
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.name}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{course.location.city}, {course.location.state}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{course.stats.rating} ({course.stats.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center">
              <Flag className="h-4 w-4 mr-1" />
              <span>{course.details.holes} Holes, Par {course.details.par}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none gap-1">
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Share</span>
              </Button>
              <Button onClick={handleCheckIn} className="flex-1 sm:flex-none gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Check In</span>
              </Button>
              <Button onClick={handleRating} className="flex-1 sm:flex-none gap-1">
                <StarIcon className="h-4 w-4" />
                Rate
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Description and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About {course.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{course.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <h3 className="font-medium mb-3">Course Details</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{course.details.type}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Holes:</span>
                          <span className="font-medium">{course.details.holes}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Par:</span>
                          <span className="font-medium">{course.details.par}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Length:</span>
                          <span className="font-medium">{course.details.length} yards</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Course Rating:</span>
                          <span className="font-medium">{course.details.rating}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Slope Rating:</span>
                          <span className="font-medium">{course.details.slope}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Established:</span>
                          <span className="font-medium">{course.details.yearEstablished}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Architect:</span>
                          <span className="font-medium">{course.details.architect}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="font-medium">{course.details.difficulty}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Pricing</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Weekday:</span>
                          <span className="font-medium">{course.pricing.weekday}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Weekend:</span>
                          <span className="font-medium">{course.pricing.weekend}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Twilight:</span>
                          <span className="font-medium">{course.pricing.twilight}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Cart Fee:</span>
                          <span className="font-medium">{course.pricing.cart}</span>
                        </li>
                      </ul>
                      
                      <h3 className="font-medium mt-6 mb-3">Contact Information</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{course.contact.phone}</span>
                        </li>
                        <li className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-500" />
                          <a href={course.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Website</a>
                        </li>
                        <li className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                          <span>{course.location.address}, {course.location.city}, {course.location.state} {course.location.zipCode}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Features and Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-medium mb-3">Course Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Map Preview (placeholder) */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="bg-gray-200 h-60 rounded-md flex items-center justify-center"
                    style={{
                      backgroundImage: `url(https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/${course.location.coordinates.longitude},${course.location.coordinates.latitude},14,0/800x400?access_token=pk.eyJ1IjoiZ29sZmNvbW11bml0eSIsImEiOiJja3NhbXBsZXRva2VuMTIzIn0.dGVlb3BtZW50cGxhbnMK)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="bg-white p-2 rounded-md shadow-md">
                      <MapPin className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather Card */}
              {course.weather && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Weather</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold">{course.weather.temperature}°F</p>
                        <p className="text-gray-500">{course.weather.condition}</p>
                      </div>
                      <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center">
                        {course.weather.condition === "Sunny" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                          </svg>
                        ) : (
                          <Thermometer className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <Wind className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Wind: {course.weather.wind} mph</span>
                      </div>
                      <div className="flex items-center">
                        <Droplet className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Precip: {course.weather.precipitation}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Course Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mb-1" />
                      <span className="text-lg font-bold">{course.stats.rating}</span>
                      <span className="text-xs text-gray-500">Rating</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-lg font-bold">{course.stats.reviewCount}</span>
                      <span className="text-xs text-gray-500">Reviews</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                      <span className="text-lg font-bold">{course.stats.checkInsCount}</span>
                      <span className="text-xs text-gray-500">Check-ins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Call to Action */}
              <Card className="bg-green-50 border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-800">Ready to Play?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-4 text-sm">Book a tee time or check in to share your experience with the community.</p>
                  <div className="space-y-2">
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Tee Time
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleCheckIn}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Check In & Rate
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Tips */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Golf Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <p>The signature hole is #7, a challenging par 3 over water.</p>
                    </div>
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <p>Greens tend to break toward the clubhouse.</p>
                    </div>
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <p>The practice facility opens one hour before the first tee time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Course Gallery</CardTitle>
              <CardDescription>Photos of {course.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.images.gallery.map((image, index) => (
                  <div key={index} className="aspect-[4/3] overflow-hidden rounded-md">
                    <img 
                      src={image} 
                      alt={`${course.name} - Photo ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-0">
          <CourseRating />
        </TabsContent>
      </div>
    </motion.div>
  );
};

// Helper component for MessageSquare icon since it's not included in the imports
const MessageSquare = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default CourseDetailPage; 