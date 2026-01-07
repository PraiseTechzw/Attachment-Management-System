import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { zai } from '@/lib/zai'
import { getAuthFromRequest, findUserById } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(auth.userId)
    if (!user || !user.studentId) {
      return NextResponse.json({ error: "User not found or not linked to a student profile" }, { status: 404 });
    }

    const { month, year } = await req.json()

    if (!month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const logs = await prisma.log.findMany({
      where: {
        studentId: user.studentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (logs.length === 0) {
      return NextResponse.json({ error: 'No logs found for the selected period' }, { status: 404 })
    }

    const serializedLogs = logs.map(log => JSON.stringify(log)).join('\n\n');

    const stream = await zai.skills.LLM.chat({
      model: 'gemini-1.5-pro-latest',
      systemPrompt: `You are an expert in creating monthly industrial attachment reports for students. Your goal is to generate a comprehensive and professional report based on a collection of daily logs, following specific university guidelines.

The report must be a continuation of the previous month's activities. Start by briefly mentioning the transition from the last month's work.

Format the output in Markdown with the following sections:

**Cover Page:**
- **Student Details:** [Placeholder for student name, ID]
- **Organisation:** [Placeholder for organization name]
- **Attachment Duration:** [Placeholder for duration]
- **Attachment Period:** [Placeholder for the specific month and year of the report]

**1. Introduction/Summary:**
   - A brief overview of the month (2-3 sentences), summarizing the main focus areas and activities.

**2. Relevant Duties and/or Activities:**
   - Provide detailed descriptions of the duties and activities performed.
   - Group similar tasks by category.
   - Use specific examples from the provided logs.

**3. Problems/Challenges Encountered:**
   - List each challenge or problem faced during the month.
   - Describe each one in detail, including when it occurred if possible.

**4. Analysis:**
   - For each challenge, explain how it was solved.
   - Discuss the lessons learned from the experience.
   - Mention any alternative approaches that were considered.
   - List the specific skills gained while solving these problems.

**5. Conclusion:**
   - Summarize the month's activities and achievements.
   - Reflect on the skills and competencies developed.
   - Provide an overall assessment of the experience during the month.
   - Identify areas for improvement for the upcoming month.
`,
      prompt: `Generate a monthly report based on the following daily logs for ${month}/${year}:\n\n${serializedLogs}`,
      output: 'text',
      maxTokens: 2000,
    });

    let report = ''
    for await (const chunk of stream) {
      report += chunk
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('AI report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate AI report' }, { status: 500 })
  }
}
