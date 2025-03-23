import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Calendar, Clock, ExternalLink } from "lucide-react";
import { NewsArticle } from "./NewsPage";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface FeaturedNewsProps {
  article: NewsArticle;
  onToggleBookmark: (id: string) => void;
}

const FeaturedNews = ({ article, onToggleBookmark }: FeaturedNewsProps) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Card className="overflow-hidden w-full h-full bg-background border-border">
      <div className="relative">
        <div className="h-64 w-full overflow-hidden bg-muted">
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge className="bg-muted-green text-white">
            Featured
          </Badge>
          <Badge className="bg-muted-green text-white">
            {article.category}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-4 right-4 h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background ${article.isBookmarked ? 'text-muted-green' : 'text-muted-foreground'}`}
          onClick={() => onToggleBookmark(article.id)}
          aria-label={article.isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <BookmarkIcon className="h-5 w-5" fill={article.isBookmarked ? "#448460" : "none"} />
        </Button>
        
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Link to={article.url} className="hover:underline">
            <h2 className="text-2xl font-bold text-white mb-2">{article.title}</h2>
          </Link>
          <p className="text-white/80 mb-3 line-clamp-2">{article.excerpt}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-green" />
                <span>{formatDate(article.publishDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-green" />
                <span>{article.readTime}</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to={article.url}>
                Read Full Story
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-5 pt-4">
        <div className="flex items-center gap-3">
          {article.authorAvatar ? (
            <img 
              src={article.authorAvatar} 
              alt={article.author}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted-green/10 flex items-center justify-center text-muted-green font-medium">
              {article.author.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{article.author}</p>
            {article.authorTitle && (
              <p className="text-xs text-muted-foreground">{article.authorTitle}</p>
            )}
          </div>
          
          <div className="ml-auto text-sm">
            <Link to={article.sourceUrl} className="flex items-center text-muted-green hover:underline" target="_blank">
              {article.source}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedNews; 