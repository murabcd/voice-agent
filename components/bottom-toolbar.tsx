import React from "react";
import { SessionStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "p-2 w-36 h-full";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      // Connected -> label "Disconnect" -> red
      return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
    }
    // Disconnected or connecting -> label is either "Connect" or "Connecting" -> black
    return `bg-black hover:bg-gray-900 ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="p-4 flex flex-row items-center justify-center gap-x-8">
      <Button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </Button>

      <div className="flex flex-row items-center gap-2">
        <Checkbox
          id="audio-playback"
          checked={isAudioPlaybackEnabled}
          onCheckedChange={(checked) => setIsAudioPlaybackEnabled(Boolean(checked))}
          disabled={!isConnected}
        />
        <Label htmlFor="audio-playback" className="flex items-center cursor-pointer">
          Audio playback
        </Label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <Checkbox
          id="logs"
          checked={isEventsPaneExpanded}
          onCheckedChange={(checked) => setIsEventsPaneExpanded(Boolean(checked))}
        />
        <Label htmlFor="logs" className="flex items-center cursor-pointer">
          Logs
        </Label>
      </div>
    </div>
  );
}

export default BottomToolbar;
