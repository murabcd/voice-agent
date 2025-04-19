export const MODEL_REALTIME = "RealtimeModel";
export const MODEL_REALTIME_MINI = "RealtimeMiniModel";
export const MODEL_CHAT = "ChatModel";
export const MODEL_CHAT_MINI = "ChatMiniModel";
export const MODEL_TRANSCRIBE = "TranscriptionModel";
export const MODEL_TRANSCRIBE_MINI = "TranscriptionMiniModel";

const modelMappings: Record<string, string> = {
  [MODEL_REALTIME]: "gpt-4o-mini-realtime-preview",
  [MODEL_REALTIME_MINI]: "gpt-4o-realtime-preview",
  [MODEL_CHAT]: "gpt-4.1",
  [MODEL_CHAT_MINI]: "gpt-4.1-mini",
  [MODEL_TRANSCRIBE]: "gpt-4o-transcribe",
  [MODEL_TRANSCRIBE_MINI]: "gpt-4o-mini-transcribe",
};

export function getModelId(id: string): string {
  const modelId = modelMappings[id];
  if (!modelId) {
    throw new Error(`Model id "${id}" not found in mappings.`);
  }
  return modelId;
}

interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

export const modelInfoList: Array<ModelInfo> = [
  {
    id: MODEL_REALTIME,
    name: "GPT-4o realtime preview",
    description: "Higher quality conversational model with higher latency",
  },
  {
    id: MODEL_REALTIME_MINI,
    name: "GPT-4o mini realtime preview",
    description: "Optimized for low-latency conversational responses",
  },
  {
    id: MODEL_CHAT,
    name: "GPT-4.1",
    description: "General purpose GPT-4.1 model",
  },
  {
    id: MODEL_CHAT_MINI,
    name: "GPT-4.1 mini",
    description: "Smaller variant of GPT-4.1",
  },
  {
    id: MODEL_TRANSCRIBE,
    name: "GPT-4o transcribe",
    description: "Optimized for speech-to-text transcription",
  },
  {
    id: MODEL_TRANSCRIBE_MINI,
    name: "GPT-4o mini transcribe",
    description: "Optimized for low-latency speech-to-text transcription",
  },
];
