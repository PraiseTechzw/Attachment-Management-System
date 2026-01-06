import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // In a real application, you would use a powerful LLM here.
    // For this example, we'll use a simple template-based approach.
    const suggestion = `Based on your activity of **${prompt}**, here is a draft for your log entry:

**Activities Performed:**
- Investigated and resolved a critical bug related to **${prompt}**.
- Collaborated with the team to identify the root cause.
- Deployed a hotfix to production.

**Skills & Knowledge Gained:**
- Advanced debugging techniques
- Team collaboration
- Version control (Git)

**Challenges Encountered:**
- The bug was difficult to reproduce, requiring creative problem-solving.

**Solutions & Approaches:**
- Implemented additional logging to trace the issue.
- Used browser developer tools to inspect network requests.
`

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json({ error: 'Failed to generate AI suggestion' }, { status: 500 })
  }
}
