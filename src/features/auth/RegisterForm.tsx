import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { User, ArrowLeft, Mail, LockKeyhole, UserCircle, AtSign, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Form validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
    .regex(/.*[A-Z].*/, { message: "Password must contain at least one uppercase letter" })
    .regex(/.*[a-z].*/, { message: "Password must contain at least one lowercase letter" })
    .regex(/.*\d.*/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { signUp, error } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });
      
      if (error) {
        setRegisterError(error.message || 'Registration failed');
      } else {
        navigate("/"); // Redirect to dashboard on successful registration
      }
    } catch (err) {
      setRegisterError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFCFB] to-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-[#448460] hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="inline-flex items-center justify-center bg-[#448460] text-white p-3 rounded-full mb-4">
            <Logo variant="mono" size="xs" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F1E1F] mb-2">Join the Community</h1>
          <p className="text-gray-600">Create your Golf Community account</p>
        </motion.div>
      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-[#1F1E1F] text-xl">Create Account</CardTitle>
              <CardDescription>
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(error || registerError) && (
                <Alert className="mb-6 border-amber-600/50 bg-amber-50 text-amber-800">
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>
                    {registerError || (error instanceof Error ? error.message : String(error))}
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1F1E1F]">First Name</FormLabel>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                className="pl-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20" 
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
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1F1E1F]">Last Name</FormLabel>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                className="pl-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20" 
                                {...field} 
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1F1E1F]">Username</FormLabel>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <FormControl>
                            <Input 
                              placeholder="johndoe" 
                              className="pl-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20" 
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1F1E1F]">Email</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <FormControl>
                            <Input 
                              placeholder="you@example.com" 
                              type="email" 
                              className="pl-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20" 
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
                        <FormLabel className="text-[#1F1E1F]">Password</FormLabel>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-10 pr-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20" 
                              {...field} 
                            />
                          </FormControl>
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage className="text-red-500" />
                        <div className="text-xs text-gray-500 mt-1">
                          Password must be at least 8 characters with uppercase, lowercase, and numbers
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1F1E1F]">Confirm Password</FormLabel>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <FormControl>
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-10 pr-10 border-gray-200 focus:border-[#448460] focus:ring-[#448460]/20" 
                              {...field} 
                            />
                          </FormControl>
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-[#448460] text-white hover:bg-[#448460]/90 focus:ring-[#448460]/20"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      By creating an account, you agree to our{" "}
                      <Link to="/terms" className="text-[#448460] hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-[#448460] hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-[#448460] hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm; 