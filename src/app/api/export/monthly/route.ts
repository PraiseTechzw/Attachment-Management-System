import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST export monthly report as DOCX
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, month, year } = body

    if (!studentId || !month || !year) {
      return NextResponse.json(
        { error: 'Student ID, month, and year are required' },
        { status: 400 }
      )
    }

    const report = await db.monthlyReport.findUnique({
      where: {
        studentId_month_year: { studentId, month, year }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { organization: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

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

    const reportData = report.reportData
      ? JSON.parse(report.reportData as string)
      : {
          summary: report.summary,
          duties: report.duties,
          problems: report.problems,
          analysis: report.analysis,
          conclusion: report.conclusion
        }

    const markdownContent = `
# MONTHLY INDUSTRIAL ATTACHMENT REPORT
**Month:** ${month} ${year}

## STUDENT INFORMATION
**Name:** ${student.name}
**Student Number:** ${student.studentNumber || 'N/A'}
**Department:** ${student.department || 'N/A'}
**Program:** ${student.program || 'N/A'}

## ORGANIZATION DETAILS
${student.organization ? `
**Company:** ${student.organization.name}
**Supervisor:** ${student.organization.supervisor || 'N/A'}
**Period:** ${new Date(student.organization.startDate).toLocaleDateString()} - ${student.organization.endDate ? new Date(student.organization.endDate).toLocaleDateString() : 'Present'}
` : 'Organization information not available'}

---

## 1. SUMMARY/INTRODUCTION
${reportData.summary || 'No summary provided.'}

---

## 2. RELEVANT DUTIES AND/OR ACTIVITIES
${reportData.duties || 'No duties listed.'}

### Detailed Activities (${logs.length} entries)
${logs.map(log => `
**Date:** ${new Date(log.date).toLocaleDateString()} ${log.time || ''}
- ${log.activity}
${log.skills ? `  *Skills:* ${log.skills}` : ''}
${log.challenges ? `  *Challenges:* ${log.challenges}` : ''}
${log.solutions ? `  *Solutions:* ${log.solutions}` : ''}
`).join('\n')}

---

## 3. PROBLEMS
${reportData.problems || 'No major problems reported.'}

---

## 4. ANALYSIS
${reportData.analysis || 'No analysis provided.'}

### Skills Gained This Month
${logs.filter(l => l.skills).map(l => l.skills).join('\n')}

### Challenges and Solutions
${logs.filter(l => l.challenges && l.solutions).map(log => `
- **Challenge:** ${log.challenges}
  **Solution:** ${log.solutions}
`).join('\n')}

---

## 5. CONCLUSION
${reportData.conclusion || 'No conclusion provided.'}

---

**Report Generated:** ${new Date().toLocaleString()}
**Number of Log Entries:** ${logs.length}

---
*This report was auto-generated using the Attachment Management System*
`.trim()

    const response = new NextResponse(markdownContent)
    response.headers.set('Content-Type', 'text/markdown')
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="monthly-report-${month}-${year}.md"`
    )

    return response
  } catch (error) {
    console.error('Error exporting monthly report:', error)
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 })
  }
}
