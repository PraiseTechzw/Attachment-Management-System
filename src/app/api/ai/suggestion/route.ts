import { NextResponse } from 'next/server';
import { createZaiInstance } from '@/lib/zai';
import { z } from 'zod';

const suggestionRequestSchema = z.object({
  prompt: z.string(),
});

async function getZaiInstance() {
  try {
    return await createZaiInstance();
  } catch (error) {
    console.error('AI suggestion error: Failed to create Zai instance', error);
    return null;
  }
}

export async function POST(req: Request) {
  const zai = await getZaiInstance();
  if (!zai) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please check your .z-ai-config file.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { prompt } = suggestionRequestSchema.parse(body);

    if (!zai.skills || typeof zai.skills.chat !== 'function') {
      console.error('AI suggestion error: zai.skills.chat is not a function or zai.skills is undefined');
      return NextResponse.json(
        { error: 'AI skills chat service is not available.' },
        { status: 500 }
      );
    }

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
    // Check for the specific TypeError and return a more informative message
    if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined (reading 'chat')")) {
        return NextResponse.json(
            { error: 'AI service is not properly initialized. Please ensure your API key is correct in .z-ai-config.' },
            { status: 500 }
        );
    }
    return NextResponse.json({ error: 'Failed to get AI suggestion' }, { status: 500 });
  }
}
