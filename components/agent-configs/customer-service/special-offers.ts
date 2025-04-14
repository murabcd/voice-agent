import { AgentConfig } from "@/lib/types";
import { specialOffersPrompt } from "@/lib/ai/prompts";

const offers: AgentConfig = {
  name: "offers",
  publicDescription:
    "Customer support agent specializing in special offers and promotions of Ural Airlines.",
  instructions: specialOffersPrompt,
  tools: [
    {
      type: "function",
      name: "fetchSpecialOffers",
      description:
        "Get up-to-date information on special offers from the Ural Airlines website to provide accurate data to the user. Use this tool to find information about discounts, promotions and special fares.",
      parameters: {
        type: "object",
        properties: {
          targetUrl: {
            type: "string",
            description:
              "The URL of the page on the Ural Airlines website from which to get information about special offers (default is 'https://www.uralairlines.ru/special_offers').",
          },
        },
        required: ["targetUrl"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    fetchSpecialOffers: async ({ targetUrl }) => {
      console.log(`[toolLogic] fetching special offers from ${targetUrl}`);
      try {
        const response = await fetch(
          `/api/reader?targetUrl=${encodeURIComponent(targetUrl)}`
        );
        if (!response.ok) {
          console.error(`Error fetching content from ${targetUrl}: ${response.status}`);
          return {
            error: `Failed to fetch content from ${targetUrl}. Status: ${response.status}`,
          };
        }
        const data = await response.json();
        return { content: data.content };
      } catch (error) {
        console.error(`Error in fetchSpecialOffers:`, error);
        return { error: `Internal error while fetching content from ${targetUrl}` };
      }
    },
  },
};

export default offers;
