import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Bot } from "lucide-react";
import { useIssues } from "@/hooks/use-issues";

interface AISuggestionProps {
  description: string;
  stepsToReproduce?: string;
  onSuggestionSelect: (suggestion: string) => void;
}

export function AISuggestion({ 
  description, 
  stepsToReproduce, 
  onSuggestionSelect 
}: AISuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { getSuggestionMutation } = useIssues();

  const generateSuggestion = async () => {
    if (!description) return;
    
    setIsGenerating(true);
    try {
      const result = await getSuggestionMutation.mutateAsync({
        description,
        stepsToReproduce
      });
      
      setSuggestion(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionSelect = () => {
    if (suggestion) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="mt-6">
      {!suggestion && !isGenerating ? (
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={generateSuggestion}
          disabled={!description}
        >
          <Bot className="h-4 w-4" />
          <span>Get AI Suggestion</span>
        </Button>
      ) : isGenerating ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating suggestion...</span>
        </div>
      ) : (
        <Card className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              AI Suggestion
            </h4>
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-300 whitespace-pre-wrap">
              {suggestion}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                onClick={handleSuggestionSelect}
              >
                Use This Solution
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
