import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Issue } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Sparkles, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NewIssueForm from "./new-issue-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { requestAiSuggestions } from "@/lib/ai-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IssueCardProps {
  issue: Issue;
  onUpdate: () => void;
}

export default function IssueCard({ issue, onUpdate }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  
  // Fetch tags for this issue
  const { data: tags } = useQuery({
    queryKey: ["/api/issues", issue.id, "tags"],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${issue.id}/tags`);
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    },
  });
  
  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/issues/${issue.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Issue Deleted",
        description: "The issue has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues/date"] });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete issue: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Get AI suggestions for the issue
  const handleGetAiSuggestions = async () => {
    if (!issue.description) {
      toast({
        title: "Missing Description",
        description: "Issue needs a description to generate AI suggestions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await requestAiSuggestions(issue.description);
      setAiSuggestions(suggestions);
      setIsExpanded(true); // Expand the card to show suggestions
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = () => {
    switch (issue.status) {
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            Resolved
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
            Unresolved
          </Badge>
        );
    }
  };
  
  // Format the issue date for display
  const issueTime = issue.createdAt ? new Date(issue.createdAt) : new Date();
  const formattedTime = format(issueTime, "h:mm a");
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              {getStatusBadge()}
              
              {tags && tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className={`bg-${tag.color.replace('#', '')}-100 dark:bg-${tag.color.replace('#', '')}-900/30 text-${tag.color.replace('#', '')}-800 dark:text-${tag.color.replace('#', '')}-300 border-${tag.color.replace('#', '')}-200 dark:border-${tag.color.replace('#', '')}-800`}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{issue.title}</h3>
            
            {issue.description && (
              <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {issue.description}
              </p>
            )}
            
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {issue.stepsToReproduce && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Steps to Reproduce</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{issue.stepsToReproduce}</p>
                  </div>
                )}
                
                {issue.solution && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Solution</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{issue.solution}</p>
                  </div>
                )}
                
                {aiSuggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI Suggestions</h4>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1">
                      {aiSuggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {(issue.description || issue.stepsToReproduce || issue.solution) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 px-0 h-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show more</span>
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="flex flex-shrink-0 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGetAiSuggestions} disabled={isLoadingSuggestions}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>{isLoadingSuggestions ? "Loading..." : "AI Suggestions"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={() => deleteIssueMutation.mutate()}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{formattedTime}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="text-xs">Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={handleGetAiSuggestions}
              disabled={isLoadingSuggestions}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              <span className="text-xs">{isLoadingSuggestions ? "Loading..." : "AI Suggestions"}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Edit Issue Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <NewIssueForm 
            onSuccess={() => {
              setIsEditModalOpen(false);
              onUpdate();
            }} 
            onCancel={() => setIsEditModalOpen(false)}
            selectedDate={new Date(issue.date)}
            editIssue={issue}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
