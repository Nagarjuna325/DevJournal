import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, Calendar, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { IssueWithDetails } from "@shared/schema";
import { cn } from "@/lib/utils";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  solution: z.string().optional(),
  status: z.enum(["resolved", "in_progress", "stuck"]),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewIssueFormProps {
  issue?: IssueWithDetails;
  onSubmit: (data: FormValues & { tags?: string[] }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function NewIssueForm({ 
  issue, 
  onSubmit, 
  onCancel, 
  onDelete,
  isLoading = false 
}: NewIssueFormProps) {
  const [tags, setTags] = useState<string[]>(
    issue?.tags ? issue.tags.map(tag => tag.name) : []
  );
  const [tagInput, setTagInput] = useState("");

  // Set default values based on whether we're editing an existing issue
  const defaultValues: Partial<FormValues> = {
    title: issue?.title || "",
    description: issue?.description || "",
    stepsToReproduce: issue?.stepsToReproduce || "",
    solution: issue?.solution || "",
    status: (issue?.status as any) || "in_progress",
    date: issue?.date ? new Date(issue.date) : new Date(),
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Add tag to the list
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag from the list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      tags
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          {issue ? "Edit Issue" : "Create New Issue"}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., React useEffect Dependency Bug" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="block mb-2">Tags</FormLabel>
            <div className="flex items-center">
              <Input 
                type="text" 
                placeholder="Add a tag" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 mr-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="secondary"
                onClick={addTag}
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    className="flex items-center"
                    variant={
                      tag.toLowerCase().includes('react') ? 'react' :
                      tag.toLowerCase().includes('express') ? 'express' :
                      tag.toLowerCase().includes('typescript') ? 'typescript' :
                      tag.toLowerCase().includes('database') ? 'database' :
                      tag.toLowerCase().includes('critical') ? 'critical' :
                      'default'
                    }
                  >
                    {tag}
                    <button 
                      type="button" 
                      className="ml-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="resolved" id="resolved" />
                      <label htmlFor="resolved" className="text-sm text-slate-700 dark:text-slate-300">Resolved</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in_progress" id="in-progress" />
                      <label htmlFor="in-progress" className="text-sm text-slate-700 dark:text-slate-300">In Progress</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stuck" id="stuck" />
                      <label htmlFor="stuck" className="text-sm text-slate-700 dark:text-slate-300">Stuck</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            {onDelete && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={onDelete}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                issue ? "Update Issue" : "Save Issue"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
