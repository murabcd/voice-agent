import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react"; // Using react-hooks testing library

import { useHandleServerEvent } from "./use-handle-server-event";
import type { AgentConfig, ServerEvent, TranscriptItem } from "@/lib/types";

// --- Import the actual hooks/contexts to be mocked ---
import * as transcriptContext from "@/components/contexts/transcript-context";
import * as eventContext from "@/components/contexts/event-context";

// --- Mock Functions (keep these defined at the top level) ---
const mockAddTranscriptBreadcrumb = vi.fn();
const mockAddTranscriptMessage = vi.fn();
const mockUpdateTranscriptMessage = vi.fn();
const mockUpdateTranscriptItemStatus = vi.fn();
const mockLogServerEvent = vi.fn();
const mockSendClientEvent = vi.fn();
const mockSetSessionStatus = vi.fn();
const mockSetSelectedAgentName = vi.fn();

// --- Apply Mocks using vi.mock ---
// Define the mock implementation *inside* the factory function
vi.mock("@/components/contexts/transcript-context", () => {
  const actual = vi.importActual<typeof transcriptContext>(
    "@/components/contexts/transcript-context"
  );
  const mockUseTranscript = vi.fn(() => ({
    transcriptItems: [] as TranscriptItem[],
    addTranscriptBreadcrumb: mockAddTranscriptBreadcrumb,
    addTranscriptMessage: mockAddTranscriptMessage,
    updateTranscriptMessage: mockUpdateTranscriptMessage,
    updateTranscriptItemStatus: mockUpdateTranscriptItemStatus,
  }));
  return {
    ...actual, // Keep other exports if any
    useTranscript: mockUseTranscript,
  };
});

vi.mock("@/components/contexts/event-context", () => {
  const actual = vi.importActual<typeof eventContext>(
    "@/components/contexts/event-context"
  );
  const mockUseEvent = vi.fn(() => ({
    logServerEvent: mockLogServerEvent,
  }));
  return {
    ...actual, // Keep other exports if any
    useEvent: mockUseEvent,
  };
});

// --- Helper function to get the dynamically created mock ---
// We need this because the mock function is now defined inside the factory
const getMockUseTranscript = async () => {
  const mod = await import("@/components/contexts/transcript-context");
  return mod.useTranscript as ReturnType<typeof vi.fn>; // Cast to mocked function type
};

const getMockUseEvent = async () => {
  const mod = await import("@/components/contexts/event-context");
  return mod.useEvent as ReturnType<typeof vi.fn>;
};

// --- Mock Agent Config (remains the same) ---
const mockToolLogicFn = vi.fn().mockResolvedValue({ success: true });
const mockAgentConfigSet: AgentConfig[] = [
  {
    name: "AgentA",
    publicDescription: "Desc A",
    instructions: "Inst A",
    tools: [],
    toolLogic: {
      testTool: mockToolLogicFn,
    },
    downstreamAgents: [{ name: "AgentB", publicDescription: "Desc B" }],
  },
  {
    name: "AgentB",
    publicDescription: "Desc B",
    instructions: "Inst B",
    tools: [],
  },
];

describe("useHandleServerEvent", () => {
  // --- Need to make beforeEach async to use await ---
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the mock implementation before each test using the helper
    const mockUseTranscript = await getMockUseTranscript();
    mockUseTranscript.mockReturnValue({
      transcriptItems: [],
      addTranscriptBreadcrumb: mockAddTranscriptBreadcrumb,
      addTranscriptMessage: mockAddTranscriptMessage,
      updateTranscriptMessage: mockUpdateTranscriptMessage,
      updateTranscriptItemStatus: mockUpdateTranscriptItemStatus,
    });
    const mockUseEvent = await getMockUseEvent();
    mockUseEvent.mockReturnValue({ logServerEvent: mockLogServerEvent });
  });

  // --- Need to make setupHook async ---
  const setupHook = async (
    initialAgentName = "AgentA",
    transcriptItems: TranscriptItem[] = []
  ) => {
    // Update the mock return value for transcriptItems for this specific test run
    const mockUseTranscript = await getMockUseTranscript();
    mockUseTranscript.mockReturnValue({
      transcriptItems: transcriptItems,
      addTranscriptBreadcrumb: mockAddTranscriptBreadcrumb,
      addTranscriptMessage: mockAddTranscriptMessage,
      updateTranscriptMessage: mockUpdateTranscriptMessage,
      updateTranscriptItemStatus: mockUpdateTranscriptItemStatus,
    });

    // renderHook needs to be inside an async function if setup depends on async calls
    const { result } = renderHook(() =>
      useHandleServerEvent({
        setSessionStatus: mockSetSessionStatus,
        selectedAgentName: initialAgentName,
        selectedAgentConfigSet: mockAgentConfigSet,
        sendClientEvent: mockSendClientEvent,
        setSelectedAgentName: mockSetSelectedAgentName,
      })
    );
    return result.current.current;
  };

  // --- Need to make tests async that use setupHook ---
  it("should log server event", async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = { type: "session.created", session: { id: "123" } };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockLogServerEvent).toHaveBeenCalledWith(event);
  });

  it('should handle "session.created"', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = { type: "session.created", session: { id: "sess_123" } };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockSetSessionStatus).toHaveBeenCalledWith("CONNECTED");
    expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
      expect.stringContaining("session.id: sess_123")
    );
  });

  it('should handle "conversation.item.created" for assistant', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = {
      type: "conversation.item.created",
      item: { id: "item_1", role: "assistant", content: [{ text: "Hello" }] },
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockAddTranscriptMessage).toHaveBeenCalledWith("item_1", "assistant", "Hello");
  });

  it('should handle "conversation.item.created" for user with no text (transcribing)', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = {
      type: "conversation.item.created",
      item: { id: "item_2", role: "user", content: [{}] }, // No text initially
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockAddTranscriptMessage).toHaveBeenCalledWith(
      "item_2",
      "user",
      "[Transcribing...]"
    );
  });

  it('should skip "conversation.item.created" if item ID already exists', async () => {
    const existingItemId = "item_exists";
    const handleServerEvent = await setupHook("AgentA", [
      {
        itemId: existingItemId,
        type: "MESSAGE",
        role: "assistant",
        expanded: false,
        timestamp: "",
        createdAtMs: 0,
        status: "DONE",
        isHidden: false,
      },
    ]);
    const event: ServerEvent = {
      type: "conversation.item.created",
      item: { id: existingItemId, role: "assistant", content: [{ text: "Duplicate" }] },
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockAddTranscriptMessage).not.toHaveBeenCalled();
  });

  it('should handle "conversation.item.input_audio_transcription.completed"', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = {
      type: "conversation.item.input_audio_transcription.completed",
      item_id: "item_3",
      transcript: "User said this.",
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockUpdateTranscriptMessage).toHaveBeenCalledWith(
      "item_3",
      "User said this.",
      false
    );
  });

  it('should handle "conversation.item.input_audio_transcription.completed" with inaudible', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = {
      type: "conversation.item.input_audio_transcription.completed",
      item_id: "item_4",
      transcript: "\n", // Should be treated as inaudible
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockUpdateTranscriptMessage).toHaveBeenCalledWith(
      "item_4",
      "[inaudible]",
      false
    );
  });

  it('should handle "response.audio_transcript.delta"', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = {
      type: "response.audio_transcript.delta",
      item_id: "item_5",
      delta: " word",
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockUpdateTranscriptMessage).toHaveBeenCalledWith("item_5", " word", true);
  });

  it('should handle "response.output_item.done"', async () => {
    const handleServerEvent = await setupHook();
    const event: ServerEvent = {
      type: "response.output_item.done",
      item: { id: "item_6" },
    };
    act(() => {
      handleServerEvent(event);
    });
    expect(mockUpdateTranscriptItemStatus).toHaveBeenCalledWith("item_6", "DONE");
  });

  it('should handle function call via "response.done" with matching toolLogic', async () => {
    const handleServerEvent = await setupHook(); // Made async
    // ... rest of test
    const args = { key: "value" };
    const event: ServerEvent = {
      type: "response.done",
      response: {
        output: [
          {
            type: "function_call",
            name: "testTool",
            call_id: "call_1",
            arguments: JSON.stringify(args),
          },
        ],
      },
    };

    await act(async () => {
      handleServerEvent(event);
    });

    expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
      "function call: testTool",
      args
    );
    // We need to get the mock again inside the test if we check calls based on specific state
    const mockUseTranscript = await getMockUseTranscript();
    const currentTranscriptItems =
      mockUseTranscript.mock.results[mockUseTranscript.mock.results.length - 1].value
        .transcriptItems;
    expect(mockToolLogicFn).toHaveBeenCalledWith(args, currentTranscriptItems);
    await vi.waitFor(() => {
      expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
        "function call result: testTool",
        { success: true }
      );
    });
    expect(mockSendClientEvent).toHaveBeenCalledWith({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: "call_1",
        output: JSON.stringify({ success: true }),
      },
    });
    expect(mockSendClientEvent).toHaveBeenCalledWith({ type: "response.create" });
  });

  it('should handle "transferAgents" function call via "response.done"', async () => {
    const handleServerEvent = await setupHook("AgentA"); // Made async
    // ... rest of test
    const args = {
      rationale_for_transfer: "Needs AgentB",
      conversation_context: "Context...",
      destination_agent: "AgentB",
    };
    const event: ServerEvent = {
      type: "response.done",
      response: {
        output: [
          {
            type: "function_call",
            name: "transferAgents",
            call_id: "call_2",
            arguments: JSON.stringify(args),
          },
        ],
      },
    };

    await act(async () => {
      handleServerEvent(event);
    });

    expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
      "function call: transferAgents",
      args
    );
    expect(mockSetSelectedAgentName).toHaveBeenCalledWith("AgentB");
    const expectedOutput = { destination_agent: "AgentB", did_transfer: true };
    expect(mockSendClientEvent).toHaveBeenCalledWith({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: "call_2",
        output: JSON.stringify(expectedOutput),
      },
    });
    expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
      "function call: transferAgents response",
      expectedOutput
    );
    expect(mockSendClientEvent).not.toHaveBeenCalledWith({ type: "response.create" });
  });

  it('should handle fallback function call via "response.done" when no toolLogic matches', async () => {
    const handleServerEvent = await setupHook(); // Made async
    // ... rest of test
    const args = { data: 123 };
    const event: ServerEvent = {
      type: "response.done",
      response: {
        output: [
          {
            type: "function_call",
            name: "unknownTool",
            call_id: "call_3",
            arguments: JSON.stringify(args),
          },
        ],
      },
    };

    await act(async () => {
      handleServerEvent(event);
    });

    expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
      "function call: unknownTool",
      args
    );
    expect(mockToolLogicFn).not.toHaveBeenCalled();
    const fallbackResult = { result: true };
    expect(mockAddTranscriptBreadcrumb).toHaveBeenCalledWith(
      "function call fallback: unknownTool",
      fallbackResult
    );
    expect(mockSendClientEvent).toHaveBeenCalledWith({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: "call_3",
        output: JSON.stringify(fallbackResult),
      },
    });
    expect(mockSendClientEvent).toHaveBeenCalledWith({ type: "response.create" });
  });
});
