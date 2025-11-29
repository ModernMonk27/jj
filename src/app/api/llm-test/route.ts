import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function GET() {
  try {
    const model =
      process.env.CLAUDE_MODEL ||
      process.env.CLAUDE_ANALYTICS_MODEL ||
      "claude-sonnet-4-5-20250929";

    const prompt =
      "You are a simple health check. Reply with a short confirmation: 'LLM OK'.";

    const msg = await anthropic.messages.create({
      model,
      max_tokens: 20,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content[0];
    const text = textBlock.type === "text" ? textBlock.text.trim() : "";

    return NextResponse.json({ ok: true, text: text || "LLM OK" });
  } catch (error: any) {
    console.error("LLM test error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "failed" },
      { status: 500 }
    );
  }
}
