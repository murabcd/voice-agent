import React, { Suspense } from "react";

import VoiceAgent from "@/components/voice-agent";

import { TranscriptProvider } from "@/app/contexts/transcript-context";
import { EventProvider } from "@/app/contexts/event-context";

export default function Page() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <VoiceAgent />
        </Suspense>
      </EventProvider>
    </TranscriptProvider>
  );
}
