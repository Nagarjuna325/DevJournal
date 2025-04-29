import { useState } from "react";
import { Search, Menu, Moon, Sun, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewIssue: () => void;
}

export default function Header({ onToggleSidebar, onNewIssue }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality will be implemented later
    console.log("Searching for:", searchQuery);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <a href="/" className="flex items-center space-x-2">
            <span className="bg-primary-600 text-white p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bug">
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="16" height="16" x="4" y="6" rx="2"/>
                <path d="M12 14v4"/>
                <path d="m12 6-4 4"/>
                <path d="m12 6 4 4"/>
              </svg>
            </span>
            <span className="font-bold text-xl dark:text-white hidden sm:inline-block">DevIssueTracker</span>
          </a>
        </div>
        
        <div className="flex-1 px-4 md:px-8 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search issues..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
          </form>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNewIssue} className="md:hidden">New Issue</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
