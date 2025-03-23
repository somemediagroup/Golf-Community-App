import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, MapPin, Calendar, ArrowRight, Clock, Star, ChevronRight, Award, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from '@/components/ui/logo';

const Welcome = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add state for scroll position
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Track scroll position for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show sticky CTA when scrolled past threshold (300px)
  const showStickyCTA = scrollPosition > 300;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFCFB] relative">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-[#448460] to-[#2c5e40] py-20 md:py-28 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('/images/golf-pattern.svg')] opacity-10"></div>
        <div className="absolute -bottom-10 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        
        {/* Floating signup incentive - mobile only */}
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full px-4 py-2 shadow-lg md:hidden flex items-center gap-2"
        >
          <div className="bg-[#448460] p-1 rounded-full">
            <Logo variant="mono" size="xs" />
          </div>
          <span className="text-xs font-medium text-[#1F1E1F]">Sign up today - <span className="text-[#448460] font-bold">ALWAYS Free!</span></span>
          <Link to="/register">
            <ChevronRight className="h-4 w-4 text-[#448460]" />
          </Link>
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex-1 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-center lg:justify-start mb-4"
              >
                <Logo variant="mono" size="lg" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6"
              >
                <span className="text-sm font-medium">Join the Golf Community</span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#FBFCFB] mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Connect with <span className="text-[#FBFCFB] underline decoration-[#FBFCFB]/30 decoration-2 underline-offset-8">Golf Enthusiasts</span> Near You
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-[#FBFCFB]/80 mb-8 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Discover new courses, track your progress, connect with fellow golfers, 
                and improve your game with Golf Community. <span className="font-semibold">By the community, for the community.</span>
              </motion.p>

              <motion.div 
                className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg mb-8 border border-white/20 max-w-full sm:max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <p className="text-[#FBFCFB] font-medium flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FBFCFB] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Access for members is <span className="font-bold">ALWAYS</span> free - No payment needed ever!</span>
                </p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-[#FBFCFB] text-[#448460] hover:bg-[#FBFCFB]/90 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <Link to="/login" className="flex items-center gap-2 px-6">
                    Log In
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="border-[#FBFCFB] text-[#FBFCFB] bg-transparent hover:bg-[#FBFCFB]/10 transition-all duration-300 rounded-full w-full sm:w-auto"
                >
                  <Link to="/register" className="flex items-center gap-2 px-6">
                    Create Account
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              
              {/* Sign up benefits - desktop only */}
              <motion.div 
                className="hidden lg:flex mt-8 space-x-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/80">Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/80">ALWAYS free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/80">Community driven</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1 hidden lg:block relative"
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#448460]/20 to-[#FBFCFB]/20 rounded-2xl blur"></div>
                <img 
                  src="/images/golf-hero.png" 
                  alt="Golf Community App" 
                  className="relative z-10 max-w-full rounded-xl shadow-2xl"
                  width="600"
                  height="450"
                  loading="eager"
                />
                <div className="absolute -bottom-4 -right-4 z-0 w-24 h-24 bg-[#448460]/20 rounded-full blur-xl"></div>
                
                {/* Floating feature highlight */}
                <motion.div 
                  className="absolute -right-6 top-24 bg-white rounded-xl px-4 py-3 shadow-lg z-20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#448460]/10 p-2 rounded-full">
                      <Users className="h-5 w-5 text-[#448460]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F1E1F] text-sm">Connect with golfers</p>
                      <p className="text-xs text-[#1F1E1F]/60">Find partners at your level</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Stats banner */}
          <motion.div 
            className="md:flex justify-between max-w-4xl mx-auto mt-12 md:mt-16 bg-[#448460]/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
              <StatItem icon={<Users className="h-5 w-5" />} value="10,000+" label="Active Golfers" />
              <StatItem icon={<MapPin className="h-5 w-5" />} value="500+" label="Golf Courses" />
              <StatItem icon={<Calendar className="h-5 w-5" />} value="200+" label="Monthly Events" />
            </div>
          </motion.div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#FBFCFB" fillOpacity="1" d="M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,197.3C672,203,768,181,864,186.7C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-[#FBFCFB]">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1E1F] mb-3">
              Everything You Need for Your Golf Journey
            </h2>
            <p className="text-lg text-[#1F1E1F]/70 max-w-3xl mx-auto">
              Our platform brings together everything golfers need to enjoy the game and connect with others.
            </p>
          </motion.div>
          
          <ResponsiveFeatureGrid />
        </div>
      </section>
      
      {/* App Preview Section */}
      <section className="py-20 bg-gradient-to-b from-[#FBFCFB] to-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="bg-[#448460]/10 text-[#448460] p-2 w-fit rounded-full mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F1E1F] mb-6">
                Elevate Your Golf Experience
              </h2>
              <p className="text-lg text-[#1F1E1F]/70 mb-8">
                Our intuitive app puts everything you need at your fingertips. Track scores, find courses, connect with friends, and join events - all in one place.
              </p>
              
              <div className="space-y-4">
                <AppFeatureItem 
                  title="Real-time Score Tracking" 
                  description="Keep track of your game as you play with our easy-to-use score tracking system."
                />
                <AppFeatureItem 
                  title="Course Finder" 
                  description="Discover new courses with detailed information, reviews, and difficulty ratings."
                />
                <AppFeatureItem 
                  title="Social Community" 
                  description="Connect with friends, join groups, and share your golfing journey."
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#448460] to-[#1F1E1F] rounded-3xl blur opacity-30"></div>
                <img 
                  src="/Screenshot 2025-03-23 151625.jpg" 
                  alt="Golf Community App Interface" 
                  className="relative rounded-2xl border border-gray-200 shadow-2xl z-10 w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1E1F] mb-3">
              Why Join Golf Community?
            </h2>
            <p className="text-lg text-[#1F1E1F]/70 max-w-3xl mx-auto">
              Membership is ALWAYS free and comes with advantages that will transform your golfing experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-[#448460]/10 text-[#448460] p-3 rounded-full w-fit mb-4">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1F1E1F] mb-3">Track Your Performance</h3>
              <p className="text-[#1F1E1F]/70 mb-4">Log your scores, analyze your statistics, and see your improvement over time with detailed performance tracking.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Score tracking for all your rounds
                </li>
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Detailed statistics and trends
                </li>
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Handicap calculation and management
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-[#448460]/10 text-[#448460] p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1F1E1F] mb-3">Connect With Golfers</h3>
              <p className="text-[#1F1E1F]/70 mb-4">Build your network of golf partners, join groups based on skill level or location, and never play alone again.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Find players at your skill level
                </li>
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Join local golf communities
                </li>
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Schedule games with other members
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-[#448460]/10 text-[#448460] p-3 rounded-full w-fit mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1F1E1F] mb-3">Exclusive Access</h3>
              <p className="text-[#1F1E1F]/70 mb-4">Get access to member-only events, special rates at partner courses, and early registration for tournaments.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Member-only tournaments
                </li>
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Discounted tee times at partner courses
                </li>
                <li className="flex items-center text-sm text-[#1F1E1F]/70">
                  <div className="h-5 w-5 rounded-full bg-[#448460]/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#448460]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Early access to golf events and clinics
                </li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-[#448460] text-[#FBFCFB] hover:bg-[#448460]/90 transition-all duration-300 rounded-full shadow-md"
            >
              <Link to="/register" className="inline-flex items-center gap-2 px-6">
                Join - ALWAYS Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-4">
              <div className="bg-[#448460]/10 text-[#448460] p-2 rounded-full">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1E1F] mb-3">
              What Our Community Says
            </h2>
            <p className="text-lg text-[#1F1E1F]/70 max-w-3xl mx-auto">
              Join thousands of golfers who are enjoying the Golf Community experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <TestimonialCard 
              quote="This app has transformed how I discover new courses and connect with other golfers in my area."
              name="Michael Johnson"
              role="Handicap 12"
              avatar="/images/testimonials/michael.jpg"
              delay={0.1}
            />
            <TestimonialCard 
              quote="I've improved my game significantly by tracking my stats and getting feedback from the community."
              name="Sarah Thompson"
              role="Handicap 8"
              avatar="/images/testimonials/sarah.jpg"
              delay={0.2}
            />
            <TestimonialCard 
              quote="Finding tournaments and events has never been easier. I've made great connections through this platform."
              name="David Rodriguez"
              role="Handicap 15"
              avatar="/images/testimonials/david.jpg"
              delay={0.3}
            />
          </div>
          
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-sm font-medium text-[#448460] mb-2">Join our community today</span>
            <h3 className="text-xl md:text-2xl font-bold text-[#1F1E1F] mb-4">Start your golf journey with us</h3>
            
            <Button 
              asChild 
              size="lg" 
              className="bg-[#448460] text-white hover:bg-[#448460]/90 rounded-full"
            >
              <Link to="/register" className="px-6 flex items-center gap-2">
                Create ALWAYS Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#448460] text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6 mx-auto">
              <span className="text-sm font-medium">By the community, for the community</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Elevate Your Golf Experience?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Create your account today and start connecting with golfers, discovering new courses, and improving your game. <span className="font-bold">No subscriptions, no payments ever!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-[#FBFCFB] text-[#448460] hover:bg-[#FBFCFB]/90 transition-all duration-300 shadow-lg hover:shadow-xl rounded-full w-full sm:w-auto"
              >
                <Link to="/register" className="inline-flex items-center gap-2 px-6">
                  Create ALWAYS Free Account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <p className="text-sm text-white/80 mt-2 sm:mt-0">
                Already have an account? <Link to="/login" className="text-white underline underline-offset-2">Log In</Link>
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <p className="inline-flex items-center gap-2 text-white/80 text-sm flex-wrap justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Join 10,000+ golfers today - ALWAYS free</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-b from-[#1F1E1F] to-[#223326] text-[#FBFCFB]/70">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Logo and description */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <Logo variant="mono" size="md" />
              </div>
              <p className="text-sm text-[#FBFCFB]/60 max-w-xs mx-auto md:mx-0">
                The ultimate platform for golf enthusiasts to connect, track progress, and discover new courses.
              </p>
            </div>
            
            {/* Navigation links */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-center md:text-left">
              <div>
                <h4 className="text-[#FBFCFB] font-semibold mb-3">Platform</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/about" className="text-sm hover:text-[#FBFCFB] transition-colors">About Us</Link>
                  <Link to="/courses" className="text-sm hover:text-[#FBFCFB] transition-colors">Courses</Link>
                  <Link to="/events" className="text-sm hover:text-[#FBFCFB] transition-colors">Events</Link>
                  <Link to="/community" className="text-sm hover:text-[#FBFCFB] transition-colors">Community</Link>
                </div>
              </div>
              <div>
                <h4 className="text-[#FBFCFB] font-semibold mb-3">Support</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/help" className="text-sm hover:text-[#FBFCFB] transition-colors">Help Center</Link>
                  <Link to="/faq" className="text-sm hover:text-[#FBFCFB] transition-colors">FAQ</Link>
                  <Link to="/contact" className="text-sm hover:text-[#FBFCFB] transition-colors">Contact Us</Link>
                  <Link to="/support" className="text-sm hover:text-[#FBFCFB] transition-colors">Support</Link>
                </div>
              </div>
            </div>
            
            {/* Contact and social */}
            <div className="text-center md:text-right">
              <h4 className="text-[#FBFCFB] font-semibold mb-3">Connect With Us</h4>
              <p className="text-sm text-[#FBFCFB]/60 mb-4">Follow us on social media for updates and tips</p>
              
              <div className="flex gap-4 justify-center md:justify-end">
                <a href="#" className="bg-[#448460] hover:bg-[#448460]/80 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="bg-[#448460] hover:bg-[#448460]/80 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="bg-[#448460] hover:bg-[#448460]/80 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#FBFCFB]/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex gap-6 order-3 md:order-1">
              <Link to="/terms" className="text-xs hover:text-[#FBFCFB] transition-colors">Terms</Link>
              <Link to="/privacy" className="text-xs hover:text-[#FBFCFB] transition-colors">Privacy</Link>
              <Link to="/cookies" className="text-xs hover:text-[#FBFCFB] transition-colors">Cookies</Link>
              <Link to="/contact" className="text-xs hover:text-[#FBFCFB] transition-colors">Contact</Link>
            </div>
            <div className="text-sm mb-4 md:mb-0 order-2">
              &copy; {new Date().getFullYear()} Golf Community. All rights reserved.
            </div>
            <div className="mb-4 md:mb-0 order-1 md:order-3">
              <Logo variant="golfball" size="xs" />
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <motion.div 
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-3 px-4 md:hidden z-50 ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}
        initial={{ y: '100%' }}
        animate={{ y: showStickyCTA ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#1F1E1F]">Ready to join?</p>
            <p className="text-xs text-[#1F1E1F]/70">By the community, for the community</p>
          </div>
          <Button
            asChild
            className="bg-[#448460] text-white hover:bg-[#448460]/90 rounded-full"
          >
            <Link to="/register" className="text-sm px-4 py-2">ALWAYS Free</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const StatItem = ({ icon, value, label }) => (
  <div className="flex items-center gap-3 justify-center sm:justify-start">
    <div className="bg-white/20 p-2 rounded-full">
      {icon}
    </div>
    <div>
      <div className="font-bold text-white text-lg">{value}</div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  </div>
);

const AppFeatureItem = ({ title, description }) => (
  <motion.div 
    className="flex gap-4 items-start"
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-[#448460]/10 text-[#448460] p-1.5 rounded-full mt-1">
      <ChevronRight className="h-4 w-4" />
    </div>
    <div>
      <h3 className="font-semibold text-[#1F1E1F] mb-1">{title}</h3>
      <p className="text-[#1F1E1F]/70 text-sm">{description}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="bg-[#448460]/10 text-[#448460] p-3 rounded-full w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1F1E1F] mb-2">{title}</h3>
      <p className="text-[#1F1E1F]/70">{description}</p>
    </motion.div>
  );
};

const TestimonialCard = ({ quote, name, role, avatar, delay = 0 }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-[#448460]" fill="#448460" />
        <Star className="h-5 w-5 text-[#448460]" fill="#448460" />
        <Star className="h-5 w-5 text-[#448460]" fill="#448460" />
        <Star className="h-5 w-5 text-[#448460]" fill="#448460" />
        <Star className="h-5 w-5 text-[#448460]" fill="#448460" />
      </div>
      <p className="text-[#1F1E1F]/80 mb-6 italic">"{quote}"</p>
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="font-medium text-[#1F1E1F]">{name}</p>
          <p className="text-sm text-[#1F1E1F]/60">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Make features section cards more responsive
const ResponsiveFeatureGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <FeatureCard 
        icon={<MapPin className="h-6 w-6" />}
        title="Discover Courses"
        description="Find and review golf courses in your area with detailed information and player ratings."
        delay={0.1}
      />
      <FeatureCard 
        icon={<Trophy className="h-6 w-6" />}
        title="Track Progress"
        description="Log your rounds, track your scores, and see your improvement over time."
        delay={0.2}
      />
      <FeatureCard 
        icon={<Users className="h-6 w-6" />}
        title="Community"
        description="Connect with other golfers, join groups, and organize games together."
        delay={0.3}
      />
      <FeatureCard 
        icon={<Calendar className="h-6 w-6" />}
        title="Events"
        description="Discover and participate in local tournaments and golfing events."
        delay={0.4}
      />
    </div>
  );
};

export default Welcome; 