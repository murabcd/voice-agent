"use-client";

import React, { useEffect, useRef, useState } from "react";

import { Copy } from "lucide-react";

import { toast } from "sonner";

import { TranscriptItem } from "@/lib/types";

import { Greeting } from "@/components/greeting";
import { Markdown } from "@/components/markdown";
import { useTranscript } from "@/components/contexts/transcript-context";
import { Button } from "@/components/ui/button";

export interface TranscriptProps {
  className?: string;
}

function Transcript({ className = "" }: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);

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
  }, [transcriptItems, prevLogs]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      toast("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy transcript:", error);
      toast.error("Failed to copy");
    }
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 rounded-xl ${className}`}>
      <div className="relative flex-1 min-h-0 rounded-xl bg-muted">
        {transcriptItems.length === 0 ? (
          <Greeting />
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyTranscript}
              className={`absolute top-3 right-2 mr-1 z-10`}
            >
              <Copy className="w-4 h-4" />
            </Button>

            <div
              ref={transcriptRef}
              className="overflow-auto p-4 flex flex-col gap-y-4 h-full text-foreground"
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
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground"
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
                            isUser
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
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
          </>
        )}
      </div>
    </div>
  );
}

export default Transcript;
