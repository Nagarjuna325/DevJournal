import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { insertIssueSchema, Issue, issueStatusEnum } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarIcon, X, Plus, Link2 } from "lucide-react";

interface NewIssueFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  selectedDate: Date;
  editIssue?: Issue;
}

const formSchema = insertIssueSchema.omit({ userId: true }).extend({
  status: z.enum(["unresolved", "in_progress", "resolved"]),
});

type FormData = z.infer<typeof formSchema>;

export default function NewIssueForm({ 
  onSuccess, 
  onCancel, 
  selectedDate,
  editIssue 
}: NewIssueFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!editIssue;
  
  const defaultValues = useMemo(() => {
    if (editIssue) {
      return {
        title: editIssue.title,
        description: editIssue.description || "",
        stepsToReproduce: editIssue.stepsToReproduce || "",
        solution: editIssue.solution || "",
        status: editIssue.status as "unresolved" | "in_progress" | "resolved",
        date: editIssue.date,
      };
    }
    
    return {
      title: "",
      description: "",
      stepsToReproduce: "",
      solution: "",
      status: "unresolved" as const,
      date: format(selectedDate, "yyyy-MM-dd"),
    };
  }, [editIssue, selectedDate]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  //console.log("formState.errors", form.formState.errors);
  
  // Fetch tags
  const { data: allTags } = useQuery({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    },
  });
  
  // Create/update issue mutation
  const issueMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        await apiRequest("PUT", `/api/issues/${editIssue.id}`, data);
      } else {
        await apiRequest("POST", "/api/issues", {
          ...data,
          userId: user?.id,
        });
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Issue Updated" : "Issue Created",
        description: isEditing 
          ? "Your issue has been successfully updated." 
          : "Your new issue has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues/date"] });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} issue: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormData) => {
    console.log("Submitting form data:", data);  // ✅ Check if this prints
    issueMutation.mutate(data);
  };
  
  return (
    <div>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Issue" : "Create New Issue"}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Update the details of your issue" 
            : "Document a new development issue you've encountered"}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., React useEffect Dependency Bug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the issue" 
                    rows={3} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Steps to Reproduce */}
          <FormField
            control={form.control}
            name="stepsToReproduce"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steps to Reproduce</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Steps you took that led to the issue" 
                    rows={3} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Solution */}
          <FormField
            control={form.control}
            name="solution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solution</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="How you resolved the issue" 
                    rows={3} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unresolved" id="unresolved" />
                      <Label htmlFor="unresolved" className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                        <span>Unresolved</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in_progress" id="in_progress" />
                      <Label htmlFor="in_progress" className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
                        <span>In Progress</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="resolved" id="resolved" />
                      <Label htmlFor="resolved" className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        <span>Resolved</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      // value={field.value} 
                      // onChange={field.onChange}
                      {...field} 
                      type="date"
                      className="pl-3 pr-10"
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FormLabel>Tags</FormLabel>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2">
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs">New Tag</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {allTags && allTags.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      <div className="flex items-center">
                        <span 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        ></span>
                        <span>{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" className="shrink-0">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                React
                <button type="button" className="ml-1 inline-flex text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Hooks
                <button type="button" className="ml-1 inline-flex text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <FormLabel>Links</FormLabel>
            <div className="flex items-center space-x-2 mb-2">
              <Input placeholder="Link title" className="flex-1" />
              <Input placeholder="URL" className="flex-1" />
              <Button type="button" variant="secondary" className="shrink-0">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md">
                <div className="flex items-center">
                  <Link2 className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">React useEffect Docs</span>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={issueMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={issueMutation.isPending}
            >
              {issueMutation.isPending 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Issue" : "Save Issue")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
