import { AgentConfig } from "@/lib/types";
import { TriagePrompt } from "@/lib/ai/prompts";

export const triageAgentConfig: AgentConfig = {
  name: "Reception Assistant",
  publicDescription: "Initial contact and triage for clinic",
  instructions: TriagePrompt,
  tools: [],
  toolLogic: {},
  downstreamAgents: [
    { name: "primary", publicDescription: "Handles new patients" },
    { name: "secondary", publicDescription: "Handles existing patients" },
  ],
};

export default triageAgentConfig;
