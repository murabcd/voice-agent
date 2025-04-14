import { AgentConfig } from "@/lib/types";
import { greeterPrompt } from "@/lib/ai/prompts";

const greeter: AgentConfig = {
  name: "greeter",
  publicDescription: "Agent that greets the user.",
  instructions: greeterPrompt,
  tools: [],
  toolLogic: {},
};

export default greeter;
