import { AISuggestion } from "@shared/schema";

// Static suggestions instead of using OpenAI
export async function getSuggestionForIssue(
  title: string,
  description: string,
  stepsToReproduce: string
): Promise<AISuggestion> {
  // Generate a predictable suggestion based on the issue title
  const commonSuggestions = [
    {
      suggestion: "Check for syntax errors or typos in your code",
      explanation: "Many bugs are caused by simple syntax errors that can be hard to spot",
      resources: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference", "https://www.w3schools.com/js/js_mistakes.asp"]
    },
    {
      suggestion: "Try clearing cache and restarting your development server",
      explanation: "Cached files can sometimes prevent new changes from being applied correctly",
      resources: ["https://stackoverflow.com/questions/14968690/how-to-clear-the-cache-when-restarting-node-js-server"]
    },
    {
      suggestion: "Check your browser console for error messages",
      explanation: "The browser console often provides specific error messages that can help identify the problem",
      resources: ["https://developer.chrome.com/docs/devtools/console/"]
    },
    {
      suggestion: "Verify your dependencies are correctly installed and up to date",
      explanation: "Outdated or missing dependencies can cause unexpected behavior",
      resources: ["https://docs.npmjs.com/cli/v8/commands/npm-update"]
    },
    {
      suggestion: "Use debugging tools like console.log() or a debugger to trace execution flow",
      explanation: "Tracking the execution flow can help identify where the code is behaving unexpectedly",
      resources: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger"]
    }
  ];
  
  // Simple hash function to select a suggestion based on the title
  const titleHash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % commonSuggestions.length;
  
  return commonSuggestions[titleHash];
}

export async function summarizeIssue(issue: string): Promise<string> {
  // Extract first 100 characters and add ellipsis if needed
  const summary = issue.length > 100 
    ? issue.substring(0, 97) + '...' 
    : issue;
  
  return `Summary: ${summary}`;
}
