import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Mail, Calendar, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Types
interface TrendingTopic {
  id: string;
  name: string;
  count: number;
}

interface TopStory {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  type: string;
}

// Mock data
const trendingTopics: TrendingTopic[] = [
  { id: "1", name: "The Masters", count: 153 },
  { id: "2", name: "Rory McIlroy", count: 142 },
  { id: "3", name: "PGA Championship", count: 118 },
  { id: "4", name: "TaylorMade Stealth", count: 97 },
  { id: "5", name: "Tiger Woods", count: 86 },
  { id: "6", name: "Golf Ball Rollback", count: 72 },
  { id: "7", name: "Pebble Beach", count: 65 }
];

const topStories: TopStory[] = [
  {
    id: "1",
    title: "Justin Thomas Makes Equipment Change Ahead of PGA Championship",
    source: "Golf Digest",
    publishedAt: "2025-04-14T12:30:00Z",
    url: "#"
  },
  {
    id: "2",
    title: "USGA and R&A Finalize New Ball Rules for 2026",
    source: "Golf Channel",
    publishedAt: "2025-04-13T09:15:00Z",
    url: "#"
  },
  {
    id: "3",
    title: "Augusta National Announces Course Changes for Next Year's Masters",
    source: "PGA Tour",
    publishedAt: "2025-04-11T14:45:00Z",
    url: "#"
  },
  {
    id: "4",
    title: "Lydia Ko Sets New LPGA Scoring Record",
    source: "LPGA",
    publishedAt: "2025-04-10T18:20:00Z",
    url: "#"
  }
];

const upcomingEvents: UpcomingEvent[] = [
  {
    id: "1",
    name: "PGA Championship",
    date: "May 15-18, 2025",
    venue: "Valhalla Golf Club",
    type: "Major"
  },
  {
    id: "2",
    name: "U.S. Open",
    date: "June 12-15, 2025",
    venue: "Shinnecock Hills",
    type: "Major"
  },
  {
    id: "3",
    name: "The Open Championship",
    date: "July 17-20, 2025",
    venue: "St Andrews",
    type: "Major"
  }
];

const NewsSidebar = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.trim() === "" || !email.includes("@")) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would send this to an API
    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter",
    });
    
    setEmail("");
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            {trendingTopics.map(topic => (
              <div 
                key={topic.id} 
                className="flex items-center justify-between"
              >
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm justify-start"
                  asChild
                >
                  <a href={`#search=${encodeURIComponent(topic.name)}`}>
                    {topic.name}
                  </a>
                </Button>
                <Badge variant="outline">{topic.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full text-primary">
            View All Topics
          </Button>
        </CardFooter>
      </Card>
      
      {/* Top Stories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Stories</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-4">
            {topStories.map(story => (
              <div key={story.id} className="space-y-1">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-base font-medium justify-start"
                  asChild
                >
                  <a href={story.url} className="text-left">
                    {story.title}
                  </a>
                </Button>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{story.source}</span>
                  <span>{formatDate(story.publishedAt)}</span>
                </div>
                {story.id !== topStories[topStories.length - 1].id && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Newsletter */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Golf News Weekly
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm mb-4 text-primary-foreground/80">
            Subscribe to receive the top golf news, updates, and exclusive content delivered directly to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <Input 
              placeholder="Your email address" 
              className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full"
            >
              Subscribe
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.name}</h4>
                  <Badge variant="outline" className="bg-primary/10">
                    {event.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{event.date}</p>
                  <p>{event.venue}</p>
                </div>
                {event.id !== upcomingEvents[upcomingEvents.length - 1].id && (
                  <Separator className="mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="#calendar" className="flex items-center gap-1">
              View Full Calendar
              <ArrowRight className="h-3 w-3" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewsSidebar; 