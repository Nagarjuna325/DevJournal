import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface CalendarNavProps {
  date: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDate: (date: Date) => void;
}

export function CalendarNav({ date, onPrevDay, onNextDay, onSelectDate }: CalendarNavProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onPrevDay} 
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-200"
      >
        <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost"
            className="p-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-200 flex items-center gap-1"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="sr-only md:not-sr-only">{format(date, 'MMMM d, yyyy')}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && onSelectDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onNextDay}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-200"
      >
        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </Button>
    </div>
  );
}
