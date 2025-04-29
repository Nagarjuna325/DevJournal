import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IssueForm } from "@/components/issue/issue-form";
import { IssueWithDetails } from "@shared/schema";

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue?: IssueWithDetails;
  defaultDate?: Date;
}

export function IssueModal({ isOpen, onClose, issue, defaultDate }: IssueModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issue ? "Edit Issue" : "Create New Issue"}</DialogTitle>
        </DialogHeader>
        
        <IssueForm 
          defaultValues={issue} 
          onSuccess={onClose}
          defaultDate={defaultDate}
        />
      </DialogContent>
    </Dialog>
  );
}
