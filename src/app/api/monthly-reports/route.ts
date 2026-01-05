import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// GET monthly reports for a student
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const reports = await db.monthlyReport.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching monthly reports:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly reports' }, { status: 500 })
  }
}

// POST create or generate a monthly report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, month, year, autoGenerate = false } = body

    if (!studentId || !month || !year) {
      return NextResponse.json(
        { error: 'Student ID, month, and year are required' },
        { status: 400 }
      )
    }

    // Check if report already exists
    const existing = await db.monthlyReport.findUnique({
      where: {
        studentId_month_year: {
          studentId,
          month,
          year
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Report already exists for this month' }, { status: 400 })
    }

    let summary = ''
    let duties = ''
    let problems = ''
    let analysis = ''
    let conclusion = ''

    // Auto-generate with AI if requested
    if (autoGenerate) {
      try {
        // Get logs for the specified month
        const logs = await db.logEntry.findMany({
          where: {
            studentId,
            date: {
              gte: new Date(`${year}-${month.padStart(2, '0')}-01`),
              lt: new Date(`${year}-${month.padStart(2, '0')}-32`)
            }
          },
          orderBy: [{ date: 'asc' }]
        })

        if (logs.length > 0) {
          const zai = await ZAI.create()

          // Prepare log data for AI
          const logData = logs.map(log => ({
            date: new Date(log.date).toLocaleDateString(),
            activity: log.activity,
            skills: log.skills,
            challenges: log.challenges,
            solutions: log.solutions
          }))

          const systemPrompt = `You are an industrial attachment report writer. Generate professional monthly reports based on student log entries.
          
Required sections:
1. Summary/Introduction: Brief overview of the month's activities
2. Relevant Duties and Activities: Detailed description of work done
3. Problems: Challenges faced during the month
4. Analysis: What was learned, skills gained, problems solved
5. Conclusion: Summary of the month and continuation to next month

Format: Clear, professional, academic tone suitable for industrial attachment documentation.`

          // Generate report sections
          const completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: systemPrompt
              },
              {
                role: 'user',
                content: `Generate a monthly industrial attachment report for ${month} ${year} based on these log entries:

${JSON.stringify(logData, null, 2)}

Please provide:
1. Summary:
2. Relevant Duties and Activities:
3. Problems:
4. Analysis:
5. Conclusion:`
              }
            ],
            thinking: { type: 'disabled' }
          })

          const aiResponse = completion.choices[0]?.message?.content || ''

          // Parse AI response into sections
          const summaryMatch = aiResponse.match(/1\.\s*Summary:\s*([\s\S]*?)(?=\n2\.|$)/i)
          const dutiesMatch = aiResponse.match(/2\.\s*Relevant Duties and Activities:\s*([\s\S]*?)(?=\n3\.|$)/i)
          const problemsMatch = aiResponse.match(/3\.\s*Problems:\s*([\s\S]*?)(?=\n4\.|$)/i)
          const analysisMatch = aiResponse.match(/4\.\s*Analysis:\s*([\s\S]*?)(?=\n5\.|$)/i)
          const conclusionMatch = aiResponse.match(/5\.\s*Conclusion:\s*([\s\S]*?)$/i)

          summary = summaryMatch?.[1]?.trim() || aiResponse.substring(0, 500)
          duties = dutiesMatch?.[1]?.trim() || aiResponse.substring(0, 1000)
          problems = problemsMatch?.[1]?.trim() || 'No major problems reported.'
          analysis = analysisMatch?.[1]?.trim() || aiResponse.substring(0, 1000)
          conclusion = conclusionMatch?.[1]?.trim() || 'Month completed successfully.'
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError)
        // Fallback to default values if AI fails
        summary = `Monthly report for ${month} ${year}`
        duties = 'Activities recorded in log entries.'
        problems = 'No major problems reported.'
        analysis = 'Skills and knowledge gained through practical experience.'
        conclusion = `Completed industrial attachment activities for ${month} ${year}.`
      }
    }

    const report = await db.monthlyReport.create({
      data: {
        studentId,
        month,
        year,
        summary,
        duties,
        problems,
        analysis,
        conclusion,
        status: 'completed',
        reportData: JSON.stringify({ summary, duties, problems, analysis, conclusion })
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating monthly report:', error)
    return NextResponse.json({ error: 'Failed to create monthly report' }, { status: 500 })
  }
}
