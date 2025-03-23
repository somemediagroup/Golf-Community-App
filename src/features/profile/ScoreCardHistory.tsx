import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ChevronRight, Filter, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import ScoreCardSummary from "./ScoreCardSummary";
import { useToast } from "@/components/ui/use-toast";

// Define the props interface
interface ScoreCardHistoryProps {
  userId?: string;
  viewOnly?: boolean;
}

// Mock data for scorecards
const mockScoreCards = [
  {
    id: "sc1",
    course_name: "Pine Valley Golf Club",
    date_played: "2023-09-15",
    score: 82,
    tee_color: "white",
    holes_played: "18",
    notes: "Great day, struggled with putting",
    front_nine: 41,
    back_nine: 41,
    stats: {
      scoreVsPar: "+10", 
      totalPutts: 32,
      fairwaysHit: "8/14",
      fairwayPercentage: 57,
      greensInRegulation: 7,
      girPercentage: 39,
      penalties: 2,
      puttsPerHole: "1.8"
    }
  },
  {
    id: "sc2",
    course_name: "Pebble Beach Golf Links",
    date_played: "2023-08-28",
    score: 88,
    tee_color: "white",
    holes_played: "18",
    notes: "Windy conditions",
    front_nine: 45,
    back_nine: 43,
    stats: {
      scoreVsPar: "+16", 
      totalPutts: 34,
      fairwaysHit: "6/14",
      fairwayPercentage: 43,
      greensInRegulation: 5,
      girPercentage: 28,
      penalties: 3,
      puttsPerHole: "1.9"
    }
  },
  {
    id: "sc3",
    course_name: "Augusta National Golf Club",
    date_played: "2023-08-10",
    score: 85,
    tee_color: "blue",
    holes_played: "18",
    notes: "Hit 9 fairways",
    front_nine: 44,
    back_nine: 41,
    stats: {
      scoreVsPar: "+13", 
      totalPutts: 31,
      fairwaysHit: "9/14",
      fairwayPercentage: 64,
      greensInRegulation: 6,
      girPercentage: 33,
      penalties: 2,
      puttsPerHole: "1.7"
    }
  },
  {
    id: "sc4",
    course_name: "Torrey Pines Golf Course",
    date_played: "2023-07-22",
    score: 79,
    tee_color: "white",
    holes_played: "18",
    notes: "Best round in months",
    front_nine: 39,
    back_nine: 40,
    stats: {
      scoreVsPar: "+7", 
      totalPutts: 28,
      fairwaysHit: "10/14",
      fairwayPercentage: 71,
      greensInRegulation: 9,
      girPercentage: 50,
      penalties: 1,
      puttsPerHole: "1.6"
    }
  },
  {
    id: "sc5",
    course_name: "St Andrews Links (Old Course)",
    date_played: "2023-07-05",
    score: 92,
    tee_color: "white",
    holes_played: "18",
    notes: "Struggled with the bunkers",
    front_nine: 47,
    back_nine: 45,
    stats: {
      scoreVsPar: "+20", 
      totalPutts: 36,
      fairwaysHit: "5/14",
      fairwayPercentage: 36,
      greensInRegulation: 4,
      girPercentage: 22,
      penalties: 4,
      puttsPerHole: "2.0"
    }
  },
  {
    id: "sc6",
    course_name: "Royal County Down",
    date_played: "2023-09-01",
    score: 45,
    tee_color: "gold",
    holes_played: "9",
    notes: "Played the front nine only due to weather",
    stats: {
      scoreVsPar: "+9", 
      totalPutts: 17,
      fairwaysHit: "4/7",
      fairwayPercentage: 57,
      greensInRegulation: 3,
      girPercentage: 33,
      penalties: 1,
      puttsPerHole: "1.9"
    }
  },
];

const ScoreCardHistory = ({ userId, viewOnly = false }: ScoreCardHistoryProps) => {
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  // Filter score cards based on selected filters
  const filteredScoreCards = mockScoreCards
    .filter((card) => {
      if (!filterCourse) return true;
      return card.course_name.toLowerCase().includes(filterCourse.toLowerCase());
    })
    .filter((card) => {
      if (timeFilter === "all") return true;
      const cardDate = new Date(card.date_played);
      const now = new Date();
      
      if (timeFilter === "thisMonth") {
        return (
          cardDate.getMonth() === now.getMonth() &&
          cardDate.getFullYear() === now.getFullYear()
        );
      } else if (timeFilter === "last3Months") {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return cardDate >= threeMonthsAgo;
      } else if (timeFilter === "thisYear") {
        return cardDate.getFullYear() === now.getFullYear();
      }
      return true;
    })
    .sort((a, b) => new Date(b.date_played).getTime() - new Date(a.date_played).getTime()); // Sort by date, newest first

  // Calculate statistics
  const totalRounds = filteredScoreCards.length;
  const avgScore = totalRounds
    ? Math.round(
        filteredScoreCards.reduce((sum, card) => sum + card.score, 0) /
          totalRounds
      )
    : 0;
  const bestScore = totalRounds
    ? Math.min(...filteredScoreCards.map((card) => card.score))
    : 0;

  // Get unique courses for the filter
  const uniqueCourses = Array.from(
    new Set(mockScoreCards.map((card) => card.course_name))
  );

  const handleViewScoreCard = (id: string) => {
    // In a real app, this would navigate to a detailed view
    // For now, just show a toast
    toast({
      title: "View Score Card",
      description: `Viewing details for score card ${id}`,
    });
  };

  const handleDeleteScoreCard = (id: string) => {
    // In a real app, this would call the API to delete
    // For now, just show a toast
    toast({
      title: "Delete Score Card",
      description: `Score card ${id} would be deleted`,
      variant: "destructive",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">Score History</CardTitle>
        <CardDescription>Track your round-by-round performance</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
          >
            <p className="text-sm text-gray-500">Total Rounds</p>
            <p className="text-2xl font-bold">{totalRounds}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
          >
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-2xl font-bold">{avgScore || "-"}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
          >
            <p className="text-sm text-gray-500">Best Score</p>
            <p className="text-2xl font-bold">{bestScore || "-"}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="courseFilter">Filter by Course</Label>
            <Select
              value={filterCourse}
              onValueChange={setFilterCourse}
            >
              <SelectTrigger id="courseFilter" className="w-full">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Courses</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label htmlFor="timeFilter">Time Period</Label>
            <Select
              value={timeFilter}
              onValueChange={setTimeFilter}
            >
              <SelectTrigger id="timeFilter" className="w-full">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Score Cards Grid */}
        {filteredScoreCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredScoreCards.map((scoreCard) => (
              <ScoreCardSummary 
                key={scoreCard.id}
                scoreCard={scoreCard}
                onView={handleViewScoreCard}
                onDelete={handleDeleteScoreCard}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">No score cards found</p>
            <p className="text-gray-400 text-sm">Try changing your filters or add a new score card</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreCardHistory; 