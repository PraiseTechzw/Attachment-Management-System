import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST export project documentation as markdown
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const project = await db.project.findUnique({
      where: { studentId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const markdownContent = `
${project.title ? `# ${project.title}` : '# PROJECT DOCUMENTATION'}

**Student:** ${student.name}
**Student Number:** ${student.studentNumber || 'N/A'}
**Department:** ${student.department || 'N/A'}
**Program:** ${student.program || 'N/A'}

---

${project.chapter1Introduction ? `## CHAPTER 1: INTRODUCTION

${project.chapter1Introduction}
` : '## CHAPTER 1: INTRODUCTION
(Not yet completed)'}

---

${project.chapter2Planning ? `## CHAPTER 2: PLANNING

${project.chapter2Planning}
` : '## CHAPTER 2: PLANNING
(Not yet completed)'}

---

${project.chapter3Analysis ? `## CHAPTER 3: ANALYSIS

${project.chapter3Analysis}
` : '## CHAPTER 3: ANALYSIS
(Not yet completed)'}

---

${project.chapter4Design ? `## CHAPTER 4: DESIGN

${project.chapter4Design}
` : '## CHAPTER 4: DESIGN
(Not yet completed)'}

---

${project.chapter5Implementation ? `## CHAPTER 5: IMPLEMENTATION

${project.chapter5Implementation}
` : '## CHAPTER 5: IMPLEMENTATION
(Not yet completed)'}

---

${project.appendixA ? `## APPENDIX A: USER MANUAL

${project.appendixA}
` : ''}

---

${project.appendixB ? `## APPENDIX B: SAMPLE CODE

\`\`\`code
${project.appendixB}
\`\`\``
` : ''}

---

${project.appendixC ? `## APPENDIX C: RESEARCH METHODOLOGIES

${project.appendixC}
` : ''}

---

**Document Generated:** ${new Date().toLocaleString()}

---

*This project documentation was generated using the Attachment Management System*
`.trim()

    const response = new NextResponse(markdownContent)
    response.headers.set('Content-Type', 'text/markdown')
    response.headers.set(
      'Content-Disposition',
      'attachment; filename="project-documentation.md"'
    )

    return response
  } catch (error) {
    console.error('Error exporting project:', error)
    return NextResponse.json({ error: 'Failed to export project' }, { status: 500 })
  }
}
