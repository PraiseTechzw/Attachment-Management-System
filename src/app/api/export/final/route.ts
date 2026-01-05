import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST export final report as markdown
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const report = await db.finalReport.findUnique({
      where: { studentId }
    })

    if (!report) {
      return NextResponse.json({ error: 'Final report not found' }, { status: 404 })
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { organization: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const logs = await db.logEntry.findMany({
      where: { studentId },
      orderBy: [{ date: 'asc' }]
    })

    const monthlyReports = await db.monthlyReport.findMany({
      where: { studentId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    })

    const markdownContent = `
# INDUSTRIAL ATTACHMENT FINAL REPORT

## STUDENT INFORMATION
**Name:** ${student.name}
**Student Number:** ${student.studentNumber || 'N/A'}
**Department:** ${student.department || 'N/A'}
**Program:** ${student.program || 'N/A'}

${student.organization ? `
## ORGANIZATION DETAILS
**Company:** ${student.organization.name}
**Address:** ${student.organization.address || 'N/A'}
**Supervisor:** ${student.organization.supervisor || 'N/A'}
**Attachment Period:** ${new Date(student.organization.startDate).toLocaleDateString()} - ${student.organization.endDate ? new Date(student.organization.endDate).toLocaleDateString() : 'Present'}
` : ''}

---

## 1. INTRODUCTION
${report.introduction || 'No introduction provided.'}

${report.companyBackground ? `
### Company Background
${report.companyBackground}
` : ''}

---

## 2. MAIN BODY

### 2.1 Brief Company Background
${report.companyBackground || 'No company background provided.'}

### 2.2 Major Duties/Activities
${report.majorDuties || 'No major duties listed.'}

### 2.3 Major Challenges/Problems
${report.majorChallenges || 'No major challenges listed.'}

### 2.4 Suggested Solutions
${report.suggestedSolutions || 'No solutions provided.'}

### 2.5 Detailed Duties/Activities
${report.detailedDuties || 'No detailed duties provided.'}

### 2.6 Challenges/Problems Encountered
${report.challengesEncountered || 'No challenges encountered listed.'}

### 2.7 Procedure Followed to Solve Problems
${report.problemProcedures || 'No problem-solving procedures provided.'}

### 2.8 Alternatives and Reasons for Choice of Solution
${report.alternatives || 'No alternatives discussed.'}

### 2.9 Skills Gained
${report.skillsGained || 'No skills gained listed.'}

---

## 3. ANALYSIS
${report.mainBody || 'No main body/analysis provided.'}

---

## 4. CONCLUSIONS AND RECOMMENDATIONS

### 4.1 Conclusions
${report.conclusions || 'No conclusions provided.'}

### 4.2 Recommendations
${report.recommendations || 'No recommendations provided.'}

---

## ATTACHMENT STATISTICS
- **Total Log Entries:** ${logs.length}
- **Total Monthly Reports:** ${monthlyReports.length}
- **Attachment Duration:** ${student.organization ? `${Math.round((new Date((student.organization.endDate ? student.organization.endDate : new Date()).getTime() - new Date(student.organization.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : 'N/A'}

---

## MONTHLY REPORTS SUMMARY
${monthlyReports.map((mr, i) => `
### Month ${i + 1}: ${mr.month} ${mr.year}
- **Status:** ${mr.status}
- **Entries:** ${mr.summary || 'No summary'}
`).join('\n')}

---

**Report Generated:** ${new Date().toLocaleString()}
**Total Pages:** This document

---

*This report was generated using the Attachment Management System*
`.trim()

    const response = new NextResponse(markdownContent)
    response.headers.set('Content-Type', 'text/markdown')
    response.headers.set(
      'Content-Disposition',
      'attachment; filename="final-attachment-report.md"'
    )

    return response
  } catch (error) {
    console.error('Error exporting final report:', error)
    return NextResponse.json({ error: 'Failed to export final report' }, { status: 500 })
  }
}
