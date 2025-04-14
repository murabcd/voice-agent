"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/event-context";
import { LoggedEvent } from "@/lib/types";

export interface EventsProps {
  isExpanded: boolean;
}

function Events({ isExpanded }: EventsProps) {
  const [prevEventLogs, setPrevEventLogs] = useState<LoggedEvent[]>([]);
  const eventLogsContainerRef = useRef<HTMLDivElement | null>(null);

  const { loggedEvents, toggleExpand } = useEvent();

  const getDirectionArrow = (direction: string) => {
    if (direction === "client") return { symbol: "▲", color: "var(--chart-1)" };
    if (direction === "server") return { symbol: "▼", color: "var(--chart-2)" };
    return { symbol: "•", color: "var(--muted-foreground)" };
  };

  useEffect(() => {
    const hasNewEvent = loggedEvents.length > prevEventLogs.length;

    if (isExpanded && hasNewEvent && eventLogsContainerRef.current) {
      eventLogsContainerRef.current.scrollTop =
        eventLogsContainerRef.current.scrollHeight;
    }

    setPrevEventLogs(loggedEvents);
  }, [loggedEvents, isExpanded, prevEventLogs]);

  return (
    <div
      className={
        (isExpanded ? "w-1/3 overflow-auto" : "w-0 overflow-hidden opacity-0") +
        " transition-all rounded-xl duration-200 ease-in-out flex flex-col bg-muted text-foreground"
      }
      ref={eventLogsContainerRef}
    >
      {isExpanded && (
        <div>
          <div>
            {loggedEvents.map((log) => {
              const arrowInfo = getDirectionArrow(log.direction);
              const isError =
                log.eventName.toLowerCase().includes("error") ||
                log.eventData?.response?.status_details?.error != null;

              return (
                <div key={log.id} className="border-t border-border py-2 px-6 font-mono">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center flex-1">
                      <span
                        style={{ color: arrowInfo.color, fontSize: "0.8em" }}
                        className="ml-1 mr-2"
                      >
                        {arrowInfo.symbol}
                      </span>
                      <span
                        className={
                          "flex-1 text-sm " +
                          (isError ? "text-destructive" : "text-foreground")
                        }
                      >
                        {log.eventName}
                      </span>
                    </div>
                    <div className="text-muted-foreground ml-1 text-xs whitespace-nowrap">
                      {log.timestamp}
                    </div>
                  </div>

                  {log.expanded && log.eventData && (
                    <div className="text-foreground text-left">
                      <pre className="border-l-2 ml-1 border-border whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                        {JSON.stringify(log.eventData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
