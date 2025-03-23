import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Image, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { profile as profileService } from "@/services/api";

// Define validation schema for the form
const formSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  bio: z.string().max(200, { message: "Bio cannot exceed 200 characters" }).optional(),
  location: z.string().max(100, { message: "Location cannot exceed 100 characters" }).optional(),
  favorite_course: z.string().max(100, { message: "Favorite course cannot exceed 100 characters" }).optional(),
  handicap: z.string().optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 54),
      { message: "Handicap must be a number between 0 and 54" }
    ),
  avatar_url: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

// Create a separate interface for the form's initial data that allows handicap to be number or undefined
interface ProfileFormInitialData {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  location?: string;
  favorite_course?: string;
  handicap?: number;
  avatar_url?: string;
}

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormValues) => Promise<void>;
  initialData: ProfileFormInitialData;
  userId: string;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  userId
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [usernameExists, setUsernameExists] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      username: initialData.username || "",
      bio: initialData.bio || "",
      location: initialData.location || "",
      favorite_course: initialData.favorite_course || "",
      handicap: initialData.handicap !== undefined 
        ? initialData.handicap.toString() 
        : "",
      avatar_url: initialData.avatar_url || "",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        username: initialData.username || "",
        bio: initialData.bio || "",
        location: initialData.location || "",
        favorite_course: initialData.favorite_course || "",
        handicap: initialData.handicap !== undefined 
          ? initialData.handicap.toString() 
          : "",
        avatar_url: initialData.avatar_url || "",
      });
      setAvatarPreview(initialData.avatar_url || null);
      setAvatarFile(null); // Reset the avatar file when initialData changes
    }
  }, [initialData, form]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (2MB max)
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: "Image size should not exceed 2MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      // Create a preview URL for the UI
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      // Update the avatar_url property with the current value
      data.avatar_url = initialData.avatar_url;
      
      // Upload avatar if a file was selected
      if (avatarFile) {
        const uploadResult = await profileService.uploadAvatar(userId, avatarFile);
        
        if (uploadResult.success && uploadResult.url) {
          data.avatar_url = uploadResult.url;
        } else {
          // If upload failed but we can continue with profile update
          toast({
            title: "Avatar upload failed",
            description: uploadResult.error || "Could not upload avatar image",
            variant: "destructive",
          });
          // Keep the existing avatar
        }
      }
      
      // Update the user profile
      await onSave(data);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Update your profile information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || ""} alt="Profile" />
                <AvatarFallback className="text-3xl">
                  {initialData.first_name?.[0] || ""}{initialData.last_name?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-sm">
                    <Image className="h-4 w-4" />
                    <span>Change Avatar</span>
                  </div>
                  <Input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleAvatarChange} 
                  />
                </Label>
              </div>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="username" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setUsernameExists(false); // Reset the username check on change
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  {usernameExists && (
                    <p className="text-sm font-medium text-destructive">
                      This username is already taken
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    <span className={`text-xs ${
                      field.value.length > 200 ? "text-red-500" : "text-gray-500"
                    }`}>
                      {field.value.length}/200 characters
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="favorite_course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Course</FormLabel>
                  <FormControl>
                    <Input placeholder="Your favorite golf course" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="handicap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handicap</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="54" 
                      placeholder="Your handicap" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your current golf handicap (0-54).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-3">
              <SheetClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditProfileForm; 