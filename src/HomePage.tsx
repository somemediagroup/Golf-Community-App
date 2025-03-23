import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, MapPin, Star, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50">
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-800 leading-tight">
                Connect with the <span className="text-primary-600">Golf Community</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700">
                Discover courses, track your performance, and connect with fellow golf enthusiasts in one comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">Join Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-none shadow-lg">
                <CardContent className="p-0">
                  <img 
                    src="/images/golf-hero.png" 
                    alt="Golf course with players" 
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
              Elevate Your Golf Experience
            </motion.h2>
            <motion.p variants={item} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides everything you need to enhance your golfing journey.
            </motion.p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={item}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <CardTitle>Course Explorer</CardTitle>
                  <CardDescription>Discover new courses and read reviews from fellow golfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Browse comprehensive course listings with detailed information, photos, and user ratings to find your next favorite spot.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-primary-600 p-0 hover:text-primary-800" asChild>
                    <Link to="/courses" className="flex items-center">
                      <span>Browse Courses</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div variants={item}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-primary-600" />
                  </div>
                  <CardTitle>Performance Tracking</CardTitle>
                  <CardDescription>Monitor your progress and analyze your game</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Log your scores, track your handicap, and visualize your performance trends to identify areas for improvement.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-primary-600 p-0 hover:text-primary-800" asChild>
                    <Link to="/profile" className="flex items-center">
                      <span>View Stats</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div variants={item}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <CardTitle>Golf Community</CardTitle>
                  <CardDescription>Connect with other golfers in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Find playing partners, join local events, and share your experiences with a community of passionate golfers.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-primary-600 p-0 hover:text-primary-800" asChild>
                    <Link to="/community" className="flex items-center">
                      <span>Join Community</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Golf Experience?</h2>
            <p className="text-xl mb-8 text-white/80">
              Join thousands of golfers who are already taking advantage of our platform to improve their game and connect with others.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials or Golf Tips */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
              Golf Tips & Insights
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Improve your game with tips from experienced golfers in our community.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Mastering Your Short Game</CardTitle>
                <CardDescription>By Coach Mike Johnson</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The short game is where strokes are saved. Focus on consistent contact, visualizing the landing spot, and practicing different lies to improve quickly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Mental Approach to Golf</CardTitle>
                <CardDescription>By Dr. Sarah Williams</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Develop a pre-shot routine, focus on the process rather than the outcome, and practice mindfulness to maintain composure during challenging rounds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer Banner */}
      <section className="py-8 bg-primary-50 border-t border-primary-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-700">
            Golf Community App — Connect, Play, Improve
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 