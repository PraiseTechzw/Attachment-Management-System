
import { NextResponse } from "next/server";
import ZAI, { ChatMessage } from "z-ai-web-dev-sdk";

export async function GET() {
  return NextResponse.json({ message: "Hello from the Chat API!" });
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const zai = await ZAI.create();

    const messages: ChatMessage[] = [
      {
        role: "assistant",
        content: "Hi, I'm a helpful assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await zai.chat.completions.create({
      messages,
      stream: false,
      thinking: { type: "disabled" },
    });

    const reply = response.choices?.[0]?.message?.content;
    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("Chat failed:", err?.message || err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
