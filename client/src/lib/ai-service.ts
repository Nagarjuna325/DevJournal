import { apiRequest } from "./queryClient";

/**
 * Generate basic suggestions for an issue description
 * 
 * @param description The issue description to analyze
 * @returns A promise that resolves to an array of suggestion strings
 */
export async function requestAiSuggestions(description: string): Promise<string[]> {
  // Return static suggestions instead of using AI
  const staticSuggestions = [
    "Try clearing your browser cache and restarting your development server",
    "Check your console logs for any error messages",
    "Verify if your dependencies are up to date",
    "Make sure all your imports are correctly specified",
    "Look for typos or syntax errors in your code"
  ];
  
  return staticSuggestions;
}
