"use client";

import React, { useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import { v4 as uuidv4 } from "uuid";

import { useHandleServerEvent } from "@/hooks/use-handle-server-event";

import { createRealtimeConnection } from "@/lib/realtime-connection";
import { AgentConfig, SessionStatus } from "@/lib/types";
import { getModelId, MODEL_TRANSCRIBE_MINI } from "@/lib/ai/models";

import Transcript from "@/components/transcript";
import Events from "@/components/events";
import Header from "@/components/header";
import RightSidebar from "@/components/right-sidebar";
import Messages from "@/components/messages";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTranscript } from "@/components/contexts/transcript-context";
import { useEvent } from "@/components/contexts/event-context";
import { allAgentSets, defaultAgentSetKey } from "@/components/agent-configs";

function VoiceAgent() {
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } =
    useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<
    AgentConfig[] | null
  >(null);

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");

  const [isEventsPaneExpanded, setIsEventsPaneExpanded] = useState<boolean>(false);
  const [userText, setUserText] = useState<string>("");
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(true);

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      logClientEvent(eventObj, eventNameSuffix);
      dcRef.current.send(JSON.stringify(eventObj));
    } else {
      logClientEvent({ attemptedEvent: eventObj.type }, "error.data_channel_not_open");
      console.error("Failed to send message - no data channel available", eventObj);
    }
  };

  const handleServerEventRef = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName,
    selectedAgentConfigSet,
    sendClientEvent,
    setSelectedAgentName,
  });

  useEffect(() => {
    let agentConfigKey = searchParams.get("agentConfig");

    if (!agentConfigKey || !allAgentSets[agentConfigKey]) {
      agentConfigKey = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", agentConfigKey);
      window.history.replaceState({}, "", url);
    }

    const agents = allAgentSets[agentConfigKey];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentConfigSet(agents);
    if (!selectedAgentName) {
      setSelectedAgentName(agentKeyToUse);
    }
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === "true");
    }
  }, [searchParams, selectedAgentName]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && selectedAgentConfigSet && selectedAgentName) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(`Agent: ${selectedAgentName}`, currentAgent);
      updateSession(true);
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      console.log(`updatingSession, sessionStatus=${sessionStatus}`);
      updateSession();
    }
  }, []);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) {
        return;
      }

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
      }
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;

      const { pc, dc } = await createRealtimeConnection(EPHEMERAL_KEY, audioElementRef);
      pcRef.current = pc;
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        logClientEvent({}, "data_channel.open");
      });
      dc.addEventListener("close", () => {
        logClientEvent({}, "data_channel.close");
      });
      dc.addEventListener("error", (err: any) => {
        logClientEvent({ error: err }, "data_channel.error");
      });
      dc.addEventListener("message", (e: MessageEvent) => {
        handleServerEventRef.current(JSON.parse(e.data));
      });

      setDataChannel(dc);
    } catch (err) {
      console.error("Error connecting to realtime:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromRealtime = () => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      pcRef.current.close();
      pcRef.current = null;
    }
    setDataChannel(null);
    setSessionStatus("DISCONNECTED");

    logClientEvent({}, "disconnected");
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          id,
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      },
      "(simulated user text message)"
    );
    sendClientEvent(
      { type: "response.create" },
      "(trigger response after simulated user text message)"
    );
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    sendClientEvent(
      { type: "input_audio_buffer.clear" },
      "clear audio buffer on session update"
    );

    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );

    const turnDetection = {
      type: "server_vad",
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
      create_response: true,
    };

    const instructions = currentAgent?.instructions || "";
    const tools = currentAgent?.tools || [];

    const sessionUpdateEvent = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions,
        voice: "shimmer",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: getModelId(MODEL_TRANSCRIBE_MINI) },
        turn_detection: turnDetection,
        tools,
      },
    };

    sendClientEvent(sessionUpdateEvent);

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
  };

  const cancelAssistantSpeech = async () => {
    const mostRecentAssistantMessage = [...transcriptItems]
      .reverse()
      .find((item) => item.role === "assistant");

    if (!mostRecentAssistantMessage) {
      console.warn("can't cancel, no recent assistant message found");
      return;
    }
    if (mostRecentAssistantMessage.status === "DONE") {
      console.log("No truncation needed, message is DONE");
      return;
    }

    sendClientEvent({
      type: "conversation.item.truncate",
      item_id: mostRecentAssistantMessage?.itemId,
      content_index: 0,
      audio_end_ms: Date.now() - mostRecentAssistantMessage.createdAtMs,
    });
    sendClientEvent({ type: "response.cancel" }, "(cancel due to user interruption)");
  };

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    cancelAssistantSpeech();

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: userText.trim() }],
        },
      },
      "(send user text message)"
    );
    setUserText("");

    sendClientEvent({ type: "response.create" }, "trigger response");
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  const handleAgentSetChange = (newAgentSetKey: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("agentConfig", newAgentSetKey);
    window.history.pushState({}, "", url);

    const agents = allAgentSets[newAgentSetKey];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentConfigSet(agents);
    setSelectedAgentName(agentKeyToUse);
  };

  const handleSelectedAgentChange = (newAgentName: string) => {
    setSelectedAgentName(newAgentName);
  };

  useEffect(() => {
    const storedAudioPlaybackEnabled = localStorage.getItem("audioPlaybackEnabled");
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  useEffect(() => {
    localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString());
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  const agentSetKey = selectedAgentConfigSet
    ? Object.keys(allAgentSets).find(
        (key) => allAgentSets[key] === selectedAgentConfigSet
      )
    : searchParams.get("agentConfig") || defaultAgentSetKey;

  return (
    <div className="flex flex-col h-screen relative">
      <Header setIsSheetOpen={setIsSheetOpen} />

      <div className="flex flex-1 px-2 pb-2 overflow-hidden relative">
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex flex-1 min-h-0">
            <Transcript className="flex-1" />
            <Events isExpanded={isEventsPaneExpanded} />
          </div>

          <Messages
            userText={userText}
            setUserText={setUserText}
            onSendMessage={handleSendTextMessage}
            canSend={
              sessionStatus === "CONNECTED" && dcRef.current?.readyState === "open"
            }
            sessionStatus={sessionStatus}
            onToggleConnection={onToggleConnection}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-[280px] sm:w-[320px] p-0 pt-4">
              <RightSidebar
                sessionStatus={sessionStatus}
                isAudioPlaybackEnabled={isAudioPlaybackEnabled}
                setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
                isEventsPaneExpanded={isEventsPaneExpanded}
                setIsEventsPaneExpanded={setIsEventsPaneExpanded}
                agentSetKey={agentSetKey || defaultAgentSetKey}
                handleAgentSetChange={handleAgentSetChange}
                allAgentSets={allAgentSets}
                selectedAgentName={selectedAgentName}
                handleSelectedAgentChange={handleSelectedAgentChange}
                selectedAgentConfigSet={selectedAgentConfigSet}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <RightSidebar
            sessionStatus={sessionStatus}
            isAudioPlaybackEnabled={isAudioPlaybackEnabled}
            setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
            isEventsPaneExpanded={isEventsPaneExpanded}
            setIsEventsPaneExpanded={setIsEventsPaneExpanded}
            agentSetKey={agentSetKey || defaultAgentSetKey}
            handleAgentSetChange={handleAgentSetChange}
            allAgentSets={allAgentSets}
            selectedAgentName={selectedAgentName}
            handleSelectedAgentChange={handleSelectedAgentChange}
            selectedAgentConfigSet={selectedAgentConfigSet}
          />
        </div>
      </div>
    </div>
  );
}

export default VoiceAgent;
