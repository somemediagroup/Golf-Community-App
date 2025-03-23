import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Trophy className="h-12 w-12 text-primary mr-2" />
        <h1 className="text-3xl font-bold">GolfBuddy</h1>
      </div>
      
      <div className="relative mb-8">
        <h2 className="text-9xl font-bold text-muted">404</h2>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4 py-2 rounded-md">
          <span className="text-xl font-medium">Page Not Found</span>
        </div>
      </div>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Oops! It seems you've wandered off the fairway. The page you're looking for doesn't exist or may have been moved.
      </p>
      
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/courses">Explore Courses</Link>
        </Button>
      </div>
      
      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link></p>
      </div>
    </div>
  );
};

export default NotFound;
