import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { scoresAPI } from "@/services/api";

// Interface for course data
interface CourseInfo {
  id: string;
  name: string;
  holes: HoleInfo[];
}

// Interface for hole data
interface HoleInfo {
  number: number;
  par: number;
  handicap: number;
  yardage: {
    black: number;
    symetra: number;
    blue: number;
    white: number;
    tournament: number;
    gold: number;
    red: number;
  };
}

// Interface for score data
interface HoleScore {
  number: number;
  score: number;
  putts: number;
  fairwayHit: boolean | null; // null for par 3s
  greenInRegulation: boolean;
  penaltyStrokes: number;
}

// Form validation schema for the hole-by-hole entry
const holeScoreSchema = z.object({
  courseId: z.string().min(1, { message: "Please select a course" }),
  tees: z.string().min(1, { message: "Please select tee color" }),
  date: z.date(),
  holePlayed: z.enum(["9", "18"]),
  scores: z.array(
    z.object({
      score: z.coerce
        .number()
        .min(1, { message: "Score required" })
        .max(15, { message: "Score too high" }),
      putts: z.coerce
        .number()
        .min(0, { message: "Invalid putts" })
        .max(6, { message: "Putts too high" }),
      fairwayHit: z.boolean().nullable(),
      greenInRegulation: z.boolean(),
      penaltyStrokes: z.coerce
        .number()
        .min(0, { message: "Cannot be negative" })
        .max(5, { message: "Too many penalties" }),
    })
  ),
  notes: z.string().optional(),
});

type HoleByHoleScoreFormValues = z.infer<typeof holeScoreSchema>;

// Update tee options to include Symetra and Tournament
const teeOptions = [
  { value: "black", label: "Black (Championship)" },
  { value: "symetra", label: "Symetra" },
  { value: "blue", label: "Blue" },
  { value: "white", label: "White (Men's)" },
  { value: "tournament", label: "Tournament" },
  { value: "gold", label: "Gold (Senior)" },
  { value: "red", label: "Red (Ladies/Forward)" },
];

// Update mockCourses to include additional tee colors in the yardage data
const mockCourses: CourseInfo[] = [
  {
    id: "1",
    name: "Pine Valley Golf Club",
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 5,
      handicap: [16, 18, 14, 10, 2, 6, 8, 4, 12, 11, 1, 15, 5, 3, 13, 7, 17, 9][i],
      yardage: {
        black: [317, 128, 523, 177, 436, 352, 409, 400, 331, 387, 176, 520, 392, 363, 145, 442, 221, 460][i],
        symetra: [324, 133, 512, 186, 420, 356, 411, 375, 331, 367, 157, 502, 381, 345, 151, 430, 209, 447][i],
        blue: [238, 97, 439, 120, 361, 289, 317, 325, 285, 352, 114, 465, 320, 291, 123, 397, 187, 405][i],
        white: [227, 92, 422, 115, 346, 278, 303, 312, 273, 335, 108, 449, 305, 279, 120, 382, 183, 387][i],
        tournament: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][i],
        gold: [202, 82, 375, 102, 307, 247, 269, 277, 242, 298, 96, 399, 271, 248, 107, 339, 162, 344][i],
        red: [186, 75, 345, 94, 282, 227, 247, 255, 222, 274, 88, 367, 249, 229, 98, 312, 149, 316][i],
      },
    })),
  },
  {
    id: "2",
    name: "Augusta National Golf Club",
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 5 === 0 ? 5 : i % 3 === 0 ? 3 : 4,
      handicap: (i + 1) % 18 + 1,
      yardage: {
        black: 310 + (i * 15),
        symetra: 300 + (i * 15),
        blue: 290 + (i * 15),
        white: 270 + (i * 15),
        tournament: 280 + (i * 15),
        gold: 250 + (i * 15),
        red: 230 + (i * 15),
      },
    })),
  },
];

interface HoleByHoleScoreCardProps {
  userId: string;
  onScoreSubmit?: (data: any) => void;
}

const HoleByHoleScoreCard: React.FC<HoleByHoleScoreCardProps> = ({ userId, onScoreSubmit }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [selectedTee, setSelectedTee] = useState<string>("");
  const [activeTab, setActiveTab] = useState("front9");
  const [holeCount, setHoleCount] = useState<"9" | "18">("18");
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<HoleByHoleScoreFormValues>({
    resolver: zodResolver(holeScoreSchema),
    defaultValues: {
      courseId: "",
      tees: "",
      date: new Date(),
      holePlayed: "18",
      scores: Array.from({ length: 18 }, () => ({
        score: 0,
        putts: 0,
        fairwayHit: null,
        greenInRegulation: false,
        penaltyStrokes: 0,
      })),
      notes: "",
    },
  });

  // Watch for course and tee selection changes
  const watchCourseId = form.watch("courseId");
  const watchTees = form.watch("tees");
  const watchHolePlayed = form.watch("holePlayed");

  // Update selected course when courseId changes
  useEffect(() => {
    if (watchCourseId) {
      const course = mockCourses.find((c) => c.id === watchCourseId);
      setSelectedCourse(course || null);
    } else {
      setSelectedCourse(null);
    }
  }, [watchCourseId]);

  // Update selected tee when tees selection changes
  useEffect(() => {
    setSelectedTee(watchTees);
  }, [watchTees]);

  // Update hole count when holePlayed changes
  useEffect(() => {
    setHoleCount(watchHolePlayed as "9" | "18");
    // Adjust active tab if needed
    if (watchHolePlayed === "9" && activeTab === "back9") {
      setActiveTab("front9");
    }
  }, [watchHolePlayed, activeTab]);

  // Get yardage for the selected tee
  const getYardage = (hole: HoleInfo): number => {
    if (!selectedTee || !hole.yardage[selectedTee as keyof typeof hole.yardage]) {
      return 0;
    }
    return hole.yardage[selectedTee as keyof typeof hole.yardage];
  };

  // Calculate totals
  const calculateTotals = (start: number, end: number) => {
    if (!selectedCourse) return { par: 0, yardage: 0 };

    let totalPar = 0;
    let totalYardage = 0;

    for (let i = start; i <= end; i++) {
      const hole = selectedCourse.holes[i];
      if (hole) {
        totalPar += hole.par;
        totalYardage += getYardage(hole);
      }
    }

    return { par: totalPar, yardage: totalYardage };
  };

  const front9Totals = calculateTotals(0, 8);
  const back9Totals = calculateTotals(9, 17);
  const totalTotals = { 
    par: front9Totals.par + (holeCount === "18" ? back9Totals.par : 0), 
    yardage: front9Totals.yardage + (holeCount === "18" ? back9Totals.yardage : 0) 
  };

  // Handle score submission
  const onSubmit = async (data: HoleByHoleScoreFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Process form data
      const scores = data.scores.slice(0, data.holePlayed === "9" ? 9 : 18);
      const totalScore = scores.reduce((sum, hole) => sum + hole.score, 0);
      const totalPutts = scores.reduce((sum, hole) => sum + hole.putts, 0);
      const fairwaysHit = scores.filter(hole => hole.fairwayHit === true).length;
      const fairwaysTotal = scores.filter(hole => hole.fairwayHit !== null).length;
      const greensInRegulation = scores.filter(hole => hole.greenInRegulation).length;
      const penalties = scores.reduce((sum, hole) => sum + hole.penaltyStrokes, 0);
      
      // Calculate score vs par
      const coursePar = selectedCourse?.holes
        .slice(0, data.holePlayed === "9" ? 9 : 18)
        .reduce((sum, hole) => sum + hole.par, 0) || 0;
      
      const scoreVsPar = totalScore - coursePar;
      const scoreVsParDisplay = scoreVsPar > 0 
        ? `+${scoreVsPar}` 
        : scoreVsPar === 0 ? "E" : scoreVsPar.toString();
      
      // Create stats object
      const stats = {
        totalScore,
        scoreVsPar: scoreVsParDisplay,
        totalPutts,
        fairwaysHit: `${fairwaysHit}/${fairwaysTotal}`,
        fairwayPercentage: fairwaysTotal > 0 ? Math.round((fairwaysHit / fairwaysTotal) * 100) : 0,
        greensInRegulation,
        girPercentage: Math.round((greensInRegulation / scores.length) * 100),
        penalties,
        puttsPerHole: (totalPutts / scores.length).toFixed(1)
      };
      
      // Format data for API submission
      const formattedData = {
        user_id: userId,
        course_id: data.courseId,
        date_played: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        score: totalScore, 
        tee_color: data.tees,
        holes_played: data.holePlayed,
        notes: data.notes,
        hole_scores: scores.map((hole, index) => ({
          hole_number: index + 1,
          score: hole.score,
          putts: hole.putts,
          fairway_hit: hole.fairwayHit,
          green_in_regulation: hole.greenInRegulation,
          penalty_strokes: hole.penaltyStrokes
        }))
      };
      
      // Submit to API
      const { data: result, error: apiError } = await scoresAPI.submitDetailedScoreCard(formattedData, stats);
      
      if (apiError) {
        throw new Error(apiError.message || "Failed to submit detailed score card");
      }
      
      setSuccess(true);
      toast({
        title: "Score card saved",
        description: "Your detailed score card has been successfully saved.",
      });
      
      // Call the onScoreSubmit callback if provided
      if (onScoreSubmit) {
        onScoreSubmit(result);
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
          Add Detailed Score Card
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hole-by-Hole Score Entry</DialogTitle>
          <DialogDescription>
            Track detailed statistics for each hole to analyze your game in depth.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Selection */}
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Golf Course</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
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

              {/* Tee Selection */}
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

              {/* Date Played */}
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

              {/* Holes Played */}
              <FormField
                control={form.control}
                name="holePlayed"
                render={({ field }) => (
                  <FormItem>
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

            {/* Score Card Entry Grid */}
            {selectedCourse && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle>Score Entry</CardTitle>
                  <CardDescription>
                    Enter your scores and statistics for each hole
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="front9">Front 9</TabsTrigger>
                      <TabsTrigger value="back9" disabled={holeCount === "9"}>
                        Back 9
                      </TabsTrigger>
                    </TabsList>

                    {/* Front 9 */}
                    <TabsContent value="front9">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr>
                              <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-[#00441B] text-white">Hole:</th>
                              {selectedCourse.holes.slice(0, 9).map(hole => (
                                <th key={hole.number} className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">
                                  {hole.number}
                                </th>
                              ))}
                              <th className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Out</th>
                            </tr>
                            <tr>
                              <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-[#CDD0CB]">Par:</th>
                              {selectedCourse.holes.slice(0, 9).map(hole => (
                                <th key={hole.number} className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#CDD0CB]">
                                  {hole.par}
                                </th>
                              ))}
                              <th className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#CDD0CB]">
                                {front9Totals.par}
                              </th>
                            </tr>
                            {selectedTee === "black" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Black:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.black}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "symetra" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Symetra:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.symetra}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "blue" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Blue:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.blue}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "tournament" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Tournament:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.tournament}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "white" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">White:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.white}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "gold" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Gold:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.gold}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "red" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Red:</th>
                                {selectedCourse.holes.slice(0, 9).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.red}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(0, 8).yardage}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <th className="px-1 py-2 text-left font-medium border-b border-gray-200">Handicap:</th>
                              {selectedCourse.holes.slice(0, 9).map(hole => (
                                <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200">
                                  {hole.handicap}
                                </td>
                              ))}
                              <td className="px-1 py-2 border-b border-gray-200"></td>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Score entry row */}
                            <tr>
                              <th className="px-1 py-2 text-left font-medium">Score:</th>
                              {selectedCourse.holes.slice(0, 9).map((hole, index) => (
                                <td key={hole.number} className="px-1 py-2 text-center">
                                  <FormField
                                    control={form.control}
                                    name={`scores.${index}.score`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            {...field}
                                            min={1}
                                            max={15}
                                            className="h-8 w-12 text-center mx-auto"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                              ))}
                              <td className="px-1 py-2 text-center font-semibold">
                                {form.watch('scores').slice(0, 9).reduce((sum, hole) => sum + (hole.score || 0), 0) || "-"}
                              </td>
                            </tr>
                            
                            {/* Putts entry row */}
                            <tr>
                              <th className="px-1 py-2 text-left font-medium">Putts:</th>
                              {selectedCourse.holes.slice(0, 9).map((hole, index) => (
                                <td key={hole.number} className="px-1 py-2 text-center">
                                  <FormField
                                    control={form.control}
                                    name={`scores.${index}.putts`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            {...field}
                                            min={0}
                                            max={6}
                                            className="h-8 w-12 text-center mx-auto"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                              ))}
                              <td className="px-1 py-2 text-center font-semibold">
                                {form.watch('scores').slice(0, 9).reduce((sum, hole) => sum + (hole.putts || 0), 0) || "-"}
                              </td>
                            </tr>
                            
                            {/* Additional statistics in a separate section below */}
                            <tr>
                              <td colSpan={11} className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {selectedCourse.holes.slice(0, 9).map((hole, index) => (
                                    <div key={hole.number} className="bg-gray-50 p-3 rounded-md">
                                      <h4 className="font-semibold mb-2">Hole {hole.number} - Par {hole.par}</h4>
                                      <div className="space-y-2">
                                        {/* FIR - Fairway in Regulation */}
                                        {hole.par !== 3 ? (
                                          <div className="flex items-center justify-between">
                                            <label htmlFor={`fir-${hole.number}`} className="text-sm">Fairway Hit:</label>
                                            <FormField
                                              control={form.control}
                                              name={`scores.${index}.fairwayHit`}
                                              render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                  <FormControl>
                                                    <Select
                                                      onValueChange={(value) => field.onChange(value === "true")}
                                                      value={field.value === null ? "" : field.value.toString()}
                                                    >
                                                      <SelectTrigger id={`fir-${hole.number}`} className="h-8 w-16">
                                                        <SelectValue placeholder="-" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem value="true">✓</SelectItem>
                                                        <SelectItem value="false">✗</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </FormControl>
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Fairway Hit:</span>
                                            <span className="text-sm text-gray-400">N/A</span>
                                          </div>
                                        )}

                                        {/* GIR - Green in Regulation */}
                                        <div className="flex items-center justify-between">
                                          <label htmlFor={`gir-${hole.number}`} className="text-sm">Green in Regulation:</label>
                                          <FormField
                                            control={form.control}
                                            name={`scores.${index}.greenInRegulation`}
                                            render={({ field }) => (
                                              <FormItem className="space-y-0">
                                                <FormControl>
                                                  <Select
                                                    onValueChange={(value) => field.onChange(value === "true")}
                                                    value={field.value.toString()}
                                                  >
                                                    <SelectTrigger id={`gir-${hole.number}`} className="h-8 w-16">
                                                      <SelectValue placeholder="-" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="true">✓</SelectItem>
                                                      <SelectItem value="false">✗</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        </div>

                                        {/* Penalty strokes */}
                                        <div className="flex items-center justify-between">
                                          <label htmlFor={`penalty-${hole.number}`} className="text-sm">Penalty Strokes:</label>
                                          <FormField
                                            control={form.control}
                                            name={`scores.${index}.penaltyStrokes`}
                                            render={({ field }) => (
                                              <FormItem className="space-y-0">
                                                <FormControl>
                                                  <Input
                                                    id={`penalty-${hole.number}`}
                                                    type="number"
                                                    {...field}
                                                    min={0}
                                                    max={5}
                                                    className="h-8 w-16 text-center"
                                                  />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    {/* Back 9 - Similar structure to front 9 but with different hole numbers */}
                    <TabsContent value="back9">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr>
                              <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-[#00441B] text-white">Hole:</th>
                              {selectedCourse.holes.slice(9, 18).map(hole => (
                                <th key={hole.number} className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">
                                  {hole.number}
                                </th>
                              ))}
                              <th className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">In</th>
                            </tr>
                            <tr>
                              <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-[#CDD0CB]">Par:</th>
                              {selectedCourse.holes.slice(9, 18).map(hole => (
                                <th key={hole.number} className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#CDD0CB]">
                                  {hole.par}
                                </th>
                              ))}
                              <th className="px-1 py-2 text-center font-medium border-b border-gray-200 bg-[#CDD0CB]">
                                {back9Totals.par}
                              </th>
                            </tr>
                            {selectedTee === "black" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Black:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.black}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "symetra" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Symetra:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.symetra}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "blue" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Blue:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.blue}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "tournament" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Tournament:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.tournament}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "white" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">White:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.white}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "gold" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Gold:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.gold}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            {selectedTee === "red" && (
                              <tr>
                                <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-white">Red:</th>
                                {selectedCourse.holes.slice(9, 18).map(hole => (
                                  <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-white">
                                    {hole.yardage.red}
                                  </td>
                                ))}
                                <td className="px-1 py-2 text-center border-b border-gray-200 bg-white font-medium">
                                  {calculateTotals(9, 17).yardage}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <th className="px-1 py-2 text-left font-medium border-b border-gray-200 bg-[#3F75B8] text-white">Handicap:</th>
                              {selectedCourse.holes.slice(9, 18).map(hole => (
                                <td key={hole.number} className="px-1 py-2 text-center border-b border-gray-200 bg-[#3F75B8] text-white">
                                  {hole.handicap}
                                </td>
                              ))}
                              <td className="px-1 py-2 border-b border-gray-200 bg-[#3F75B8]"></td>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Score entry row */}
                            <tr>
                              <th className="px-1 py-2 text-left font-medium">Score:</th>
                              {selectedCourse.holes.slice(9, 18).map((hole, index) => (
                                <td key={hole.number} className="px-1 py-2 text-center">
                                  <FormField
                                    control={form.control}
                                    name={`scores.${index + 9}.score`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            {...field}
                                            min={1}
                                            max={15}
                                            className="h-8 w-12 text-center mx-auto"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                              ))}
                              <td className="px-1 py-2 text-center font-semibold">
                                {form.watch('scores').slice(9, 18).reduce((sum, hole) => sum + (hole.score || 0), 0) || "-"}
                              </td>
                            </tr>
                            
                            {/* Putts entry row */}
                            <tr>
                              <th className="px-1 py-2 text-left font-medium">Putts:</th>
                              {selectedCourse.holes.slice(9, 18).map((hole, index) => (
                                <td key={hole.number} className="px-1 py-2 text-center">
                                  <FormField
                                    control={form.control}
                                    name={`scores.${index + 9}.putts`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            {...field}
                                            min={0}
                                            max={6}
                                            className="h-8 w-12 text-center mx-auto"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                              ))}
                              <td className="px-1 py-2 text-center font-semibold">
                                {form.watch('scores').slice(9, 18).reduce((sum, hole) => sum + (hole.putts || 0), 0) || "-"}
                              </td>
                            </tr>
                            
                            {/* Additional statistics in a separate section below */}
                            <tr>
                              <td colSpan={11} className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {selectedCourse.holes.slice(9, 18).map((hole, index) => (
                                    <div key={hole.number} className="bg-gray-50 p-3 rounded-md">
                                      <h4 className="font-semibold mb-2">Hole {hole.number} - Par {hole.par}</h4>
                                      <div className="space-y-2">
                                        {/* FIR - Fairway in Regulation */}
                                        {hole.par !== 3 ? (
                                          <div className="flex items-center justify-between">
                                            <label htmlFor={`fir-${hole.number}`} className="text-sm">Fairway Hit:</label>
                                            <FormField
                                              control={form.control}
                                              name={`scores.${index + 9}.fairwayHit`}
                                              render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                  <FormControl>
                                                    <Select
                                                      onValueChange={(value) => field.onChange(value === "true")}
                                                      value={field.value === null ? "" : field.value.toString()}
                                                    >
                                                      <SelectTrigger id={`fir-${hole.number}`} className="h-8 w-16">
                                                        <SelectValue placeholder="-" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem value="true">✓</SelectItem>
                                                        <SelectItem value="false">✗</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </FormControl>
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Fairway Hit:</span>
                                            <span className="text-sm text-gray-400">N/A</span>
                                          </div>
                                        )}

                                        {/* GIR - Green in Regulation */}
                                        <div className="flex items-center justify-between">
                                          <label htmlFor={`gir-${hole.number}`} className="text-sm">Green in Regulation:</label>
                                          <FormField
                                            control={form.control}
                                            name={`scores.${index + 9}.greenInRegulation`}
                                            render={({ field }) => (
                                              <FormItem className="space-y-0">
                                                <FormControl>
                                                  <Select
                                                    onValueChange={(value) => field.onChange(value === "true")}
                                                    value={field.value.toString()}
                                                  >
                                                    <SelectTrigger id={`gir-${hole.number}`} className="h-8 w-16">
                                                      <SelectValue placeholder="-" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="true">✓</SelectItem>
                                                      <SelectItem value="false">✗</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        </div>

                                        {/* Penalty strokes */}
                                        <div className="flex items-center justify-between">
                                          <label htmlFor={`penalty-${hole.number}`} className="text-sm">Penalty Strokes:</label>
                                          <FormField
                                            control={form.control}
                                            name={`scores.${index + 9}.penaltyStrokes`}
                                            render={({ field }) => (
                                              <FormItem className="space-y-0">
                                                <FormControl>
                                                  <Input
                                                    id={`penalty-${hole.number}`}
                                                    type="number"
                                                    {...field}
                                                    min={0}
                                                    max={5}
                                                    className="h-8 w-16 text-center"
                                                  />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Totals (displayed for both tabs) */}
                  <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-semibold text-lg mb-2">Round Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Total Score</div>
                        <div className="font-semibold text-lg">
                          {holeCount === "9"
                            ? form.watch('scores').slice(0, 9).reduce((sum, hole) => sum + (hole.score || 0), 0) || "-"
                            : form.watch('scores').reduce((sum, hole) => sum + (hole.score || 0), 0) || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">To Par</div>
                        <div className="font-semibold text-lg">
                          {(() => {
                            const totalScore = holeCount === "9"
                              ? form.watch('scores').slice(0, 9).reduce((sum, hole) => sum + (hole.score || 0), 0) || 0
                              : form.watch('scores').reduce((sum, hole) => sum + (hole.score || 0), 0) || 0;
                            const totalPar = holeCount === "9" ? front9Totals.par : totalTotals.par;
                            const diff = totalScore - totalPar;
                            if (totalScore === 0) return "-";
                            return diff === 0 ? "E" : diff > 0 ? `+${diff}` : diff;
                          })()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Putts</div>
                        <div className="font-semibold text-lg">
                          {holeCount === "9"
                            ? form.watch('scores').slice(0, 9).reduce((sum, hole) => sum + (hole.putts || 0), 0) || "-"
                            : form.watch('scores').reduce((sum, hole) => sum + (hole.putts || 0), 0) || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Course</div>
                        <div className="font-semibold text-lg truncate">
                          {selectedCourse?.name || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Add any notes about your round here" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Include details about weather, course conditions, or other factors.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedCourse || !selectedTee}
                className="bg-[#448460] hover:bg-[#448460]/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Score Card"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HoleByHoleScoreCard; 