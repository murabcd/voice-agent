import { AgentConfig } from "@/lib/types";
import { webSearchTool } from "@/lib/utils";
import { searchWebPrompt } from "@/lib/ai/prompts";
import { getModelId, MODEL_CHAT_MINI } from "@/lib/ai/models";

const search: AgentConfig = {
  name: "search",
  publicDescription: "Agent that can perform web searches.",
  instructions: searchWebPrompt,
  tools: [webSearchTool()],
  toolLogic: {
    webSearch: async ({ query }: { query: string }) => {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, model: getModelId(MODEL_CHAT_MINI) }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          return {
            error: `API call failed with status ${response.status}: ${errorData}`,
          };
        }

        const result = await response.json();
        return result;
      } catch (error: unknown) {
        return { error: `Failed to execute web search: ${error}` };
      }
    },
  },
};

export default search;
