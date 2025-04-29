import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { IssueModal } from "@/components/issue/issue-modal";

interface AppLayoutProps {
  children: React.ReactNode;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onSearch?: (query: string) => void;
}

export function AppLayout({ children, selectedDate, onDateSelect, onSearch }: AppLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="h-screen flex flex-col">
      <Header onSearch={onSearch} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onCreateIssue={() => setIsModalOpen(true)}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-400">
          {children}
        </main>
      </div>
      
      <IssueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultDate={selectedDate}
      />
    </div>
  );
}
