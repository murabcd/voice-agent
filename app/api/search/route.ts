import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { model, query } = await req.json();

    const response = await openai.responses.create({
      model,
      tools: [{ type: "web_search_preview" }],
      input: query,
    });

    console.log(response.output_text);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in /search:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
