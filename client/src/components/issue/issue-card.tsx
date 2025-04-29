import { IssueWithDetails } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, getTagColorByName, cn } from "@/lib/utils";
import { useDeleteIssue } from "@/hooks/use-issues";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface IssueCardProps {
  issue: IssueWithDetails;
  isCompact?: boolean;
  onEdit?: (issue: IssueWithDetails) => void;
  onClick?: (issue: IssueWithDetails) => void;
}

export function IssueCard({ issue, isCompact = false, onEdit, onClick }: IssueCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const deleteIssueMutation = useDeleteIssue();
  
  const handleDelete = async () => {
    await deleteIssueMutation.mutateAsync(issue.id);
    setShowDeleteAlert(false);
  };
  
  if (isCompact) {
    return (
      <Card className="bg-white dark:bg-dark-300 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-md font-medium">{issue.title}</h3>
              {issue.tags && issue.tags.length > 0 && (
                <span 
                  className={cn(
                    "ml-2 text-xs px-2 py-0.5 rounded-full",
                    getTagColorByName(issue.tags[0].name).bg,
                    getTagColorByName(issue.tags[0].name).text
                  )}
                >
                  {issue.tags[0].name}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(issue.date, 'MMM d')}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {issue.description}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="bg-white dark:bg-dark-300 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center flex-wrap gap-1">
                <h3 className="text-lg font-semibold">{issue.title}</h3>
                {issue.tags.map((tag) => (
                  <span 
                    key={tag.id}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      getTagColorByName(tag.name).bg,
                      getTagColorByName(tag.name).text
                    )}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
            </div>
            <div className="flex space-x-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(issue);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteAlert(true);
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">Steps to Reproduce</h4>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {issue.stepsToReproduce}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">Solution</h4>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {issue.solution}
              </p>
            </div>
          </div>
          
          {issue.links.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">Links</h4>
              <div className="space-y-1">
                {issue.links.map((link) => (
                  <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatDate(issue.date, 'h:mm a')}</span>
            </div>
            <div>
              {onClick && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => onClick(issue)}
                  className="text-xs text-primary hover:underline h-auto p-0"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this issue entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteIssueMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
