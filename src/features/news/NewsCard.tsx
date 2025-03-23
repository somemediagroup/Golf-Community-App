import { useState } from "react";
import { motion } from "framer-motion";
import { CardTitle, Card, CardContent, CardFooter, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookmarkPlus, 
  Share2, 
  Clock, 
  ExternalLink, 
  BookmarkCheck,
  Calendar,
  BookmarkIcon
} from "lucide-react";
import { NewsArticle } from "./NewsPage";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogContentDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface NewsCardProps {
  article: NewsArticle;
  onToggleBookmark: (id: string) => void;
}

const NewsCard = ({ article, onToggleBookmark }: NewsCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return formatDate(dateString);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: article.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(article.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-[350px] flex flex-col bg-background border-border hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          <div className="h-40 overflow-hidden">
            {article.imageUrl && (
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-muted-green text-white">{article.category}</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background ${article.isBookmarked ? 'text-muted-green' : 'text-muted-foreground'}`}
            onClick={() => onToggleBookmark(article.id)}
            aria-label={article.isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <BookmarkIcon className="h-4 w-4" fill={article.isBookmarked ? "#448460" : "none"} />
          </Button>
        </div>
        <CardHeader className="p-4 pb-0 flex-1">
          <Link to={article.url} className="hover:underline">
            <CardTitle className="text-lg line-clamp-2 text-foreground">{article.title}</CardTitle>
          </Link>
          <CardDescription className="mt-1 line-clamp-2 text-muted-foreground">
            {article.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-muted-green" />
                <span>{formatDate(article.publishDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-green" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <div>
              <Link to={article.sourceUrl} className="text-muted-green hover:underline" target="_blank">
                {article.source}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium">{article.source}</span>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onToggleBookmark(article.id)}
                >
                  {article.isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            <DialogTitle className="text-2xl mt-2">{article.title}</DialogTitle>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{article.author.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{article.author}</span>
            </div>
          </DialogHeader>
          
          <div className="my-4">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-auto max-h-80 object-cover rounded-md"
            />
          </div>
          
          <div className="space-y-4 my-4">
            <p className="text-lg font-medium italic">{article.excerpt}</p>
            <p>{article.content}</p>
            <p>{article.content}</p> {/* Doubled for demo purposes to show more content */}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag, i) => (
              <Badge key={i} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          
          <DialogFooter>
            <Button asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Read Full Article
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Helper object to transform category slugs to display names
const categories: Record<string, string> = {
  tournaments: "Tournaments",
  players: "Players",
  equipment: "Equipment",
  courses: "Courses",
  instruction: "Instruction",
  lifestyle: "Lifestyle"
};

export default NewsCard; 