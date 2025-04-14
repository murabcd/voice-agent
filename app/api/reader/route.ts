import { NextResponse } from "next/server";

const JINA_READER_URL = "https://r.jina.ai/";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("targetUrl");
    if (!targetUrl) {
      return NextResponse.json(
        { error: "No target URL provided. Please specify a targetUrl query parameter." },
        { status: 400 }
      );
    }
    const response = await fetch(JINA_READER_URL + targetUrl, {
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        Accept: "application/json",
        "X-Return-Format": "markdown",
        "X-Engine": "direct",
      },
    });

    if (!response.ok) {
      console.error(`Jina API Error (${response.status})`);
      return NextResponse.json(
        { error: `Jina API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const content = await response.text();
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error in /reader:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
