import { NextResponse } from 'next/server'
import { getZaiInstance } from '@/lib/zai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const zai = await getZaiInstance()

    const stream = await zai.skills.LLM.chat({
      model: 'claude-3-opus-20240229',
      systemPrompt: `You are an expert in creating daily activity logs for students in industrial attachment programs. Your goal is to help users draft comprehensive and professional log entries based on a simple prompt. Format the output in Markdown with the following sections:

**Activities Performed:**
- [Detailed list of activities]

**Skills & Knowledge Gained:**
- [List of skills and knowledge areas]

**Challenges Encountered:**
- [Description of challenges]

**Solutions & Approaches:**
- [How challenges were addressed]
`,
      prompt: `Based on the following activity, generate a detailed log entry: ${prompt}`,
      output: 'text',
      maxTokens: 500,
    })

    let suggestion = ''
    for await (const chunk of stream) {
      suggestion += chunk
    }

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json({ error: 'Failed to generate AI suggestion' }, { status: 500 })
  }
}
