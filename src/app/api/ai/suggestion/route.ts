import { NextResponse } from 'next/server';
import { zai } from '@/lib/zai';

// This function will read a ReadableStream to completion and return a string.
async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();
  return result;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant designed to help university students write exceptional industrial attachment logbooks. Your task is to take a student's brief, informal description of a task and transform it into a comprehensive, professional log entry that would merit a distinction.
The log entry must be detailed, well-structured, and reflective. It should demonstrate a high level of understanding, problem-solving skills, and a commitment to professional development.

Generate a log entry in Markdown format with the following sections:
- **Activity:** A professional title for the task.
- **Detailed Description:** A thorough, well-written paragraph describing what the task involved, the objectives, and the process.
- **Skills & Knowledge Applied:** A bulleted list of technical and soft skills used. Be specific.
- **Challenges & Resolutions:** A description of any problems encountered and a detailed explanation of how they were resolved. This should highlight critical thinking and problem-solving abilities.
- **Daily Reflection:** A thoughtful reflection on the day's work. This is the most critical section for a distinction. It should cover what was learned, how it connects to the student's academic knowledge, what could have been done better, and how the experience contributes to their future career goals. It should not be generic.
- **Impact:** A statement on the value or outcome of the task.

Based on the user's input, generate a complete log entry following this structure. The tone should be professional and competent.`;

    const responseStream = await zai.skills.LLM.chat({
        model: 'claude-3-opus-20240229',
        systemPrompt: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
    });

    const suggestion = await streamToString(responseStream);

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('AI suggestion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate AI suggestion', details: errorMessage }, { status: 500 });
  }
}
