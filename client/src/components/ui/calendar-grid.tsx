import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

interface CalendarGridProps {
  currentMonth: Date;
  onChangeMonth: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({ currentMonth, onChangeMonth, selectedDate, onSelectDate }: CalendarGridProps) {
  // Get days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Helper functions for navigation
  const prevMonth = () => onChangeMonth(subMonths(currentMonth, 1));
  const nextMonth = () => onChangeMonth(addMonths(currentMonth, 1));
  
  // Generate day labels
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0 h-auto"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0 h-auto"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-center">
        {/* Day headers */}
        {dayLabels.map((day, i) => (
          <div key={i} className="text-gray-500 dark:text-gray-400">{day}</div>
        ))}
        
        {/* Calendar days */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`prev-${i}`} className="py-1 text-gray-400 dark:text-gray-600">
            {format(subMonths(monthStart, 1), 't') === '1'
              ? format(subMonths(endOfMonth(monthStart), 1), 'd')
              : ''}
          </div>
        ))}
        
        {monthDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <Button
              key={`day-${i}`}
              variant="ghost"
              size="icon"
              onClick={() => onSelectDate(day)}
              className={cn(
                "py-1 h-6 w-6 text-xs",
                isSelected 
                  ? "rounded-full bg-primary text-white hover:bg-primary hover:text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-dark-200"
              )}
            >
              {format(day, 'd')}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
