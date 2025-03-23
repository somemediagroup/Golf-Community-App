import { useState } from "react";
import { CheckIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CategoryOption {
  value: string;
  label: string;
}

interface SourceOption {
  value: string;
  label: string;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface NewsFiltersProps {
  categoryOptions: CategoryOption[];
  sourceOptions: SourceOption[];
  selectedCategory: string;
  selectedSources: string[];
  dateRange: DateRange | undefined;
  onApplyFilters: (category: string, sources: string[], dates: DateRange | undefined) => void;
  onReset: () => void;
}

const NewsFilters = ({
  categoryOptions,
  sourceOptions,
  selectedCategory,
  selectedSources,
  dateRange,
  onApplyFilters,
  onReset
}: NewsFiltersProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localSources, setLocalSources] = useState<string[]>(selectedSources);
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(dateRange);

  // Handle source toggle
  const toggleSource = (value: string) => {
    setLocalSources(prev => 
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // Handle date selection
  const onDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const currentRange = localDateRange || { from: null, to: null };
    
    if (!currentRange.from) {
      setLocalDateRange({ ...currentRange, from: date });
    } else if (!currentRange.to && date > currentRange.from) {
      setLocalDateRange({ ...currentRange, to: date });
      setCalendarOpen(false);
    } else {
      setLocalDateRange({ from: date, to: null });
    }
  };

  // Reset filters
  const handleReset = () => {
    setLocalCategory("all");
    setLocalSources([]);
    setLocalDateRange(undefined);
    onReset();
  };

  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters(localCategory, localSources, localDateRange);
  };

  return (
    <Card className="mb-6 bg-background border-border">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-foreground">Filter News</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="text-muted-green hover:text-white hover:bg-muted-green"
          >
            Reset Filters
          </Button>
        </div>
        
        <Separator className="bg-border" />
        
        {/* Categories */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2 text-foreground">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(category => (
              <Badge
                key={category.value}
                variant={localCategory === category.value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  localCategory === category.value 
                    ? "bg-muted-green text-white" 
                    : "border-muted-green text-muted-green hover:bg-muted-green hover:text-white"
                )}
                onClick={() => setLocalCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <Separator className="bg-border" />
        
        {/* Sources */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2 text-foreground">Sources</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sourceOptions.map(source => (
              <div 
                key={source.value}
                className={cn(
                  "flex items-center gap-2 text-sm cursor-pointer p-2 rounded",
                  localSources.includes(source.value) 
                    ? "bg-muted-green/10" 
                    : "hover:bg-muted/60"
                )}
                onClick={() => toggleSource(source.value)}
              >
                <div className={cn(
                  "h-4 w-4 rounded-sm border flex items-center justify-center",
                  localSources.includes(source.value) 
                    ? "bg-muted-green border-muted-green text-white" 
                    : "border-muted-foreground"
                )}>
                  {localSources.includes(source.value) && (
                    <CheckIcon className="h-3 w-3" />
                  )}
                </div>
                <span className="text-foreground">{source.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="bg-border" />
        
        {/* Date Range */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2 text-foreground">Date Range</h4>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal border-input bg-background text-foreground"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-green" />
                {localDateRange?.from && localDateRange.to ? (
                  <span>
                    {format(localDateRange.from, "MMM d, yyyy")} - {format(localDateRange.to, "MMM d, yyyy")}
                  </span>
                ) : localDateRange?.from ? (
                  <span>
                    {format(localDateRange.from, "MMM d, yyyy")} - Select end date
                  </span>
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border-border">
              <Calendar
                mode="single"
                selected={localDateRange?.from || undefined}
                onSelect={onDateSelect}
                initialFocus
                className="bg-background text-foreground"
                classNames={{
                  day_selected: "bg-muted-green text-white hover:bg-muted-green hover:text-white",
                  day_today: "bg-muted text-foreground",
                  day_range_middle: "bg-muted-green/20",
                  day_range_end: "bg-muted-green text-white"
                }}
                disabled={(date) => 
                  (localDateRange?.from && localDateRange?.to) ? 
                    (date < new Date(new Date().setDate(new Date().getDate() - 365)) || date > new Date()) : 
                    (date < new Date(new Date().setDate(new Date().getDate() - 365)) || date > new Date() || (localDateRange?.from ? date < localDateRange.from : false))
                }
              />
            </PopoverContent>
          </Popover>
          
          {(localDateRange?.from || localDateRange?.to) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocalDateRange(undefined)}
              className="mt-2 text-muted-green hover:text-white hover:bg-muted-green"
            >
              Clear Dates
            </Button>
          )}
        </div>
        
        {/* Apply Filters Button */}
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleApplyFilters}
            className="bg-muted-green hover:bg-muted-green-dark text-white"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFilters; 