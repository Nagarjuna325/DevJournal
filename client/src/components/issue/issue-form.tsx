import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, X, Loader2, Sparkles } from "lucide-react";
import { insertIssueSchema, IssueWithDetails } from "@shared/schema";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDate, getTagColorByName } from "@/lib/utils";
import { useCreateIssue, useUpdateIssue, useGetAISuggestion } from "@/hooks/use-issues";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IssueFormProps {
  defaultValues?: Partial<IssueWithDetails>;
  onSuccess?: () => void;
  defaultDate?: Date;
}

const formSchema = insertIssueSchema.extend({
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Must be a valid URL"),
  })).optional(),
}).omit({ userId: true });

type FormValues = z.infer<typeof formSchema>;

export function IssueForm({ defaultValues, onSuccess, defaultDate }: IssueFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(defaultValues?.tags?.map(t => t.name) || []);
  const [links, setLinks] = useState<{ title: string; url: string }[]>(
    defaultValues?.links?.map(l => ({ title: l.title, url: l.url })) || []
  );
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue(defaultValues?.id || 0);
  const aiSuggestion = useGetAISuggestion();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      stepsToReproduce: defaultValues?.stepsToReproduce || "",
      solution: defaultValues?.solution || "",
      date: defaultValues?.date ? new Date(defaultValues.date) : defaultDate || new Date(),
      tags: tags,
      links: links,
    },
  });
  
  // Update form when default values change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: defaultValues.title,
        description: defaultValues.description,
        stepsToReproduce: defaultValues.stepsToReproduce,
        solution: defaultValues.solution,
        date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
      });
      
      setTags(defaultValues.tags?.map(t => t.name) || []);
      setLinks(defaultValues.links?.map(l => ({ title: l.title, url: l.url })) || []);
    } else if (defaultDate) {
      form.reset({
        title: "",
        description: "",
        stepsToReproduce: "",
        solution: "",
        date: defaultDate,
      });
      
      setTags([]);
      setLinks([]);
    }
  }, [defaultValues, defaultDate, form]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      const issueData = {
        ...data,
        tags,
        links,
      };
      
      if (defaultValues?.id) {
        await updateIssue.mutateAsync(issueData);
      } else {
        await createIssue.mutateAsync(issueData);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving issue:", error);
    }
  };
  
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const addLink = () => {
    if (linkTitle && linkUrl) {
      setLinks([...links, { title: linkTitle, url: linkUrl }]);
      setLinkTitle("");
      setLinkUrl("");
    }
  };
  
  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };
  
  const handleGetAISuggestion = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    const stepsToReproduce = form.getValues("stepsToReproduce");
    
    if (!title || !description || !stepsToReproduce) {
      return;
    }
    
    try {
      const result = await aiSuggestion.mutateAsync({
        title,
        description,
        stepsToReproduce,
      });
      
      form.setValue("solution", result.suggestion);
      setShowAISuggestion(true);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
    }
  };
  
  const isPending = createIssue.isPending || updateIssue.isPending;
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                <div className="flex justify-between items-center">
                  <FormLabel>Solution</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetAISuggestion}
                    disabled={aiSuggestion.isPending || !form.getValues("title") || !form.getValues("description")}
                    className="h-7 gap-1"
                  >
                    {aiSuggestion.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>AI Suggestion</span>
                  </Button>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="How you resolved the issue"
                    rows={3}
                    {...field}
                    disabled={isPending}
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
                        disabled={isPending}
                      >
                        {field.value ? (
                          formatDate(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Tags</FormLabel>
            <div className="flex items-center">
              <Input 
                type="text" 
                placeholder="Add a tag" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                disabled={isPending}
                className="flex-grow rounded-r-none"
              />
              <Button 
                type="button"
                variant="secondary"
                onClick={addTag}
                disabled={isPending || !tagInput}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={cn(
                    "px-2 py-1 rounded-full text-xs flex items-center",
                    getTagColorByName(tag).bg,
                    getTagColorByName(tag).text
                  )}
                >
                  {tag}
                  <button 
                    type="button"
                    className="ml-1 hover:text-blue-800"
                    onClick={() => removeTag(tag)}
                    disabled={isPending}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <FormLabel>Links</FormLabel>
            <div className="space-y-2">
              <Input 
                type="text" 
                placeholder="Link title"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                disabled={isPending}
              />
              <div className="flex items-center">
                <Input 
                  type="url" 
                  placeholder="https://example.com/resource"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && linkTitle && linkUrl) {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                  disabled={isPending}
                  className="flex-grow rounded-r-none"
                />
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={addLink}
                  disabled={isPending || !linkTitle || !linkUrl}
                  className="rounded-l-none"
                >
                  Add
                </Button>
              </div>
            </div>
            
            {links.length > 0 && (
              <div className="mt-2 space-y-1">
                {links.map((link, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-gray-50 dark:bg-dark-300 p-2 rounded-md"
                  >
                    <div className="truncate">
                      <span className="font-medium text-sm">{link.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                        {link.url}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                      disabled={isPending}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-dark-200">
            <Button 
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-md shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {defaultValues?.id ? "Updating..." : "Creating..."}
                </>
              ) : (
                defaultValues?.id ? "Update Issue" : "Create Issue"
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      <Dialog open={showAISuggestion} onOpenChange={setShowAISuggestion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Solution Suggestion</DialogTitle>
            <DialogDescription>
              The AI has analyzed your issue and provided a suggested solution.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium">Suggestion:</h3>
              <p className="mt-1 text-sm">{aiSuggestion.data?.suggestion}</p>
            </div>
            
            {aiSuggestion.data?.explanation && (
              <div>
                <h3 className="text-sm font-medium">Explanation:</h3>
                <p className="mt-1 text-sm">{aiSuggestion.data.explanation}</p>
              </div>
            )}
            
            {aiSuggestion.data?.resources && aiSuggestion.data.resources.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Resources:</h3>
                <ul className="mt-1 text-sm space-y-1">
                  {aiSuggestion.data.resources.map((resource, index) => (
                    <li key={index} className="text-primary">
                      <a 
                        href={resource.startsWith('http') ? resource : `https://${resource}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {resource}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="default" onClick={() => setShowAISuggestion(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
