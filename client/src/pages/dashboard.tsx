import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  CalendarIcon, 
  Home, 
  Archive, 
  Tag, 
  Link2, 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeftOpen,
  Settings,
  User,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { format, addDays, subDays, addMonths, subMonths, getMonth, getYear, startOfMonth, getDay, getDaysInMonth } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { requestAiSuggestions } from "@/lib/ai-service";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewIssueDialogOpen, setIsNewIssueDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [solution, setSolution] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isArchivesOpen, setIsArchivesOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [tags, setTags] = useState<{id: number, name: string, color: string}[]>([
    { id: 1, name: "React", color: "#61dafb" },
    { id: 2, name: "Frontend", color: "#f56565" },
    { id: 3, name: "API", color: "#48bb78" }
  ]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [links, setLinks] = useState<{title: string, url: string}[]>([]);
  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Mock data for issues
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: "Reacted",
      description: "Changing the Frontend bug.",
      date: new Date(2025, 3, 8),
      status: "resolved",
      tags: [1, 2]
    }
  ]);

  // Toggle dark/light mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Navigation functions
  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentViewMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewMonth(prev => addMonths(prev, 1));
  };

  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentViewMonth);
    const startDay = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = getDaysInMonth(currentViewMonth);
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < startDay; i++) {
      days.push({ 
        day: new Date(getYear(currentViewMonth), getMonth(currentViewMonth) - 1, 0).getDate() - (startDay - i - 1),
        isCurrentMonth: false,
        date: new Date(getYear(currentViewMonth), getMonth(currentViewMonth) - 1, 0 - (startDay - i - 1))
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(getYear(currentViewMonth), getMonth(currentViewMonth), i);
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        date,
        hasIssues: issues.some(issue => 
          format(issue.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: false,
        date: new Date(getYear(currentViewMonth), getMonth(currentViewMonth) + 1, i)
      });
    }
    
    return days;
  };

  // Form handling functions
  const handleNewIssue = () => {
    const newIssue = {
      id: issues.length + 1,
      title: issueTitle,
      description: issueDescription,
      date: selectedDate,
      status: "unresolved",
      tags: selectedTags
    };
    
    setIssues([...issues, newIssue]);
    setIsNewIssueDialogOpen(false);
    
    // Reset form fields
    setIssueTitle("");
    setIssueDescription("");
    setStepsToReproduce("");
    setSolution("");
    setTagInput("");
    setLinkTitle("");
    setLinkUrl("");
    setSelectedTags([]);
    setLinks([]);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTag = {
        id: tags.length + 1,
        name: tagInput.trim(),
        color: getRandomColor()
      };
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleSelectTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleAddLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      setLinks([...links, { title: linkTitle.trim(), url: linkUrl.trim() }]);
      setLinkTitle("");
      setLinkUrl("");
    }
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleSelectDay = (day: number, date: Date) => {
    setSelectedDate(date);
  };

  const getRandomColor = () => {
    const colors = ["#f56565", "#ed8936", "#ecc94b", "#48bb78", "#38b2ac", "#4299e1", "#667eea", "#9f7aea", "#ed64a6"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getAiSuggestions = async () => {
    try {
      const suggestions = await requestAiSuggestions(issueDescription);
      console.log("AI Suggestions:", suggestions);
      // Show suggestions to the user
      alert(`Suggestions: ${suggestions.join("\n\n")}`);
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 text-white" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
          <div className="text-xl font-bold">DevIssueTracker</div>
        </div>
        <div className="flex space-x-4 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary-700"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <span>Welcome, {user?.username}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setIsSettingsDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden`}>
          <nav className={`${isSidebarCollapsed ? 'p-2' : 'p-4'} space-y-6`}>
            <div>
              {!isSidebarCollapsed && (
                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  NAVIGATION
                </h3>
              )}
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-${isSidebarCollapsed ? 'center' : 'start'}`}
                    title="Dashboard"
                  >
                    <Home className={`${isSidebarCollapsed ? '' : 'mr-2'} h-5 w-5`} />
                    {!isSidebarCollapsed && "Dashboard"}
                  </Button>
                </li>
              </ul>
            </div>
            
            <div>
              {!isSidebarCollapsed && (
                <h3 
                  className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsArchivesOpen(!isArchivesOpen)}
                >
                  ARCHIVES
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${isArchivesOpen ? '' : '-rotate-90'}`} />
                </h3>
              )}
              {isSidebarCollapsed ? (
                <Button 
                  variant="ghost" 
                  className="w-full justify-center"
                  title="Archives"
                  onClick={() => setIsArchivesOpen(!isArchivesOpen)}
                >
                  <Archive className="h-5 w-5" />
                </Button>
              ) : isArchivesOpen && (
                <div className="mt-4 pl-2">
                  <div className="flex items-center justify-between mb-2">
                    <ChevronLeft 
                      className="h-4 w-4 cursor-pointer" 
                      onClick={handlePreviousMonth}
                    />
                    <span className="font-medium">{format(currentViewMonth, "MMMM yyyy")}</span>
                    <ChevronRight 
                      className="h-4 w-4 cursor-pointer" 
                      onClick={handleNextMonth}
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    <div className="text-center font-medium">Su</div>
                    <div className="text-center font-medium">Mo</div>
                    <div className="text-center font-medium">Tu</div>
                    <div className="text-center font-medium">We</div>
                    <div className="text-center font-medium">Th</div>
                    <div className="text-center font-medium">Fr</div>
                    <div className="text-center font-medium">Sa</div>
                    
                    {/* Dynamic calendar days */}
                    {generateCalendarDays().map((day, index) => (
                      <div 
                        key={index} 
                        className={`
                          text-center p-1 cursor-pointer
                          ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                          ${day.isCurrentMonth && format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                            ? 'rounded-full bg-primary text-white' 
                            : ''
                          }
                          ${day.hasIssues && day.isCurrentMonth ? 'font-bold' : ''}
                          hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full
                        `}
                        onClick={() => handleSelectDay(day.day, day.date)}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {!isSidebarCollapsed && (
                <h3 
                  className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsTagsOpen(!isTagsOpen)}
                >
                  TAGS
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${isTagsOpen ? '' : '-rotate-90'}`} />
                </h3>
              )}
              {isSidebarCollapsed ? (
                <Button 
                  variant="ghost" 
                  className="w-full justify-center"
                  title="Tags"
                  onClick={() => setIsTagsOpen(!isTagsOpen)}
                >
                  <Tag className="h-5 w-5" />
                </Button>
              ) : isTagsOpen && (
                <div className="flex flex-wrap gap-2 mt-4 pl-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag.id} 
                      style={{ backgroundColor: tag.color }}
                      className="cursor-pointer"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Issue Journal</h1>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search issues..." 
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="secondary">Local Search</Button>
                <Dialog open={isNewIssueDialogOpen} onOpenChange={setIsNewIssueDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Issue</DialogTitle>
                      <DialogDescription>
                        Document a new coding issue you've encountered.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                          id="title" 
                          placeholder="e.g., React useEffect Dependency Bug" 
                          value={issueTitle}
                          onChange={(e) => setIssueTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Brief description of the issue"
                          className="min-h-[100px]" 
                          value={issueDescription}
                          onChange={(e) => setIssueDescription(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="steps">Steps to Reproduce</Label>
                        <Textarea 
                          id="steps" 
                          placeholder="Steps you took that led to the issue"
                          className="min-h-[100px]"
                          value={stepsToReproduce}
                          onChange={(e) => setStepsToReproduce(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="solution">Solution</Label>
                        <Textarea 
                          id="solution" 
                          placeholder="How you resolved the issue"
                          className="min-h-[100px]"
                          value={solution}
                          onChange={(e) => setSolution(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={getAiSuggestions}
                          className="mt-2"
                        >
                          Get AI Suggestions
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input 
                          id="date" 
                          value={format(selectedDate, "MMMM dd, yyyy")}
                          readOnly
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map(tag => (
                            <Badge 
                              key={tag.id} 
                              style={{ 
                                backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                                color: selectedTags.includes(tag.id) ? 'white' : 'currentColor',
                                borderColor: tag.color,
                                borderWidth: '1px'
                              }}
                              className="cursor-pointer"
                              onClick={() => handleSelectTag(tag.id)}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Add a new tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                          />
                          <Button variant="outline" onClick={handleAddTag}>Add</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Links</Label>
                        {links.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {links.map((link, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                <div>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs block">
                                    {link.title}
                                  </a>
                                  <span className="text-xs text-gray-500 truncate max-w-xs block">{link.url}</span>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveLink(index)}>×</Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex space-x-2 mb-2">
                          <Input 
                            placeholder="Link title"
                            value={linkTitle}
                            onChange={(e) => setLinkTitle(e.target.value)}
                          />
                          <Input 
                            placeholder="URL"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                          />
                          <Button variant="outline" onClick={handleAddLink}>Add</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleNewIssue}>Save Issue</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{format(selectedDate, "MMMM d, yyyy")}</h2>
              <div className="flex space-x-2 items-center">
                <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="px-2">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {issues
                .filter(issue => 
                  format(issue.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                )
                .map(issue => (
                  <Card key={issue.id} className="overflow-hidden">
                    <CardHeader className="p-4 bg-gray-50 dark:bg-gray-700 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-medium">{issue.title}</CardTitle>
                        <div className="flex mt-2 gap-1">
                          {issue.tags?.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return tag ? (
                              <Badge 
                                key={tagId} 
                                style={{ backgroundColor: tag.color }}
                                className="text-xs"
                              >
                                {tag.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{issue.description}</p>
                    </CardContent>
                  </Card>
                ))}
              
              {issues.filter(issue => 
                format(issue.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
              ).length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p>No issues recorded for this day.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsNewIssueDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Issue
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Button 
                variant={isDarkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Account Settings</Label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={() => {
                    setIsSettingsDialogOpen(false);
                    setIsChangePasswordDialogOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Current Password</Label>
              <Input 
                id="old-password" 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input 
                id="confirm-new-password" 
                type="password" 
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsChangePasswordDialogOpen(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Here you would handle the password change logic
                  // For now, we'll just show an alert
                  if (newPassword === confirmNewPassword) {
                    alert("Password changed successfully!");
                    setIsChangePasswordDialogOpen(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }
                }}
                disabled={!oldPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
              >
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
