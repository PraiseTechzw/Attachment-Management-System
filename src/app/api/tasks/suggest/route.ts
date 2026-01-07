import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { listDocumentsInUpload } from '@/lib/document-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    const url = new URL(request.url)
    const qStudentId = url.searchParams.get('studentId')
    const studentId = auth?.studentId || qStudentId || process.env.DEV_DEMO_STUDENT_ID || 'demo-student-id'

    const documents = listDocumentsInUpload()
    const userLogs = documents.filter(d => d.type === 'log' && d.name.includes(studentId))
    const userReports = documents.filter(d => d.type === 'report' && d.name.includes(studentId))

    // Build set of dates for logs (YYYY-MM-DD)
    const logDates = new Set(userLogs.map(l => {
      try { return new Date(l.modified).toISOString().split('T')[0] } catch { return '' }
    }))

    // Missing logs for the past 7 days
    const today = new Date()
    const missingLogTasks: Array<any> = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (!logDates.has(key)) {
        missingLogTasks.push({ task: `Submit log for ${key}`, due: key, priority: 'high' })
      }
    }

    // Check for missing monthly reports in last 3 months
    const reportMonths = new Set(userReports.map(r => {
      try { const d = new Date(r.modified); return `${d.getFullYear()}-${d.getMonth()+1}` } catch { return '' }
    }))
    const missingReportTasks: Array<any> = []
    for (let m = 0; m < 3; m++) {
      const d = new Date()
      d.setMonth(d.getMonth() - m)
      const key = `${d.getFullYear()}-${d.getMonth()+1}`
      if (!reportMonths.has(key)) {
        const monthName = d.toLocaleString('default', { month: 'long' })
        missingReportTasks.push({ task: `Generate monthly report for ${monthName} ${d.getFullYear()}`, due: new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().split('T')[0], priority: 'medium' })
      }
    }

    // Suggest skill review if few logs
    const suggestions: Array<any> = []
    if (userLogs.length < 5) {
      suggestions.push({ task: 'Increase logging frequency this week', due: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0], priority: 'medium' })
    }

    // Merge and dedupe tasks, add ids
    const merged = [...missingLogTasks, ...missingReportTasks, ...suggestions]
    const unique = Array.from(new Map(merged.map((t,i) => [t.task, { id: i+1, ...t }])).values())

    return NextResponse.json(unique)
  } catch (error) {
    console.error('Error generating suggested tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
