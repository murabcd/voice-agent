import React, { useRef } from "react";

import { SessionStatus } from "@/lib/types";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface MessagesProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
}

function Messages({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  sessionStatus,
  onToggleConnection,
}: MessagesProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "p-2 w-36 h-10";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      return `bg-destructive hover:bg-destructive/90 text-destructive-foreground ${cursorClass} ${baseClasses}`;
    }
    return `bg-primary hover:bg-primary/90 text-primary-foreground ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="p-4 flex items-center justify-between gap-x-2 flex-shrink-0 bg-background">
      <Button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </Button>
      <div className="flex-1 flex items-center gap-x-2">
        <Input
          ref={inputRef}
          type="text"
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSend) {
              onSendMessage();
            }
          }}
          className="flex-1 px-4 py-2 focus:outline-none"
          placeholder="Follow up..."
        />
        <Button
          size="icon"
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className="rounded-full px-2 py-2 disabled:opacity-50"
        >
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
}

export default Messages;
