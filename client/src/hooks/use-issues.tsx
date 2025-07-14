import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { IssueWithDetails } from "@shared/schema";

export function useIssues() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format date for API query (YYYY-MM-DD)
  const formatDateForApi = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Get issues for a specific date
  const {
    data: issues = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<IssueWithDetails[]>({
    queryKey: [`/api/issues/date/${formatDateForApi(currentDate)}`],
    enabled: true,
  });

  // Refetch issues for a specific date
  const refetchIssues = useCallback((date: Date) => {
    setCurrentDate(date);
    queryClient.invalidateQueries({
      queryKey: [`/api/issues/date/${formatDateForApi(date)}`],
    });
  }, []);

  // Create a new issue
  const createIssueMutation = useMutation({
    mutationFn: async (newIssue: any) => {
      //console.log("Creating issue with data:", newIssue);  // Debugging
      const res = await apiRequest("POST", "/api/issues", newIssue);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      //console.log("Issue created successfully");
      queryClient.invalidateQueries({
        queryKey: [`/api/issues/date/${formatDateForApi(currentDate)}`],
      });
      toast({
        title: "Issue created",
        description: "Your issue has been created successfully",
      });
    },
    onError: (error: Error) => {
      //console.log("Error creating issue:", error.message);
      toast({
        title: "Failed to create issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing issue
  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/issues/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/issues/date/${formatDateForApi(currentDate)}`],
      });
      toast({
        title: "Issue updated",
        description: "Your issue has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete an issue
  const deleteIssueMutation = useMutation({
    mutationFn: async (issueId: number) => {
      await apiRequest("DELETE", `/api/issues/${issueId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/issues/date/${formatDateForApi(currentDate)}`],
      });
      toast({
        title: "Issue deleted",
        description: "Your issue has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get AI suggestion for a solution
  const getSuggestionMutation = useMutation({
    mutationFn: async (issueData: { description: string, stepsToReproduce?: string }) => {
      const res = await apiRequest("POST", "/api/suggest-solution", issueData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Suggestion Generated",
        description: "We've generated a potential solution for your issue",
      });
      return data.suggestion;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate suggestion",
        description: error.message,
        variant: "destructive",
      });
      return null;
    },
  });

  return {
    issues,
    isLoading,
    isError,
    createIssueMutation,
    updateIssueMutation,
    deleteIssueMutation,
    getSuggestionMutation,
    refetchIssues,
    currentDate,
  };
}
