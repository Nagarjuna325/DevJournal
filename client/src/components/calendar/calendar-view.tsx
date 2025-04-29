import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Issue } from "@shared/schema";

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  issues: Issue[];
}

export default function CalendarView({ selectedDate, onSelectDate, issues }: CalendarViewProps) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get start day of the month (0 = Sunday, 1 = Monday, etc.)
    const startDay = monthStart.getDay();
    
    // Add empty days for the start of the month
    const emptySpotsAtStart = Array(startDay).fill(null);
    
    return [...emptySpotsAtStart, ...daysInMonth];
  }, [selectedDate]);
  
  // Group issues by date
  const issuesByDate = useMemo(() => {
    const result: Record<string, Issue[]> = {};
    
    issues.forEach((issue) => {
      // Convert date string to Date object if needed
      const issueDate = typeof issue.date === 'string' 
        ? parseISO(issue.date) 
        : new Date(issue.date);
      
      const dateKey = format(issueDate, 'yyyy-MM-dd');
      
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      
      result[dateKey].push(issue);
    });
    
    return result;
  }, [issues]);
  
  // Get tag colors for a specific date
  const getTagColors = (date: Date | null) => {
    if (!date) return [];
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const issuesForDate = issuesByDate[dateKey] || [];
    
    // In a full implementation, we would get actual tag colors from the issues
    // For now, we'll use some default colors
    if (issuesForDate.length === 0) return [];
    
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
    return colors.slice(0, Math.min(issuesForDate.length, 3));
  };
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-xs text-center font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-sm">
        {calendarDays.map((day, index) => {
          if (!day) {
            // Empty spot for days before the start of the month
            return (
              <div 
                key={`empty-${index}`} 
                className="aspect-square flex items-center justify-center text-gray-400 dark:text-gray-600"
              >
                {/* Previous month day number would go here */}
              </div>
            );
          }
          
          const isSelected = isSameDay(selectedDate, day);
          const isCurrentMonth = isSameMonth(selectedDate, day);
          const isToday = isSameDay(new Date(), day);
          const tagColors = getTagColors(day);
          const hasIssues = tagColors.length > 0;
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square rounded-md flex flex-col items-center justify-center cursor-pointer border",
                isSelected
                  ? "bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-medium"
                  : isToday
                  ? "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
              onClick={() => onSelectDate(day)}
            >
              <span>{format(day, 'd')}</span>
              {hasIssues && (
                <div className="flex space-x-0.5 mt-1">
                  {tagColors.map((color, i) => (
                    <span key={i} className={cn("w-1 h-1 rounded-full", color)}></span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 text-xs mt-2">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
          <span className="text-gray-600 dark:text-gray-400">React</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          <span className="text-gray-600 dark:text-gray-400">Node.js</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
          <span className="text-gray-600 dark:text-gray-400">TypeScript</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
          <span className="text-gray-600 dark:text-gray-400">CSS</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
          <span className="text-gray-600 dark:text-gray-400">API</span>
        </div>
      </div>
    </div>
  );
}
