import React, { Suspense } from "react";

import VoiceAgent from "@/components/voice-agent";

import { TranscriptProvider } from "@/components/contexts/transcript-context";
import { EventProvider } from "@/components/contexts/event-context";
import Loading from "@/components/loading";

export default function Page() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <Suspense fallback={<Loading />}>
          <VoiceAgent />
        </Suspense>
      </EventProvider>
    </TranscriptProvider>
  );
}
