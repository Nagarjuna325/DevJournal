import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [date] = useState(new Date());

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Developer Bug Journal</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome, {user?.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </header>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome to the Developer Bug Journal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This application helps you track and document your coding issues, including steps to reproduce, 
              solutions you've found, and resources used.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Today is {date.toLocaleDateString()} - Start adding your first bug report by clicking the button below.
            </p>
            <div className="mt-4">
              <Button className="mr-2">Add New Bug Report</Button>
              <Button variant="outline">View Past Reports</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Click "Add New Bug Report" to document a new issue</li>
              <li>Fill in details like title, description, and steps to reproduce</li>
              <li>Add tags to categorize your issues</li>
              <li>Use the AI suggestion feature to get possible solutions</li>
              <li>Save your report and access it later when needed</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
