import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { IssueWithDetails } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { Edit, Bookmark, MoreVertical, Clock, RefreshCw } from "lucide-react";
import { NewIssueForm } from "./new-issue-form";

interface IssueCardProps {
  issue: IssueWithDetails;
  onUpdateIssue: (updatedIssue: Partial<IssueWithDetails>) => void;
  onDeleteIssue: (issueId: number) => void;
}

export function IssueCard({ issue, onUpdateIssue, onDeleteIssue }: IssueCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Format date to a readable time
  const timeFormatted = format(new Date(issue.date), 'h:mm a');
  
  // Get relative time (e.g. "2 hours ago")
  const relativeTime = formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true });
  
  // Get the status badge variant and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "resolved":
        return { variant: "status.resolved" as const, label: "Resolved" };
      case "in_progress":
        return { variant: "status.inProgress" as const, label: "In Progress" };
      case "stuck":
        return { variant: "status.stuck" as const, label: "Stuck" };
      default:
        return { variant: "status.inProgress" as const, label: "In Progress" };
    }
  };
  
  const statusInfo = getStatusInfo(issue.status);
  
  // Get badge variant for a tag
  const getTagVariant = (tagName: string) => {
    const tagNameLower = tagName.toLowerCase();
    if (tagNameLower.includes('react')) return 'react';
    if (tagNameLower.includes('express')) return 'express';
    if (tagNameLower.includes('typescript') || tagNameLower.includes('ts')) return 'typescript';
    if (tagNameLower.includes('database') || tagNameLower.includes('db')) return 'database';
    if (tagNameLower.includes('critical') || tagNameLower.includes('urgent')) return 'critical';
    return 'default';
  };

  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-700">
      <CardHeader className="p-5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{issue.title}</h3>
            <div className="flex items-center mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {timeFormatted}
              </span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <RefreshCw className="mr-1 h-3 w-3" />
                {relativeTime}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {issue.tags && issue.tags.map((tag) => (
              <Badge key={tag.id} variant={getTagVariant(tag.name) as any}>
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0">
        <div className="prose dark:prose-invert prose-slate prose-sm max-w-none">
          {issue.description && (
            <p className="text-slate-600 dark:text-slate-300">
              {issue.description}
            </p>
          )}
          
          {issue.stepsToReproduce && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Steps to Reproduce</h4>
              <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 pl-2">
                {issue.stepsToReproduce.split('\n').map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          
          {issue.solution && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Solution</h4>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md text-sm font-mono">
                <pre className="whitespace-pre-wrap">{issue.solution}</pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-5 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center">
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit issue</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <NewIssueForm 
                issue={issue}
                onSubmit={(updatedIssue) => {
                  onUpdateIssue(updatedIssue);
                  setIsEditModalOpen(false);
                }}
                onCancel={() => setIsEditModalOpen(false)}
                onDelete={() => {
                  onDeleteIssue(issue.id);
                  setIsEditModalOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">Bookmark</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
