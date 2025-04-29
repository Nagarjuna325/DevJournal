import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, ChevronUp, Home, BarChart2, 
  Folder, Tag, Settings, Plus, X 
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface MobileSidebarProps {
  onTagClick?: (tag: string) => void;
}

export function MobileSidebar({ onTagClick }: MobileSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Common tags - in a real app these would be fetched from the backend
  const tags = [
    { name: "React", variant: "react" },
    { name: "Express", variant: "express" },
    { name: "TypeScript", variant: "typescript" },
    { name: "Database", variant: "database" },
    { name: "Critical", variant: "critical" },
  ];

  // Handle tag click
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <span className="sr-only">Open menu</span>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 overflow-y-auto">
        <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-700">
          <SheetTitle className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
              <BugIcon />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-slate-800 dark:text-white">DevIssueTracker</h1>
          </SheetTitle>
        </SheetHeader>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">NAVIGATION</h2>
            <ul>
              <li className="mb-1">
                <Link href="/">
                  <a 
                    className={`flex items-center px-3 py-2 rounded-md ${location === '/' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    <span className="ml-2">Dashboard</span>
                  </a>
                </Link>
              </li>
              <li className="mb-1">
                <a href="#" className="flex items-center px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <BarChart2 className="w-5 h-5" />
                  <span className="ml-2">Analytics</span>
                </a>
              </li>
              <li className="mb-1">
                <a href="#" className="flex items-center px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                  <Folder className="w-5 h-5" />
                  <span className="ml-2">Collections</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Archives section with calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">ARCHIVES</h2>
              <button 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                {isCalendarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
            
            {isCalendarOpen && (
              <>
                <div className="text-sm font-medium mb-2">
                  {date ? format(date, 'MMMM yyyy') : 'Select a date'}
                </div>
                
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </>
            )}
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">TAGS</h2>
              <div className="flex gap-1">
                <button 
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  onClick={() => setIsTagsOpen(!isTagsOpen)}
                >
                  {isTagsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {isTagsOpen && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.name} 
                    variant={tag.variant as any} 
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </nav>
        
        {/* User profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback>
                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Developer</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                onClick={handleLogout}
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Icon components
function Menu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"></line>
      <line x1="4" x2="20" y1="6" y2="6"></line>
      <line x1="4" x2="20" y1="18" y2="18"></line>
    </svg>
  );
}

function BugIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.88 1.88"></path>
      <path d="M14.12 3.88L16 2"></path>
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"></path>
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"></path>
      <path d="M12 20v-9"></path>
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5"></path>
      <path d="M6 13H2"></path>
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4"></path>
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"></path>
      <path d="M22 13h-4"></path>
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"></path>
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}
