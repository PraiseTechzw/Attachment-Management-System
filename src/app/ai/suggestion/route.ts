import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zai } from '@/lib/zai';

const suggestionRequestSchema = z.object({
  prompt: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = suggestionRequestSchema.parse(body);

    const stream = await zai.skills.chat({
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    } 
    if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined (reading 'chat')")) {
        return NextResponse.json(
            { error: 'AI service is not properly initialized. Please ensure your API key is correct in .z-ai-config.' },
            { status: 500 }
        );
    }
    return NextResponse.json({ error: 'Failed to get AI suggestion' }, { status: 500 });
  }
}
