import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Trophy, LockKeyhole, Mail, Eye, EyeOff, AlertTriangle, Info } from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [year] = useState(new Date().getFullYear());
  
  // Get stored email from localStorage for "remember me" feature
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('golf_community_remember');
    if (rememberedEmail) {
      form.setValue('email', rememberedEmail);
      setRememberMe(true);
    }
  }, []);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      const result = await signIn(data.email, data.password);
      
      if (result && result.error) {
        throw new Error(
          typeof result.error === 'object' && result.error !== null && 'message' in result.error
            ? String(result.error.message)
            : 'Failed to sign in'
        );
      }
      
      if (result && result.user) {
        // If remember me is checked, store in localStorage
        if (rememberMe) {
          localStorage.setItem('golf_community_remember', data.email);
        } else {
          localStorage.removeItem('golf_community_remember');
        }
        
        navigate("/home");
        return;
      }
      
      throw new Error('Login failed. Please try again.');
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fillTestCredentials = () => {
    form.setValue("email", "john.smith@example.com");
    form.setValue("password", "password123");
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFCFB]">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-[#448460]">
              <Logo variant="greenMono" size="sm" />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-[#448460] hover:text-[#448460]/80 hover:bg-[#448460]/10">
              <Link to="/" className="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>
    
      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 py-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto inline-flex items-center justify-center bg-[#448460] text-white p-3 rounded-full mb-4">
              <Logo variant="golfball" size="sm" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F1E1F] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to Golf Community</p>
          </motion.div>
        
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-[#1F1E1F] text-xl">Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loginError && (
                  <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1F1E1F]">Email</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                className="pl-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20 rounded-md" 
                                {...field} 
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-[#1F1E1F]">Password</FormLabel>
                            <Link to="/forgot-password" className="text-xs font-medium text-[#448460] hover:underline">
                              Forgot password?
                            </Link>
                          </div>
                          <div className="relative">
                            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 pr-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20 rounded-md" 
                                {...field} 
                              />
                            </FormControl>
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-4 w-4 rounded border-gray-300 text-[#448460] focus:ring-[#448460]"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-[#448460] text-white hover:bg-[#448460]/90 focus:ring-[#448460]/20 rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="font-medium text-[#448460] hover:underline">
                    Create an account
                  </Link>
                </div>
                
                <Alert className="bg-[#448460]/10 border-[#448460]/20 text-[#448460]">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">Testing Access</AlertTitle>
                  <AlertDescription className="text-xs">
                    Use our test account for quick access:
                    <Button 
                      variant="outline" 
                      className="h-8 mt-2 w-full border-[#448460]/30 text-[#448460] hover:bg-[#448460]/5 hover:text-[#448460]"
                      onClick={fillTestCredentials}
                    >
                      Fill Test Credentials
                    </Button>
                  </AlertDescription>
                </Alert>
                
                <div className="text-center text-xs text-gray-500">
                  By signing in, you agree to our{" "}
                  <Link to="/terms" className="text-[#448460] hover:underline">Terms</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-[#448460] hover:underline">Privacy Policy</Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 bg-primary-50 border-t border-primary-100 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo variant="greenMono" size="xs" />
            <div className="text-sm text-primary-700">
              &copy; {year} Golf Community. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm mt-2">
              <Link to="/terms" className="text-[#448460] hover:text-[#448460]/80">
                Terms
              </Link>
              <Link to="/privacy" className="text-[#448460] hover:text-[#448460]/80">
                Privacy
              </Link>
              <Link to="/contact" className="text-[#448460] hover:text-[#448460]/80">
                Contact
              </Link>
              <Link to="/data-removal" className="text-[#448460] hover:text-[#448460]/80">
                Data Removal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm; 