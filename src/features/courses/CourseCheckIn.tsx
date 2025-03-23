import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Camera, Users, MapPin, Calendar, Clock, Send, X, Image, Smile, User as UserIcon } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Types
import type { User } from '@/types/user';

// Validation schema
const checkInSchema = z.object({
  message: z.string().min(3, 'Message must be at least 3 characters').max(500, 'Message must be less than 500 characters'),
  taggedFriends: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  photos: z.array(z.string()).optional(),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

// Mock friends data
const mockFriends: User[] = [
  { 
    id: '1', 
    firstName: 'Jane', 
    lastName: 'Doe', 
    email: 'jane.doe@example.com', 
    username: 'janedoe',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
  },
  { 
    id: '2', 
    firstName: 'John', 
    lastName: 'Smith', 
    email: 'john.smith@example.com', 
    username: 'johnsmith',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  { 
    id: '3', 
    firstName: 'Alice', 
    lastName: 'Johnson', 
    email: 'alice.johnson@example.com', 
    username: 'alicej',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
];

interface CourseInfo {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
}

const CourseCheckIn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showFriendsDialog, setShowFriendsDialog] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      message: '',
      taggedFriends: [],
      isPublic: true,
      photos: [],
    },
  });

  // Fetch course data
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      // Mock data
      const mockCourse: CourseInfo = {
        id: id || '1',
        name: 'Pine Valley Golf Club',
        location: 'Pine Valley, NJ',
        imageUrl: 'https://source.unsplash.com/random/800x600/?golf,course',
      };
      
      setCourse(mockCourse);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleTagFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setPhotos([...photos, photoUrl]);
        form.setValue('photos', [...photos, photoUrl]);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
    form.setValue('photos', updatedPhotos);
  };

  const onSubmit = async (data: CheckInFormValues) => {
    setIsSubmitting(true);
    
    // Include tagged friends and photos in submission
    const checkInData = {
      ...data,
      taggedFriends: selectedFriends,
      courseId: id,
      timestamp: new Date().toISOString(),
    };
    
    // Simulate API call
    try {
      console.log('Submitting check-in:', checkInData);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to course detail page after successful check-in
      navigate(`/courses/${id}`);
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading course information...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>
              We couldn't find the course you're looking for.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/courses')}>
              Back to Course Explorer
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6 max-w-3xl"
    >
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Check In</CardTitle>
              <CardDescription className="text-lg">
                {course.name}
              </CardDescription>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarImage src={course.imageUrl} alt={course.name} />
              <AvatarFallback>{course.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{course.location}</span>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(), 'MMMM d, yyyy')}</span>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(new Date(), 'h:mm a')}</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share your experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How was your round today?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Uploaded ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md cursor-pointer"
                      onClick={() => setPhotoPreview(photo)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 absolute -top-2 -right-2 rounded-full"
                      onClick={() => removePhoto(index)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {selectedFriends.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 mb-2 w-full">
                    <span className="text-sm text-muted-foreground">Tagged:</span>
                    {selectedFriends.map(friendId => {
                      const friend = mockFriends.find(f => f.id === friendId);
                      return (
                        <Badge key={friendId} variant="secondary" className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {friend ? `${friend.firstName} ${friend.lastName}` : 'Unknown'}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => handleTagFriend(friendId)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 w-full">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Make this check-in public
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between w-full pt-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo-upload"
                      onChange={handlePhotoUpload}
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        asChild
                      >
                        <div>
                          <Image className="h-4 w-4 mr-2" />
                          Add Photo
                        </div>
                      </Button>
                    </label>

                    <Dialog open={showFriendsDialog} onOpenChange={setShowFriendsDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Tag Friends
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tag Friends</DialogTitle>
                          <DialogDescription>
                            Select friends to tag in your check-in.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 max-h-[300px] overflow-y-auto">
                          {mockFriends.map(friend => (
                            <div 
                              key={friend.id} 
                              className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                              onClick={() => handleTagFriend(friend.id)}
                            >
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarImage src={friend.avatar_url} alt={friend.username} />
                                  <AvatarFallback>{friend.firstName.charAt(0)}{friend.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{friend.firstName} {friend.lastName}</p>
                                  <p className="text-sm text-muted-foreground">@{friend.username}</p>
                                </div>
                              </div>
                              <Checkbox checked={selectedFriends.includes(friend.id)} />
                            </div>
                          ))}
                        </div>
                        <Button onClick={() => setShowFriendsDialog(false)}>Done</Button>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking In...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Photo preview dialog */}
      {photoPreview && (
        <Dialog open={!!photoPreview} onOpenChange={() => setPhotoPreview(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Photo Preview</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-6">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="max-h-[500px] max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default CourseCheckIn; 