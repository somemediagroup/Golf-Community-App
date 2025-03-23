import { useState, useEffect, useCallback, Suspense, lazy, useRef, useMemo } from "react";
import { ChevronRight, Calendar, Clock, User, Search, ExternalLink, ArrowRight, Filter, TrendingUp, ChevronDown, NewspaperIcon, CheckIcon, AlertCircleIcon, SlidersHorizontal, Loader2Icon, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import NewsCard from "./NewsCard";
import FeaturedNews from "./FeaturedNews";
import NewsSidebar from "./NewsSidebar";
import NewsFilters, { DateRange } from "./NewsFilters";
import { useToast } from "@/components/ui/use-toast";
import { withAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { Link } from "react-router-dom";

// Define NewsArticle interface
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  authorTitle?: string;
  category: string;
  publishDate: string;
  readTime: string;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  featured?: boolean;
  isBookmarked: boolean;
  url: string;
  publishedAt: string;
  tags: string[];
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  prize: string;
  featured?: boolean;
  leaderboard?: {
    position: number;
    player: string;
    country: string;
    score: string;
  }[];
  url: string;
}

export interface GolfTip {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorAvatar?: string;
  imageUrl: string;
  videoUrl?: string;
  url: string;
}

// Cache for news data
const newsCache = {
  data: null as NewsArticle[] | null,
  timestamp: 0
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Categories for filtering
const categories = {
  "all": "All Categories",
  "tournaments": "Tournaments",
  "equipment": "Equipment",
  "courses": "Courses",
  "instruction": "Instruction",
  "players": "Players",
  "lifestyle": "Lifestyle"
};

// Convert categories to array of options for NewsFilters
const categoryOptions = Object.entries(categories).map(([value, label]) => ({
  value,
  label
}));

// Source options
const sourceOptions = [
  { value: "pgatour", label: "PGA Tour" },
  { value: "lpga", label: "LPGA" },
  { value: "europeantour", label: "European Tour" },
  { value: "golfchannel", label: "Golf Channel" },
  { value: "golfdigest", label: "Golf Digest" },
  { value: "golfweek", label: "Golfweek" },
  { value: "usga", label: "USGA" }
];

// Mock news data
const mockNewsData: NewsArticle[] = [
  {
    id: "1",
    title: "Scottie Scheffler Wins Masters for Second Time",
    excerpt: "World number one dominates at Augusta National to claim his second green jacket in three years.",
    content: "Scottie Scheffler put on a masterclass performance at Augusta National, winning his second Masters title in three years. The world number one finished at 12-under par, four shots ahead of his nearest competitor. Scheffler's controlled play and exceptional short game proved the difference as he navigated the challenging conditions with apparent ease.\n\nThe victory cements Scheffler's position at the top of world golf, adding another major championship to his impressive resume. His final round 68 included five birdies and just one bogey, a model of consistency that none of his challengers could match.\n\n\"It's such a special place,\" Scheffler said after being presented with the green jacket. \"To win here once was amazing, but to do it twice is beyond my wildest dreams.\"",
    author: "James Richards",
    authorAvatar: "https://placehold.co/60",
    authorTitle: "Senior Golf Correspondent",
    category: "tournaments",
    publishDate: "2023-04-14",
    readTime: "4 min",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    source: "Golf Digest",
    sourceUrl: "https://www.golfdigest.com",
    featured: true,
    isBookmarked: false,
    url: "/news/1",
    publishedAt: "2023-04-14T18:30:00Z",
    tags: ["Masters", "Scottie Scheffler", "Major Championships", "PGA Tour", "Augusta"]
  },
  {
    id: "2",
    title: "TaylorMade Releases Revolutionary New Driver",
    excerpt: "The new Stealth 2 driver promises unprecedented ball speed and forgiveness with carbon face technology.",
    content: "TaylorMade Golf has unveiled its new Stealth 2 driver, featuring groundbreaking carbon face technology that the company claims will revolutionize driver performance. The new model builds on the success of the original Stealth, with improvements to durability, sound, and overall performance.\n\nAccording to TaylorMade, the Stealth 2 produces ball speeds up to 3 mph faster than its predecessor, resulting in distance gains of 5-8 yards for most players. The 60X Carbon Twist Face is 2g lighter than the previous generation, allowing engineers to redistribute weight for improved forgiveness and optimal launch conditions.\n\n\"We've taken everything we learned from the original Stealth and elevated it,\" said Todd Beach, TaylorMade's Senior Vice President of R&D. \"The combination of the carbon face with our new internal weighting structure creates a driver that's not only longer but significantly more forgiving.\"",
    author: "Michael Chen",
    authorAvatar: "https://placehold.co/60",
    authorTitle: "Equipment Specialist",
    category: "equipment",
    publishDate: "2023-04-10",
    readTime: "5 min",
    imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2033&q=80",
    source: "Golf Monthly",
    sourceUrl: "https://www.golfmonthly.com",
    isBookmarked: true,
    url: "/news/2",
    publishedAt: "2023-04-10T14:15:00Z",
    tags: ["Equipment", "TaylorMade", "Drivers", "Technology", "Review"]
  },
  {
    id: "3",
    title: "Pebble Beach to Host 2028 Ryder Cup",
    excerpt: "The iconic Californian course will host the biennial team competition for the first time in its history.",
    content: "The PGA of America and Ryder Cup Europe have announced that Pebble Beach Golf Links will host the 2028 Ryder Cup. This marks the first time the iconic Californian course will host the biennial team competition between the United States and Europe.\n\nPebble Beach, which has hosted six U.S. Opens and will host a seventh in 2027, is widely regarded as one of the most beautiful courses in the world. Its spectacular coastal setting along the rugged Monterey Peninsula will provide a stunning backdrop for what has become one of golf's most watched events.\n\n\"Pebble Beach is a national golf treasure and bringing the Ryder Cup here is a perfect match,\" said PGA of America CEO Seth Waugh. \"The course has a rich history of hosting USGA and PGA Championships, and we're thrilled to add the Ryder Cup to its storied legacy.\"",
    author: "Sarah Johnson",
    authorAvatar: "https://placehold.co/60",
    authorTitle: "Tour Correspondent",
    category: "courses",
    publishDate: "2023-04-05",
    readTime: "3 min",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    source: "Golf Channel",
    sourceUrl: "https://www.golfchannel.com",
    isBookmarked: false,
    url: "/news/3",
    publishedAt: "2023-04-05T12:00:00Z",
    tags: ["Ryder Cup", "Pebble Beach", "Tournament Venues", "Major Championships"]
  },
  {
    id: "4",
    title: "Nelly Korda Wins Fifth Consecutive LPGA Event",
    excerpt: "The American star continues her historic streak with a dominant performance at the LPGA Championship.",
    content: "Nelly Korda made history on Sunday, winning her fifth consecutive LPGA tournament with a three-shot victory at the LPGA Championship. Korda's remarkable streak ties Nancy Lopez's record set in 1978 and firmly establishes her as one of the most dominant players in women's golf history.\n\nKorda shot a final-round 68 to finish at 14-under par, pulling away from a packed leaderboard with four birdies on the back nine. Her ball-striking was impeccable throughout the week, hitting 80% of fairways and 77% of greens in regulation.\n\n\"I'm just trying to stay in the moment and not think too much about streaks or records,\" Korda said after her win. \"But this is pretty special, and to do it at a major championship makes it even more meaningful.\"",
    author: "Robert Wilson",
    authorAvatar: "https://placehold.co/60",
    authorTitle: "Rules & Equipment Editor",
    category: "players",
    publishDate: "2023-03-28",
    readTime: "4 min",
    imageUrl: "https://images.unsplash.com/photo-1632150253188-343ecee203c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
    source: "LPGA",
    sourceUrl: "https://www.lpga.com",
    isBookmarked: false,
    url: "/news/4",
    publishedAt: "2023-03-28T19:45:00Z",
    tags: ["LPGA", "Nelly Korda", "Women's Golf", "Major Championships", "Record Breaking"]
  },
  {
    id: "5",
    title: "Top 10 Golf Training Aids for 2025",
    excerpt: "Our experts review the latest and most effective training aids to help improve your game this year.",
    content: "As technology continues to advance, golf training aids have become more sophisticated and effective than ever before. Our team of experts has tested dozens of the newest products on the market to bring you this definitive list of the top 10 training aids for 2025.\n\nTopping our list is the PrecisionPro Swing Analyzer, which uses AI-driven sensors to provide real-time feedback on every aspect of your swing. Close behind is the FlexCore Alignment System, which has revolutionized the way golfers practice their setup and alignment.\n\nOther notable mentions include the GripMaster pressure sensing glove, the TempoTech metronome belt, and the revolutionary PuttVision augmented reality glasses that display ideal putting lines directly in your field of vision.\n\n\"The quality and effectiveness of training aids has increased dramatically in recent years,\" says Tom Williams, PGA Teaching Professional. \"These new tools make it easier than ever for golfers to practice effectively and make real improvements to their game.\"",
    author: "Emily Parker",
    authorAvatar: "https://placehold.co/60",
    authorTitle: "Business of Golf Reporter",
    category: "instruction",
    publishDate: "2023-03-20",
    readTime: "7 min",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    source: "Golf Digest",
    sourceUrl: "https://www.golfdigest.com",
    isBookmarked: true,
    url: "/news/5",
    publishedAt: "2023-03-20T09:30:00Z",
    tags: ["Training Aids", "Instruction", "Golf Technology", "Game Improvement", "Equipment"]
  },
  {
    id: "6",
    title: "U.S. Open to Introduce New Playoff Format",
    excerpt: "The USGA announces changes to the U.S. Open playoff format, moving from 18 holes to a two-hole aggregate.",
    content: "The United States Golf Association (USGA) has announced a significant change to the U.S. Open playoff format. Beginning with this year's championship, playoffs will consist of a two-hole aggregate score format instead of the traditional 18-hole playoff held the day after regulation play.\n\nThe decision brings the U.S. Open more in line with other major championships, which have all moved away from full 18-hole playoffs in recent years. The Open Championship uses a four-hole aggregate playoff, while the PGA Championship and Masters Tournament both utilize a three-hole aggregate format.\n\n\"We've listened to feedback from players, fans, and our broadcast partners,\" said John Bodenhamer, USGA Senior Managing Director of Championships. \"While we value the tradition of the 18-hole playoff, we believe this change will provide a more exciting and conclusive finish to our championship while still maintaining the integrity of the competition.\"",
    author: "David Thompson",
    authorAvatar: "https://placehold.co/60",
    authorTitle: "Rules & Equipment Editor",
    category: "tournaments",
    publishDate: "2023-03-15",
    readTime: "3 min",
    imageUrl: "https://images.unsplash.com/photo-1465478519856-e80ffe82faba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80",
    source: "USGA",
    sourceUrl: "https://www.usga.org",
    isBookmarked: false,
    url: "/news/6",
    publishedAt: "2023-03-15T15:20:00Z",
    tags: ["U.S. Open", "USGA", "Major Championships", "Tournament Format", "Rules"]
  }
];

// Mock data for tournaments
const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "The Masters",
    location: "Augusta National Golf Club, Augusta, GA",
    startDate: "2023-04-06",
    endDate: "2023-04-09",
    imageUrl: "https://placehold.co/1200x630",
    prize: "$11,500,000",
    featured: true,
    leaderboard: [
      { position: 1, player: "Jordan Spieth", country: "USA", score: "-12" },
      { position: 2, player: "Jon Rahm", country: "ESP", score: "-12" },
      { position: 3, player: "Rory McIlroy", country: "NIR", score: "-10" },
      { position: 4, player: "Brooks Koepka", country: "USA", score: "-9" },
      { position: 5, player: "Scottie Scheffler", country: "USA", score: "-8" }
    ],
    url: "https://example.com/masters"
  },
  {
    id: "2",
    name: "PGA Championship",
    location: "Oak Hill Country Club, Rochester, NY",
    startDate: "2023-05-18",
    endDate: "2023-05-21",
    imageUrl: "https://placehold.co/1200x630",
    prize: "$15,000,000",
    featured: true,
    url: "https://example.com/pga-championship"
  },
  {
    id: "3",
    name: "U.S. Open",
    location: "Los Angeles Country Club, Los Angeles, CA",
    startDate: "2023-06-15",
    endDate: "2023-06-18",
    imageUrl: "https://placehold.co/1200x630",
    prize: "$17,500,000",
    url: "https://example.com/us-open"
  },
  {
    id: "4",
    name: "The Open Championship",
    location: "Royal Liverpool, Hoylake, England",
    startDate: "2023-07-20",
    endDate: "2023-07-23",
    imageUrl: "https://placehold.co/1200x630",
    prize: "$14,000,000",
    url: "https://example.com/the-open"
  },
  {
    id: "5",
    name: "THE PLAYERS Championship",
    location: "TPC Sawgrass, Ponte Vedra Beach, FL",
    startDate: "2023-03-09",
    endDate: "2023-03-12",
    imageUrl: "https://placehold.co/1200x630",
    prize: "$25,000,000",
    url: "https://example.com/players-championship"
  }
];

// Mock data for golf tips
const mockGolfTips: GolfTip[] = [
  {
    id: "1",
    title: "Master the 50-Yard Pitch Shot",
    excerpt: "Learn this simple technique to improve your accuracy and consistency from 50 yards and in, helping you save strokes around the green.",
    category: "Short Game",
    author: "David Johnson, PGA Teaching Professional",
    authorAvatar: "https://placehold.co/60",
    imageUrl: "https://placehold.co/1200x630",
    videoUrl: "https://example.com/videos/pitch-shot-technique",
    url: "https://example.com/pitch-shot-technique"
  },
  {
    id: "2",
    title: "3 Drills to Stop Slicing Off the Tee",
    excerpt: "Fix that frustrating slice with these three practice drills that address the common causes of an open clubface at impact.",
    category: "Driving",
    author: "Maria Rodriguez, LPGA Instructor",
    authorAvatar: "https://placehold.co/60",
    imageUrl: "https://placehold.co/1200x630",
    videoUrl: "https://example.com/videos/fix-your-slice",
    url: "https://example.com/fix-your-slice"
  },
  {
    id: "3",
    title: "How to Read Greens Like a Tour Pro",
    excerpt: "Improve your putting by learning the fundamentals of green reading, including recognizing subtle breaks and understanding grain.",
    category: "Putting",
    author: "James Wilson, Former Tour Caddie",
    authorAvatar: "https://placehold.co/60",
    imageUrl: "https://placehold.co/1200x630",
    url: "https://example.com/green-reading"
  },
  {
    id: "4",
    title: "Building a Pre-Shot Routine That Works",
    excerpt: "Develop a consistent pre-shot routine that will boost your confidence and help you perform under pressure.",
    category: "Mental Game",
    author: "Dr. Susan Lee, Sports Psychologist",
    authorAvatar: "https://placehold.co/60",
    imageUrl: "https://placehold.co/1200x630",
    url: "https://example.com/pre-shot-routine"
  }
];

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "bookmarked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add cache for better performance
  const cacheRef = useRef<{
    articles: { data: NewsArticle[], timestamp: number },
    featured: { data: NewsArticle | null, timestamp: number }
  }>({
    articles: { data: [], timestamp: 0 },
    featured: { data: null, timestamp: 0 }
  });
  
  // Cache expiration time (10 minutes)
  const CACHE_EXPIRATION = 10 * 60 * 1000;

  // Use memo for filtered articles to avoid unnecessary recalculations
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];
    
    // First filter by tab
    if (activeTab === "bookmarked") {
      filtered = filtered.filter(article => article.isBookmarked);
    }
    
    // Then apply search filter if present
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    // Apply source filter
    if (selectedSources.length > 0) {
      filtered = filtered.filter(article => selectedSources.includes(article.source));
    }
    
    // Apply date filter
    if (dateRange && dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.publishDate);
        articleDate.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return articleDate >= fromDate && articleDate <= toDate;
        }
        
        return articleDate >= fromDate;
      });
    }
    
    return filtered;
  }, [articles, activeTab, searchQuery, selectedCategory, selectedSources, dateRange]);

  // Use callback for bookmark toggle to prevent unnecessary rerenders
  const handleToggleBookmark = useCallback((articleId: string) => {
    setArticles(prevArticles => {
      const updatedArticles = prevArticles.map(article =>
        article.id === articleId
          ? { ...article, isBookmarked: !article.isBookmarked }
          : article
      );
      
      // If the featured article is being updated, update it too
      if (featuredArticle && featuredArticle.id === articleId) {
        setFeaturedArticle({
          ...featuredArticle,
          isBookmarked: !featuredArticle.isBookmarked
        });
      }
      
      // Update cache
      cacheRef.current.articles = {
        data: updatedArticles,
        timestamp: Date.now()
      };
      
      return updatedArticles;
    });
    
    toast({
      title: "Success",
      description: "Article bookmark status updated",
    });
  }, [featuredArticle, toast]);

  // Optimize search handler with debounce
  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The search query state is already set on input change
    // This just prevents form submission
  }, []);

  // Fetch news data optimized for performance and error handling
  const fetchNewsData = useCallback(async (forceRefresh = false) => {
    // Only show loading indicator if initial load or force refresh
    if (initialLoading || forceRefresh) {
      setLoading(true);
    }
    
    try {
      setError(null);
      
      // Check if we have valid cached data
      const now = Date.now();
      const cache = cacheRef.current;
      
      if (!forceRefresh && 
          cache.articles.data.length > 0 && 
          (now - cache.articles.timestamp) < CACHE_EXPIRATION) {
        // Use cached data
        setArticles(cache.articles.data);
        
        if (cache.featured.data && 
            (now - cache.featured.timestamp) < CACHE_EXPIRATION) {
          setFeaturedArticle(cache.featured.data);
        } else {
          // Find a new featured article if needed
          const newFeatured = cache.articles.data.find(article => article.featured);
          setFeaturedArticle(newFeatured || null);
          
          // Update featured cache
          cacheRef.current.featured = {
            data: newFeatured || null,
            timestamp: now
          };
        }
        
        // Still update in background after using cache
        setTimeout(() => refreshDataInBackground(), 5000);
      } else {
        // In a real app, we would fetch from an API:
        // const { data, error } = await supabase.from('news').select('*')
        
        // For now, simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data
        setArticles(mockNewsData);
        
        // Set featured article
        const featured = mockNewsData.find(article => article.featured);
        setFeaturedArticle(featured || null);
        
        // Update cache
        cacheRef.current = {
          articles: { data: mockNewsData, timestamp: now },
          featured: { data: featured || null, timestamp: now }
        };
      }
    } catch (error) {
      console.error("Error fetching news data:", error);
      setError("Failed to load news articles. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive"
      });
    } finally {
      // Always clear loading states
      setLoading(false);
      setInitialLoading(false);
    }
  }, [toast, initialLoading]);

  // Background refresh function that doesn't trigger loading states
  const refreshDataInBackground = async () => {
    try {
      // In a real app, this would be the same fetch call as above
      // but without setting loading indicators
      
      // For demo, just wait and update timestamp
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update cache timestamp to extend validity
      const now = Date.now();
      cacheRef.current = {
        articles: { 
          data: cacheRef.current.articles.data, 
          timestamp: now 
        },
        featured: { 
          data: cacheRef.current.featured.data, 
          timestamp: now 
        }
      };
    } catch (error) {
      console.error("Error in background refresh:", error);
      // Don't show errors for background refreshes
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchNewsData();
  }, [fetchNewsData]);

  // Reset filters function
  const handleResetFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSources([]);
    setDateRange(undefined);
  }, []);

  // Components and UI rendering

  // Featured article fallback when loading or none available
  const featuredArticleFallback = (
    <Card className="w-full h-[400px] lg:h-[500px] overflow-hidden relative bg-background border-border">
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <NewspaperIcon className="h-16 w-16 mx-auto text-muted-foreground/20" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">No featured articles available</h3>
            <p className="text-sm text-muted-foreground">
              Check back soon for featured golf news
            </p>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container max-w-6xl py-8 space-y-8 bg-background">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Golf News</h1>
        <p className="text-muted-foreground mt-1">
          Stay up-to-date with the latest golf news, trends, and tips
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search golf news..."
                className="pl-8 border-input bg-background text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default" className="bg-muted-green hover:bg-muted-green-dark text-white">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-muted-green text-muted-green hover:bg-muted-green hover:text-white"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {(selectedCategory || selectedSources.length > 0 || dateRange) && (
                <Badge variant="secondary" className="ml-2 px-1 bg-muted-green text-white">
                  <CheckIcon className="h-3 w-3" />
                </Badge>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 bg-background border-border">
          <NewsFilters
            categoryOptions={categoryOptions}
            sourceOptions={sourceOptions}
            selectedCategory={selectedCategory || "all"}
            selectedSources={selectedSources}
            dateRange={dateRange}
            onApplyFilters={(category, sources, dates) => {
              setSelectedCategory(category === "all" ? null : category);
              setSelectedSources(sources);
              setDateRange(dates);
              setShowFilters(false);
            }}
            onReset={handleResetFilters}
          />
        </Card>
      )}

      {/* Content tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "bookmarked")}
        className="bg-background"
      >
        <div className="flex justify-between items-center">
          <TabsList className="bg-muted border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-muted-green data-[state=active]:text-white">All News</TabsTrigger>
            <TabsTrigger value="bookmarked" className="data-[state=active]:bg-muted-green data-[state=active]:text-white">Bookmarked</TabsTrigger>
          </TabsList>
          
          {/* Error display if needed */}
          {error && (
            <div className="flex items-center text-sm text-red-500">
              <AlertCircleIcon className="h-4 w-4 mr-1" />
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchNewsData(true)}
                className="ml-2 h-8 text-muted-green hover:text-muted-green hover:bg-background/80"
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured article section - only show in "All" tab */}
            <div className="lg:col-span-2">
              {initialLoading ? (
                <Card className="w-full h-[400px] overflow-hidden bg-background border-border">
                  <div className="w-full h-64 bg-muted animate-pulse" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 mt-2 bg-muted" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                  </CardContent>
                </Card>
              ) : featuredArticle ? (
                <FeaturedNews
                  article={featuredArticle}
                  onToggleBookmark={handleToggleBookmark}
                />
              ) : (
                featuredArticleFallback
              )}
            </div>

            {/* Latest news grid */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold mb-4 text-foreground">Latest News</h2>
              
              {initialLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="overflow-hidden h-[350px] bg-background border-border">
                        <Skeleton className="h-40 w-full bg-muted" />
                        <CardHeader className="p-4">
                          <Skeleton className="h-5 w-4/5 bg-muted" />
                          <Skeleton className="h-4 w-2/3 mt-2 bg-muted" />
                        </CardHeader>
                        <CardContent className="px-4 pt-0">
                          <Skeleton className="h-4 w-full mb-2 bg-muted" />
                          <Skeleton className="h-4 w-full mb-2 bg-muted" />
                          <Skeleton className="h-4 w-4/5 bg-muted" />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="bg-muted/20 rounded-lg p-8 text-center">
                  <NewspaperIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">No articles found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "bookmarked"
                      ? "You haven't bookmarked any articles yet"
                      : "Try adjusting your filters or search query"}
                  </p>
                  {(selectedCategory || selectedSources.length > 0 || dateRange || searchQuery) && (
                    <Button 
                      onClick={handleResetFilters} 
                      variant="outline"
                      className="border-muted-green text-muted-green hover:bg-muted-green hover:text-white"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    ))}
                  </div>
                  
                  {filteredArticles.length > 0 && !loading && (
                    <div className="flex justify-center mt-8">
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto border-muted-green text-muted-green hover:bg-muted-green hover:text-white"
                      >
                        Load More Articles
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {loading && !initialLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-muted-green" />
                  <span className="text-muted-foreground">Loading more articles...</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest news grid for bookmarked tab */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold mb-4 text-foreground">Bookmarked Articles</h2>
              
              {initialLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="overflow-hidden h-[350px] bg-background border-border">
                        <Skeleton className="h-40 w-full bg-muted" />
                        <CardHeader className="p-4">
                          <Skeleton className="h-5 w-4/5 bg-muted" />
                          <Skeleton className="h-4 w-2/3 mt-2 bg-muted" />
                        </CardHeader>
                        <CardContent className="px-4 pt-0">
                          <Skeleton className="h-4 w-full mb-2 bg-muted" />
                          <Skeleton className="h-4 w-full mb-2 bg-muted" />
                          <Skeleton className="h-4 w-4/5 bg-muted" />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="bg-muted/20 rounded-lg p-8 text-center">
                  <BookmarkIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">No bookmarked articles</h3>
                  <p className="text-muted-foreground mb-4">
                    Save articles to access them quickly here
                  </p>
                  <Button 
                    asChild 
                    variant="outline"
                    className="border-muted-green text-muted-green hover:bg-muted-green hover:text-white"
                  >
                    <Link to="/news?tab=all">Browse All News</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(NewsPage); 