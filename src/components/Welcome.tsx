import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, MapPin } from "lucide-react";

const Welcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-10 max-w-4xl"
      >
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">GolfBuddy</h1>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Ultimate Golf Community App
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow golfers, discover courses, track your scores, and improve your game.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Discover Courses</h3>
            <p className="text-muted-foreground">
              Find and review top golf courses near you with detailed information.
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Log your scores, analyze statistics, and improve your handicap.
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Connect</h3>
            <p className="text-muted-foreground">
              Join the community, find playing partners, and share your experiences.
            </p>
          </div>
        </motion.div>
        
        <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link to="/register">
              Create Account
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
            <Link to="/login">
              Sign In
            </Link>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground pt-8">
          <p>
            Already using GolfBuddy on your phone?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Get support
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;