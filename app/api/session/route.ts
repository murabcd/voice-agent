import { NextResponse } from "next/server";
import { env } from "@/env.mjs";
import { getModelId, MODEL_REALTIME_MINI } from "@/lib/ai/models";

export async function GET() {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getModelId(MODEL_REALTIME_MINI),
      }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
