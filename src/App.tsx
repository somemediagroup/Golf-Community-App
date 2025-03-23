import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RouteTransition from "@/components/ui/route-transition";

// Layouts & Components
import MainLayout from "@/layouts/MainLayout";

// Pages
import Index from "@/pages/Index";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import HomePage from "@/pages/HomePage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import DataRemoval from "@/pages/DataRemoval";
import ForgotPassword from "@/pages/ForgotPassword";
import ProfilePage from "@/pages/ProfilePage";
import FriendProfilePage from "@/pages/FriendProfilePage";

// Features
import LoginForm from "@/features/auth/LoginForm";
import RegisterForm from "@/features/auth/RegisterForm";
import Dashboard from "@/features/dashboard/Dashboard";
import CourseExplorer from "@/features/courses/CourseExplorer";
import CourseRating from "@/features/courses/CourseRating";
import CourseCheckIn from "@/features/courses/CourseCheckIn";
import UserProfile from "@/features/profile/UserProfile";
import SocialFeed from "@/features/social/SocialFeed";
import NewsPage from "@/features/news/NewsPage";
import CommunityPage from "@/pages/CommunityPage";
import CoursesPage from "@/pages/CoursesPage";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="golf-app-theme">
            <TooltipProvider>
              <RouteTransition>
                <Routes>
                  {/* Landing page - redirects based on auth status */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Public routes */}
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/data-removal" element={<DataRemoval />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/courses" element={<CourseExplorer />} />
                    <Route path="/courses-list" element={<CoursesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:userId" element={<FriendProfilePage />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/courses/:id" element={<CourseDetailPage />} />
                    <Route path="/courses/:id/ratings" element={<CourseRating />} />
                    <Route path="/courses/:id/check-in" element={<CourseCheckIn />} />
                  </Route>
                  
                  {/* Not found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RouteTransition>
              
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
