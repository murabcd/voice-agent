import React from "react";

import { AgentConfig, SessionStatus } from "@/lib/types";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ScenarioSelector from "@/components/scenario-selector";
import AgentSelector from "@/components/agent-selector";

type AllAgentConfigsType = { [key: string]: AgentConfig[] };

interface RightSidebarProps {
  sessionStatus: SessionStatus;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  agentSetKey: string;
  handleAgentSetChange: (value: string) => void;
  allAgentSets: AllAgentConfigsType;
  selectedAgentName: string;
  handleSelectedAgentChange: (value: string) => void;
  selectedAgentConfigSet: AgentConfig[] | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  sessionStatus,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  agentSetKey,
  handleAgentSetChange,
  allAgentSets,
  selectedAgentName,
  handleSelectedAgentChange,
  selectedAgentConfigSet,
}) => {
  const isConnected = sessionStatus === "CONNECTED";

  return (
    <div className="w-64 px-4 flex flex-col gap-y-6">
      <h3 className="text-lg font-semibold">Settings</h3>

      {/* Scenario Selector */}
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="scenario-selector">Scenario</Label>
        <ScenarioSelector
          agentSetKey={agentSetKey}
          handleAgentSetChange={handleAgentSetChange}
          allAgentSets={allAgentSets}
        />
      </div>

      {/* Agent Selector */}
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="agent-selector">Agent</Label>
        <AgentSelector
          selectedAgentName={selectedAgentName}
          handleSelectedAgentChange={handleSelectedAgentChange}
          selectedAgentConfigSet={selectedAgentConfigSet}
        />
      </div>

      {/* Audio Playback Toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="audio-playback-sidebar"
          className="flex items-center cursor-pointer text-sm pr-2"
        >
          Audio playback
        </Label>
        <Switch
          id="audio-playback-sidebar"
          checked={isAudioPlaybackEnabled}
          onCheckedChange={setIsAudioPlaybackEnabled}
          disabled={!isConnected}
        />
      </div>

      {/* Logs Toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="logs-sidebar"
          className="flex items-center cursor-pointer text-sm pr-2"
        >
          Logs panel
        </Label>
        <Switch
          id="logs-sidebar"
          checked={isEventsPaneExpanded}
          onCheckedChange={setIsEventsPaneExpanded}
        />
      </div>
    </div>
  );
};

export default RightSidebar;
