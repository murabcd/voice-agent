import { AgentConfig } from "@/lib/types";
import { operatorPrompt } from "@/lib/ai/prompts";

const operator: AgentConfig = {
  name: "operator",
  publicDescription:
    "Simulate human agent that can provide more advanced assistance to the user. Should be routed to if the user is upset, frustrated, or explicitly asks for a human agent.",
  instructions: operatorPrompt,
  tools: [],
  toolLogic: {},
};

export default operator;
