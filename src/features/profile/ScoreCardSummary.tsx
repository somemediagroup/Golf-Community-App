import React from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define types
interface ScoreCardSummaryProps {
  scoreCard: {
    id: string;
    course_name: string;
    date_played: string;
    score: number;
    tee_color: string;
    holes_played: string;
    stats?: {
      totalScore?: number;
      scoreVsPar?: string;
      totalPutts?: number;
      fairwaysHit?: string;
      fairwayPercentage?: number;
      greensInRegulation?: number;
      girPercentage?: number;
      penalties?: number;
      puttsPerHole?: string;
      handicapUsed?: number;
    };
    front_nine?: number;
    back_nine?: number;
  };
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ScoreCardSummary: React.FC<ScoreCardSummaryProps> = ({
  scoreCard,
  onView,
  onDelete,
}) => {
  const { id, course_name, date_played, score, tee_color, holes_played, stats } = scoreCard;
  
  // Format date from ISO string
  const formattedDate = format(new Date(date_played), "MMM d, yyyy");

  // Function to handle view button click
  const handleView = () => {
    if (onView) {
      onView(id);
    }
  };

  // Function to handle delete button click
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{course_name}</CardTitle>
        <CardDescription>{formattedDate} • {holes_played} Holes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-medium border-b border-gray-200 bg-[#00441B] text-white"></th>
                {scoreCard.front_nine !== undefined && holes_played === "18" && (
                  <th className="px-2 py-1 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Front 9</th>
                )}
                {scoreCard.back_nine !== undefined && holes_played === "18" && (
                  <th className="px-2 py-1 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Back 9</th>
                )}
                <th className="px-2 py-1 text-center font-medium border-b border-gray-200 bg-[#00441B] text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Tee color row */}
              <tr className={cn(
                "border-b border-gray-200",
                tee_color === "black" && "bg-white",
                tee_color === "symetra" && "bg-white",
                tee_color === "blue" && "bg-white",
                tee_color === "white" && "bg-white",
                tee_color === "tournament" && "bg-white",
                tee_color === "gold" && "bg-white",
                tee_color === "red" && "bg-white",
              )}>
                <th className="px-2 py-1 text-left font-medium">
                  {tee_color.charAt(0).toUpperCase() + tee_color.slice(1)}
                </th>
                {scoreCard.front_nine !== undefined && holes_played === "18" && (
                  <td className="px-2 py-1 text-center">{scoreCard.front_nine}</td>
                )}
                {scoreCard.back_nine !== undefined && holes_played === "18" && (
                  <td className="px-2 py-1 text-center">{scoreCard.back_nine}</td>
                )}
                <td className="px-2 py-1 text-center font-semibold">{score}</td>
              </tr>

              {/* To Par row */}
              {stats && stats.scoreVsPar && (
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-left font-medium">To Par</th>
                  <td className={cn(
                    "px-2 py-1 text-center font-semibold",
                    "colspan-full",
                    stats.scoreVsPar.includes("+") ? "text-red-600" : 
                    stats.scoreVsPar === "E" ? "text-green-600" : "text-green-600"
                  )}>
                    {stats.scoreVsPar}
                  </td>
                </tr>
              )}

              {/* Handicap row */}
              {stats && (
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-left font-medium bg-[#3F75B8] text-white">Handicap</th>
                  <td className={cn(
                    "px-2 py-1 text-center",
                    "colspan-full bg-[#3F75B8] text-white"
                  )}>
                    {stats.handicapUsed || "-"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Statistics Summary */}
        {stats && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
            {stats.totalPutts && (
              <div className="flex items-center justify-between">
                <span>Putts:</span>
                <span className="font-medium">{stats.totalPutts}</span>
              </div>
            )}
            {stats.fairwayPercentage !== undefined && (
              <div className="flex items-center justify-between">
                <span>Fairways:</span>
                <span className="font-medium">{stats.fairwayPercentage}%</span>
              </div>
            )}
            {stats.girPercentage !== undefined && (
              <div className="flex items-center justify-between">
                <span>GIR:</span>
                <span className="font-medium">{stats.girPercentage}%</span>
              </div>
            )}
            {stats.puttsPerHole && (
              <div className="flex items-center justify-between">
                <span>Putts/Hole:</span>
                <span className="font-medium">{stats.puttsPerHole}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-100 pt-2 bg-gray-50">
        <div className="flex justify-between w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-900"
            onClick={handleView}
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ScoreCardSummary; 