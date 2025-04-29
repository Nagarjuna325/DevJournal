import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
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
  Sun,
  Trash2,
  Upload,
  Paperclip
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
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
  const [fileAttachments, setFileAttachments] = useState<File[]>([]);
  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState<number | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Define the issue type
  type Issue = {
    id: number;
    title: string;
    description: string;
    stepsToReproduce?: string;
    solution?: string;
    date: Date;
    status: string;
    tags: number[];
    links?: {title: string, url: string}[];
    files?: {name: string, size: number, type: string, url: string}[];
  };

  // Mock data for issues
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 1,
      title: "React State Management Issue",
      description: "Components not re-rendering when state changes in nested objects.",
      stepsToReproduce: "1. Create nested state object\n2. Modify a property\n3. Observe component doesn't update",
      solution: "Use the spread operator to create a new object reference when updating state.",
      date: new Date(2025, 3, 8),
      status: "resolved",
      tags: [1, 2],
      links: [
        { title: "React State Docs", url: "https://reactjs.org/docs/state-and-lifecycle.html" }
      ],
      files: [
        { name: "bug-example.js", size: 2048, type: "text/javascript", url: "#" }
      ]
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

  // State to track which issue is being edited
  const [issueToEdit, setIssueToEdit] = useState<number | null>(null);
  
  // Form handling functions
  const handleNewIssue = () => {
    const newIssue = {
      id: Date.now(), // Using timestamp for unique ID
      title: issueTitle,
      description: issueDescription,
      stepsToReproduce: stepsToReproduce,
      solution: solution,
      date: selectedDate,
      status: "unresolved",
      tags: selectedTags,
      links: links,
      files: fileAttachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // In a real app, you'd upload the file to a server and store the URL
        url: URL.createObjectURL(file)
      }))
    };
    
    if (issueToEdit !== null) {
      // Update existing issue
      const updatedIssues = issues.map(issue => 
        issue.id === issueToEdit ? { ...newIssue, id: issueToEdit } : issue
      );
      setIssues(updatedIssues);
      console.log("✅ Successfully updated issue:", { ...newIssue, id: issueToEdit });
      alert("Issue updated successfully!");
    } else {
      // Save new issue to database
      saveIssueToDatabase(newIssue);
      
      // Add to local state
      setIssues([...issues, newIssue]);
    }
    
    setIsNewIssueDialogOpen(false);
    setIssueToEdit(null);
    
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
    setFileAttachments([]);
  };
  
  // Function to handle editing an issue
  const handleEditIssue = (id: number) => {
    const issueToEdit = issues.find(issue => issue.id === id);
    if (issueToEdit) {
      // Populate form with issue data
      setIssueTitle(issueToEdit.title);
      setIssueDescription(issueToEdit.description);
      setStepsToReproduce(issueToEdit.stepsToReproduce || "");
      setSolution(issueToEdit.solution || "");
      setSelectedTags(issueToEdit.tags || []);
      setLinks(issueToEdit.links || []);
      
      // For files, we can't directly edit them since they're immutable
      // In a real app, you'd need to handle file uploads differently
      setFileAttachments([]);
      
      // Set the issue being edited
      setIssueToEdit(id);
      
      // Open the dialog
      setIsNewIssueDialogOpen(true);
    }
  };

  // This would be connected to your backend in a real app
  const saveIssueToDatabase = (issue: any) => {
    console.log("✅ Successfully saved issue to database:", issue);
    // Show a success message to the user
    alert("Issue saved successfully!");
    
    // In a real app, you would make an API call to save the issue
    // Example: apiRequest('POST', '/api/issues', issue);
  };

  const handleDeleteIssue = (id: number) => {
    setIssueToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteIssue = () => {
    if (issueToDelete !== null) {
      // Delete from database
      // Example: apiRequest('DELETE', `/api/issues/${issueToDelete}`);
      console.log("✅ Successfully deleted issue with ID:", issueToDelete);
      
      // Show a success message to the user
      alert("Issue deleted successfully!");
      
      // Delete from local state
      setIssues(issues.filter(issue => issue.id !== issueToDelete));
      setIsDeleteDialogOpen(false);
      setIssueToDelete(null);
    }
  };

  const handleToggleIssueDetails = (id: number) => {
    if (isDetailViewOpen === id) {
      setIsDetailViewOpen(null);
    } else {
      setIsDetailViewOpen(id);
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFileAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...fileAttachments];
    newFiles.splice(index, 1);
    setFileAttachments(newFiles);
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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{issueToEdit !== null ? "Edit Issue" : "Create New Issue"}</DialogTitle>
                      <DialogDescription>
                        {issueToEdit !== null 
                          ? "Update the details of this issue." 
                          : "Document a new coding issue you've encountered."
                        }
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
                      
                      <div className="space-y-2">
                        <Label>File Attachments</Label>
                        {fileAttachments.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {fileAttachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                <div className="flex items-center">
                                  <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                                    <span className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveFile(index)}>×</Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            multiple
                          />
                          <Label 
                            htmlFor="file-upload" 
                            className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded text-sm flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Add File Attachment
                          </Label>
                          <span className="text-xs text-gray-500">
                            PDF, Word, Excel, Images, etc.
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button 
                          onClick={handleNewIssue}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {issueToEdit !== null ? "Update Issue" : "Save Issue"}
                        </Button>
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
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Issues for {format(selectedDate, "MMMM d, yyyy")}</h3>
              <Button 
                onClick={() => setIsNewIssueDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Issue
              </Button>
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
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                          onClick={() => handleEditIssue(issue.id)}
                          title="Edit issue"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteIssue(issue.id)}
                          title="Delete issue"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleIssueDetails(issue.id)}
                          title={isDetailViewOpen === issue.id ? "Collapse" : "Expand"}
                        >
                          <ChevronDown className={`h-4 w-4 transform transition-transform ${isDetailViewOpen === issue.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className={`p-4 ${isDetailViewOpen === issue.id ? '' : 'max-h-20 overflow-hidden'}`}>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{issue.description}</p>
                        </div>
                        
                        {isDetailViewOpen === issue.id && (
                          <>
                            {issue.stepsToReproduce && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Steps to Reproduce</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{issue.stepsToReproduce}</p>
                              </div>
                            )}
                            
                            {issue.solution && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Solution</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{issue.solution}</p>
                              </div>
                            )}
                            
                            {issue.links && issue.links.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Related Links</h4>
                                <ul className="space-y-1">
                                  {issue.links.map((link, index) => (
                                    <li key={index}>
                                      <a 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                      >
                                        {link.title}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {issue.files && issue.files.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Attachments</h4>
                                <ul className="space-y-1">
                                  {issue.files.map((file, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                      <Paperclip className="h-4 w-4 text-gray-400" />
                                      <a 
                                        href={file.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                      >
                                        {file.name}
                                      </a>
                                      <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                    {isDetailViewOpen !== issue.id && (
                      <CardFooter className="p-2 bg-gray-50 dark:bg-gray-700 flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleIssueDetails(issue.id)}
                        >
                          Show More
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              
              {issues.filter(issue => 
                format(issue.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
              ).length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p>No issues recorded for this day.</p>
                  <Button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setIssueToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteIssue}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
