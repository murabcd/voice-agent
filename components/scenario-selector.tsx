import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentConfig } from "@/lib/types";

// Define type for allAgentSets explicitly (matching Header)
// This could also be imported from a shared types file if preferred
type AllAgentConfigsType = { [key: string]: AgentConfig[] };

interface ScenarioSelectorProps {
  agentSetKey: string;
  handleAgentSetChange: (value: string) => void;
  allAgentSets: AllAgentConfigsType;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  agentSetKey,
  handleAgentSetChange,
  allAgentSets,
}) => {
  return (
    <div className="relative inline-block w-full">
      <Select value={agentSetKey} onValueChange={handleAgentSetChange}>
        <SelectTrigger className="w-full font-normal">
          <SelectValue placeholder="Select scenario" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(allAgentSets).map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScenarioSelector;
