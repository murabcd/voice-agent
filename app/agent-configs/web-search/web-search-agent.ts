import { AgentConfig, Tool } from "@/lib/types";

const webSearchTool: Tool = {
  type: "function",
  name: "webSearch",
  description: "Performs a web search based on the user query.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query provided by the user.",
      },
    },
    required: ["query"],
  },
};

const webSearchAgent: AgentConfig = {
  name: "webSearchAgent",
  publicDescription: "Agent that can perform web searches.",
  instructions:
    "Use the web search tool to find information online based on the user's request. Ask the user for their query first.",
  tools: [webSearchTool],
  toolLogic: {
    webSearch: async ({ query }: { query: string }) => {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, model: "gpt-4o" }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          return {
            error: `API call failed with status ${response.status}: ${errorData}`,
          };
        }

        const result = await response.json();
        return result;
      } catch (error: any) {
        return { error: `Failed to execute web search: ${error.message}` };
      }
    },
  },
};

export default [webSearchAgent];
