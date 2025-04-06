"use-client";

import React, { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { TranscriptItem, SessionStatus } from "@/lib/types";
import { useTranscript } from "@/app/contexts/transcript-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Copy } from "lucide-react";

export interface TranscriptProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
}

function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  sessionStatus,
  onToggleConnection,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);
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

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem && (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  useEffect(() => {
    if (canSend && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSend]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background min-h-0 rounded-xl">
      <div className="relative flex-1 min-h-0">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleCopyTranscript}
          className={`absolute top-3 right-2 mr-1 z-10`}
        >
          <Copy className="w-4 h-4" />
        </Button>

        <div
          ref={transcriptRef}
          className="overflow-auto p-4 flex flex-col gap-y-4 h-full rounded-xl bg-background"
        >
          {transcriptItems.map((item) => {
            const {
              itemId,
              type,
              role,
              data,
              expanded,
              timestamp,
              title = "",
              isHidden,
            } = item;

            if (isHidden) {
              return null;
            }

            if (type === "MESSAGE") {
              const isUser = role === "user";
              const baseContainer = "flex justify-end flex-col";
              const containerClasses = `${baseContainer} ${
                isUser ? "items-end" : "items-start"
              }`;
              const bubbleBase = `max-w-lg p-3 rounded-xl ${
                isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`;
              const isBracketedMessage = title.startsWith("[") && title.endsWith("]");
              const messageStyle = isBracketedMessage
                ? "italic text-muted-foreground"
                : "";
              const displayTitle = isBracketedMessage ? title.slice(1, -1) : title;

              return (
                <div key={itemId} className={containerClasses}>
                  <div className={bubbleBase}>
                    <div
                      className={`text-xs ${
                        isUser ? "text-primary-foreground/60" : "text-muted-foreground"
                      } font-mono`}
                    >
                      {timestamp}
                    </div>
                    <div className={`whitespace-pre-wrap ${messageStyle}`}>
                      <Markdown>{displayTitle}</Markdown>
                    </div>
                  </div>
                </div>
              );
            } else if (type === "BREADCRUMB") {
              return (
                <div
                  key={itemId}
                  className="flex flex-col justify-start items-start text-muted-foreground text-sm"
                >
                  <span className="text-xs font-mono">{timestamp}</span>
                  <div
                    className={`whitespace-pre-wrap flex items-center font-mono text-sm text-foreground ${
                      data ? "cursor-pointer" : ""
                    }`}
                    onClick={() => data && toggleTranscriptItemExpand(itemId)}
                  >
                    {data && (
                      <span
                        className={`text-muted-foreground mr-1 transform transition-transform duration-200 select-none font-mono ${
                          expanded ? "rotate-90" : "rotate-0"
                        }`}
                      >
                        ▶
                      </span>
                    )}
                    {title}
                  </div>
                  {expanded && data && (
                    <div className="text-foreground text-left">
                      <pre className="border-l-2 ml-1 border-border whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={itemId}
                  className="flex justify-center text-muted-foreground text-sm italic font-mono"
                >
                  Unknown item type: {type}{" "}
                  <span className="ml-2 text-xs">{timestamp}</span>
                </div>
              );
            }
          })}
        </div>
      </div>

      <div className="p-4 flex items-center justify-between gap-x-2 flex-shrink-0 border-t border-border">
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
    </div>
  );
}

export default Transcript;
