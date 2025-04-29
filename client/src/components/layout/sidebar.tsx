import { useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Calendar,
  Tag,
  BarChart3,
  Plus,
  Filter,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Tag as TagType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activePath, setActivePath] = useState("/");
  
  // Fetch all tags
  const { data: tags } = useQuery<TagType[]>({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    },
  });

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="mr-3 h-5 w-5" /> },
    { name: "Tags", path: "/tags", icon: <Tag className="mr-3 h-5 w-5" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 className="mr-3 h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
    
      <aside 
        className={cn(
          "w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 fixed md:sticky inset-y-0 left-0 z-30 md:z-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 h-full overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-end p-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-full px-4 py-6">
          <nav className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Navigation
              </h3>
              <div className="mt-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => {
                      setActivePath(item.path);
                      if (window.innerWidth < 768) onClose();
                    }}
                  >
                    <a
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                        activePath === item.path
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Tags
                </h3>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {tags && tags.slice(0, 5).map((tag) => (
                  <a
                    key={tag.id}
                    href="#"
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span 
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: tag.color }}
                    ></span>
                    <span>{tag.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {Math.floor(Math.random() * 10) + 1}
                    </Badge>
                  </a>
                ))}
                
                {(!tags || tags.length === 0) && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                    No tags yet
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Saved Filters
              </h3>
              <div className="mt-2 space-y-1">
                <a
                  href="#"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Filter className="mr-3 h-5 w-5" />
                  <span>Unresolved Issues</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Filter className="mr-3 h-5 w-5" />
                  <span>This Week's Fixes</span>
                </a>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get suggestions on bug solutions
                    </p>
                  </div>
                </div>
                <Button className="mt-3 w-full" variant="default" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Ask AI Assistant</span>
                </Button>
              </div>
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
