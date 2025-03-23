import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { scoresAPI } from "@/services/api";

// Define interface for component props
interface ScoreCardEntryProps {
  userId: string;
  onSuccess?: () => void;
}

// Form validation schema
const scoreCardSchema = z.object({
  courseId: z.string().min(1, { message: "Please select a course" }),
  date: z.date(),
  score: z.coerce
    .number()
    .min(30, { message: "Score must be at least 30" })
    .max(200, { message: "Score must be less than 200" }),
  tees: z.string().min(1, { message: "Please select tee color" }),
  holePlayed: z.enum(["9", "18"]),
  notes: z.string().optional(),
});

type ScoreCardFormValues = z.infer<typeof scoreCardSchema>;

// Mock data for courses
const mockCourses = [
  { id: "1", name: "Pine Valley Golf Club" },
  { id: "2", name: "Augusta National Golf Club" },
  { id: "3", name: "Pebble Beach Golf Links" },
  { id: "4", name: "St Andrews Links (Old Course)" },
  { id: "5", name: "Torrey Pines Golf Course" },
];

// Tee options
const teeOptions = [
  { value: "black", label: "Black (Championship)" },
  { value: "symetra", label: "Symetra" },
  { value: "blue", label: "Blue" },
  { value: "white", label: "White (Men's)" },
  { value: "tournament", label: "Tournament" },
  { value: "gold", label: "Gold (Senior)" },
  { value: "red", label: "Red (Ladies/Forward)" },
];

const ScoreCardEntry: React.FC<ScoreCardEntryProps> = ({ userId, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Could use the userId prop to make API calls or filter data
  // console.log(`Score card entry for user: ${userId}`);

  const form = useForm<ScoreCardFormValues>({
    resolver: zodResolver(scoreCardSchema),
    defaultValues: {
      courseId: "",
      date: new Date(),
      score: undefined,
      tees: "",
      holePlayed: "18",
      notes: "",
    },
  });

  // Select a course from the mock data based on form value
  const selectedCourse = form.watch("courseId") 
    ? mockCourses.find(course => course.id === form.watch("courseId"))
    : null;

  // Selected tee color from form
  const selectedTee = form.watch("tees");
  
  // Number of holes played
  const holesPlayed = form.watch("holePlayed");

  const onSubmit = async (data: ScoreCardFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Format data for API
      const scoreCardData = {
        user_id: userId,
        course_id: data.courseId,
        date_played: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        score: data.score,
        tee_color: data.tees,
        holes_played: data.holePlayed,
        notes: data.notes,
      };
      
      // Submit to API
      const { data: result, error: apiError } = await scoresAPI.submitScoreCard(scoreCardData);
      
      if (apiError) {
        throw new Error(apiError.message || "Failed to submit score card");
      }
      
      setSuccess(true);
      
      // Show success toast
      toast({
        title: "Score card saved",
        description: "Your score card has been successfully saved.",
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
      
      // Reset form after success
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        form.reset();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit score card. Please try again.";
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center bg-[#448460] hover:bg-[#448460]/90 text-white">
          <Plus className="h-4 w-4" />
          Add Score Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Score Card</DialogTitle>
          <DialogDescription>
            Record your round details to track your golf progress.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#448460]/10 text-[#448460] rounded-md mb-4"
          >
            Score card submitted successfully!
          </motion.div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Golf Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Played</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tee Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tee color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Total Score"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holePlayed"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Holes Played</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select holes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="9">9 Holes</SelectItem>
                        <SelectItem value="18">18 Holes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any comments about your round" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Added scorecard-style summary */}
            {selectedCourse && selectedTee && form.watch("score") && (
              <div className="mt-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="px-2 py-2 text-left font-medium border-b border-gray-200 bg-[#00441B] text-white">{selectedCourse.name}</th>
                            <th className="px-2 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Score</th>
                            {holesPlayed === "18" ? (
                              <>
                                <th className="px-2 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Front 9</th>
                                <th className="px-2 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Back 9</th>
                              </>
                            ) : null}
                            <th className="px-2 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Tee color row */}
                          <tr className={cn(
                            "border-b border-gray-200",
                            selectedTee === "black" && "bg-white",
                            selectedTee === "symetra" && "bg-white",
                            selectedTee === "blue" && "bg-white",
                            selectedTee === "white" && "bg-white",
                            selectedTee === "tournament" && "bg-white",
                            selectedTee === "gold" && "bg-white",
                            selectedTee === "red" && "bg-white",
                          )}>
                            <th className="px-2 py-2 text-left font-medium">
                              {teeOptions.find(t => t.value === selectedTee)?.label || selectedTee}
                            </th>
                            <td colSpan={holesPlayed === "18" ? 3 : 1} className="px-2 py-2 text-center">
                              {form.watch("score")}
                            </td>
                            <td className="px-2 py-2 text-center">
                              {form.watch("score")}
                            </td>
                          </tr>
                          <tr>
                            <th className="px-2 py-2 text-left font-medium border-b border-gray-200">Date</th>
                            <td colSpan={holesPlayed === "18" ? 3 : 1} className="px-2 py-2 text-center border-b border-gray-200">
                              {form.watch("date") ? format(form.watch("date"), "MMM d, yyyy") : "-"}
                            </td>
                            <td className="px-2 py-2 text-center border-b border-gray-200">
                              {holesPlayed === "9" ? "9 Holes" : "18 Holes"}
                            </td>
                          </tr>
                          <tr>
                            <th className="px-2 py-2 text-left font-medium border-b border-gray-200 bg-[#3F75B8] text-white">Handicap</th>
                            <td colSpan={holesPlayed === "18" ? 3 : 1} className="px-2 py-2 text-center border-b border-gray-200 bg-[#3F75B8] text-white">
                              -
                            </td>
                            <td className="px-2 py-2 text-center border-b border-gray-200 bg-[#3F75B8] text-white">
                              -
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#448460] hover:bg-[#448460]/90 text-white"
              >
                {isSubmitting ? "Submitting..." : "Save Score Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreCardEntry; 