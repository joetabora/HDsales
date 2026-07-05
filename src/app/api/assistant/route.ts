import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import type { ChatMessage } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body.messages as ChatMessage[];

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "You are Forge AI, a sales assistant for powersports dealerships. Help salespeople with customer follow-ups, deal strategies, inventory questions, and objection handling. Be concise and actionable.",
    };

    const provider = getAIProvider();
    const reply = await provider.chat({
      messages: [systemMessage, ...messages],
    });

    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assistant request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
