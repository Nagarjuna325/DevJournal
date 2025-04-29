/**
 * Uses predefined solutions to suggest fixes for bugs
 * 
 * @param description The bug description
 * @param stepsToReproduce Optional steps to reproduce the bug
 * @returns A string containing the suggested solution
 */
export async function suggestSolution(
  description: string,
  stepsToReproduce?: string
): Promise<string> {
  // Extract keywords from the description to match against common solutions
  const keywords = description.toLowerCase().split(/\s+/);
  
  // Define common solutions based on keywords
  const solutions = [
    {
      keywords: ["undefined", "null", "reference", "not defined"],
      solution: "Check variable initialization and scope. Make sure all variables are properly defined before use and that you're not trying to access properties of null or undefined objects."
    },
    {
      keywords: ["syntax", "unexpected", "token"],
      solution: "Look for syntax errors such as missing brackets, semicolons, or quotation marks. Check for typos in variable or function names."
    },
    {
      keywords: ["async", "promise", "then", "await"],
      solution: "Ensure your promises are being properly handled with .then() or await. Check that async functions are properly awaited and that you're not mixing promise chaining with async/await syntax."
    },
    {
      keywords: ["render", "component", "react", "props", "state"],
      solution: "Verify your component lifecycle and state management. Check that you're not updating state during render and that your dependencies array in useEffect is correct."
    },
    {
      keywords: ["api", "fetch", "request", "response", "server"],
      solution: "Check your API endpoint URL and request format. Ensure you're handling responses correctly and that you have proper error handling for network failures."
    }
  ];
  
  // Find the solution with the most keyword matches
  let bestMatch = {
    solution: "Try debugging step by step and isolating the problematic code. Add console.log statements to track the flow and values of variables throughout your code execution.",
    matches: 0
  };
  
  for (const solution of solutions) {
    const matches = solution.keywords.filter(keyword => 
      keywords.some(word => word.includes(keyword))
    ).length;
    
    if (matches > bestMatch.matches) {
      bestMatch = {
        solution: solution.solution,
        matches
      };
    }
  }
  
  return bestMatch.solution;
}

/**
 * Analyzes and summarizes a bug description
 * 
 * @param description The bug description to analyze
 * @returns A structured analysis as a JSON string
 */
export async function analyzeBugDescription(description: string): Promise<string> {
  // Extract a simple summary from the description
  const summary = description.length > 150 
    ? description.substring(0, 147) + '...' 
    : description;
  
  // Extract potential technical terms
  const technicalTerms = extractTechnicalTerms(description);
  
  // Create a simple structured response
  const analysis = {
    summary: summary,
    potentialCauses: [
      "Possible input validation issue",
      "Potential race condition",
      "Possible resource management problem"
    ],
    technicalDetails: technicalTerms.length > 0 ? technicalTerms : ["No specific technical details identified"]
  };
  
  return JSON.stringify(analysis, null, 2);
}

// Helper function to extract common technical terms
function extractTechnicalTerms(text: string): string[] {
  const techTerms = [
    "API", "HTTP", "REST", "GraphQL", "JWT", "OAuth", 
    "React", "Vue", "Angular", "DOM", "CSS", "HTML",
    "Node.js", "Express", "MongoDB", "SQL", "PostgreSQL",
    "Docker", "Kubernetes", "CI/CD", "Git",
    "async", "await", "Promise", "callback", "thread",
    "null pointer", "memory leak", "stack overflow", "race condition"
  ];
  
  return techTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
}
