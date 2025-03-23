import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  userId: z.string().min(2, { message: "User ID must be at least 2 characters" }),
  reason: z.string().min(10, { message: "Please provide a reason of at least 10 characters" }),
  confirmation: z.boolean().refine(val => val === true, {
    message: "You must confirm this statement"
  }),
});

type DataRemovalFormValues = z.infer<typeof formSchema>;

const DataRemoval = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<DataRemovalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      userId: "",
      reason: "",
      confirmation: false,
    },
  });
  
  const onSubmit = async (data: DataRemovalFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Data removal request submitted:", data);
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center">
            <Trash2 className="h-6 w-6 text-destructive mr-2" />
            <h1 className="text-3xl font-bold">Data Removal Request</h1>
          </div>
        </div>
        
        <Alert className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-medium">Important Information</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            This form is for requesting removal of your data from our systems. This process cannot be undone and will result in your account being permanently deleted.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Request Data Removal</CardTitle>
            <CardDescription>
              Fill out this form to request removal of your personal data from our services. We will process your request within 30 days as required by applicable data protection laws.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-4 text-center"
              >
                <Info className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <h3 className="text-xl font-medium text-green-800 dark:text-green-300">Request Received</h3>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  We've received your data removal request. Our team will review your request and process it within 30 days. You'll receive an email confirmation when completed.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setIsSuccess(false)}
                >
                  Submit Another Request
                </Button>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter the email associated with your account" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID (if known)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your user ID can be found in your profile settings" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Removal (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide the reason for your data removal request" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-muted p-4 rounded-md text-sm">
                    <p className="font-medium mb-2">What happens when your data is removed:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Your account and profile will be permanently deleted</li>
                      <li>Your posts, comments, and all user-generated content will be removed</li>
                      <li>Your personal information will be erased from our active systems</li>
                      <li>Some information may remain in backups for up to 90 days</li>
                      <li>You will not be able to recover your account after this process</li>
                    </ul>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="confirmation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="accent-primary h-4 w-4 mt-1"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that I want to permanently delete my account and all my data
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-4">
                    <Button type="submit" variant="destructive" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Processing...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>For questions about data removal, please see our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> or <Link to="/contact" className="text-primary hover:underline">contact support</Link>.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default DataRemoval; 