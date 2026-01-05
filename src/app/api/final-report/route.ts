import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET final report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const report = await db.finalReport.findUnique({
      where: { studentId }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching final report:', error)
    return NextResponse.json({ error: 'Failed to fetch final report' }, { status: 500 })
  }
}

// POST create or update final report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      coverPage,
      introduction,
      companyBackground,
      majorDuties,
      majorChallenges,
      suggestedSolutions,
      mainBody,
      detailedDuties,
      challengesEncountered,
      problemProcedures,
      alternatives,
      skillsGained,
      conclusions,
      recommendations,
      generateFromLogs = false
    } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // If generating from logs, gather all logs
    let finalData: any = {}

    if (generateFromLogs) {
      const logs = await db.logEntry.findMany({
        where: { studentId },
        orderBy: [{ date: 'asc' }]
      })

      const monthlyReports = await db.monthlyReport.findMany({
        where: { studentId },
        orderBy: [{ year: 'asc' }, { month: 'asc' }]
      })

      finalData.logsSummary = logs.length
      finalData.monthsCovered = monthlyReports.length
      finalData.skillsExtracted = logs
        .filter(l => l.skills)
        .map(l => l.skills)
        .flat()
        .filter((s, i, a) => a.indexOf(s) === i)
      finalData.challengesExtracted = logs
        .filter(l => l.challenges)
        .map(l => l.challenges)
      finalData.solutionsExtracted = logs
        .filter(l => l.solutions)
        .map(l => l.solutions)

      // Generate sections from data
      companyBackground = companyBackground || 'Organization background based on industrial attachment experience.'
      majorDuties = majorDuties || `Completed ${logs.length} log entries documenting various activities and duties.`
      majorChallenges = majorChallenges || 'Various challenges encountered during attachment period.'
      suggestedSolutions = suggestedSolutions || 'Applied multiple solutions to overcome challenges.'
      detailedDuties = detailedDuties || logs.map(l => `- ${l.activity}`).join('\n')
      challengesEncountered = challengesEncountered || finalData.challengesExtracted.join('\n\n')
      problemProcedures = problemProcedures || finalData.solutionsExtracted.join('\n\n')
      skillsGained = skillsGained || finalData.skillsExtracted.join(', ')
      conclusions = conclusions || `Industrial attachment completed with ${monthlyReports.length} monthly reports covering ${logs.length} logged activities.`
      recommendations = recommendations || 'Continue developing technical skills and practical experience in ICT and Electronics.'
    }

    const report = await db.finalReport.upsert({
      where: { studentId },
      update: {
        coverPage,
        introduction,
        companyBackground,
        majorDuties,
        majorChallenges,
        suggestedSolutions,
        mainBody,
        detailedDuties,
        challengesEncountered,
        problemProcedures,
        alternatives,
        skillsGained,
        conclusions,
        recommendations,
        status: 'completed'
      },
      create: {
        studentId,
        coverPage,
        introduction,
        companyBackground,
        majorDuties,
        majorChallenges,
        suggestedSolutions,
        mainBody,
        detailedDuties,
        challengesEncountered,
        problemProcedures,
        alternatives,
        skillsGained,
        conclusions,
        recommendations,
        status: 'completed'
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error saving final report:', error)
    return NextResponse.json({ error: 'Failed to save final report' }, { status: 500 })
  }
}
