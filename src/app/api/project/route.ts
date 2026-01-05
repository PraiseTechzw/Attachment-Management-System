import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// GET project documentation
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const project = await db.project.findUnique({
      where: { studentId }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// POST create or update project documentation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      title,
      chapter1Introduction,
      chapter2Planning,
      chapter3Analysis,
      chapter4Design,
      chapter5Implementation,
      appendixA,
      appendixB,
      appendixC,
      generateAI = false
    } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // AI-assisted chapter generation
    if (generateAI) {
      try {
        const zai = await ZAI.create()

        // Generate Chapter 1 if not provided
        if (!chapter1Introduction && title) {
          const ch1Completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are an expert in writing project documentation following software engineering methodology.
                
Chapter 1: Introduction should include:
1.1. Introduction with background
1.1.1. Company Organogram
1.1.2. Vision
1.1.3. Mission Statement
1.2. System's Request Summary
1.3. Problem Definition
1.4. Aim
1.5. Objectives
1.6. Constraints
1.7. Justification
1.8. Conclusion

Write Chapter 1 for a project titled: "${title}"
Use professional academic tone. Format with clear section headings.`
              },
              {
                role: 'user',
                content: `Generate Chapter 1: Introduction for project "${title}"`
              }
            ],
            thinking: { type: 'disabled' }
          })
          chapter1Introduction = ch1Completion.choices[0]?.message?.content || ''
        }

        // Generate Chapter 2 if not provided
        if (!chapter2Planning) {
          const ch2Completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are an expert in writing project documentation.

Chapter 2: Planning should include:
2.0. Introduction
2.1. Business Value
2.2. Feasibility Study
2.2.1. Technical Feasibility
2.2.2. Operational Feasibility
2.2.3. Economic Feasibility
2.3. Risk Analysis
2.4. Project Plan
2.4.1. Project Schedule/Gantt Chart

Write Chapter 2: Planning for project "${title}"
Include realistic planning details and considerations.`
              },
              {
                role: 'user',
                content: `Generate Chapter 2: Planning for project "${title}"`
              }
            ],
            thinking: { type: 'disabled' }
          })
          chapter2Planning = ch2Completion.choices[0]?.message?.content || ''
        }

        // Generate Chapter 3 if not provided
        if (!chapter3Analysis) {
          const ch3Completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are an expert in writing project documentation.

Chapter 3: Analysis should include:
3.0. Introduction
3.1. Information Gathering Methodologies
3.2. Analysis of the existing system
3.3. Process Analysis
3.4. Data Analysis
3.4.1. Context Diagram
3.4.2. Data-Flow Diagram
3.5. Weaknesses in the current system
3.6. Evaluation of Alternatives
3.7. Requirements Analysis
3.7.1. Functional Requirements
3.7.2. Non-Functional Requirements

Write Chapter 3: Analysis for project "${title}"
Use systems analysis methodology.`
              },
              {
                role: 'user',
                content: `Generate Chapter 3: Analysis for project "${title}"`
              }
            ],
            thinking: { type: 'disabled' }
          })
          chapter3Analysis = ch3Completion.choices[0]?.message?.content || ''
        }

        // Generate Chapter 4 if not provided
        if (!chapter4Design) {
          const ch4Completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are an expert in writing project documentation.

Chapter 4: Design should include:
4.0. Introduction
4.1. System Design
4.2. Architectural Design
4.3. Physical Design
4.4. Database Design
4.5. Program Design
4.5.1. Package Diagram
4.5.2. Class Diagram
4.5.3. Sequence Diagram
4.5.4. Context Diagram
4.5.5. Data-Flow Diagram
4.6. Interface Design
4.6.1. Security Design
4.6.2. Input Design
4.6.3. Output Design

Write Chapter 4: Design for project "${title}"
Include appropriate design artifacts descriptions.`
              },
              {
                role: 'user',
                content: `Generate Chapter 4: Design for project "${title}"`
              }
            ],
            thinking: { type: 'disabled' }
          })
          chapter4Design = ch4Completion.choices[0]?.message?.content || ''
        }

        // Generate Chapter 5 if not provided
        if (!chapter5Implementation) {
          const ch5Completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are an expert in writing project documentation.

Chapter 5: Implementation should include:
5.1. Coding
5.2. Testing
5.2.1. Unit Testing
5.2.2. Modular Testing
5.2.3. Objectives Testing
5.2.4. Acceptance Testing
5.2.5. Validation
5.2.6. Verification
5.3. Installation
5.3.1. Hardware Installation
5.3.2. Software Installation
5.3.3. Database Installation
5.3.4. Application System Installation
5.3.5. Training
5.3.6. Review
5.3.7. Back-up

Write Chapter 5: Implementation for project "${title}"
Describe implementation, testing, and deployment activities.`
              },
              {
                role: 'user',
                content: `Generate Chapter 5: Implementation for project "${title}"`
              }
            ],
            thinking: { type: 'disabled' }
          })
          chapter5Implementation = ch5Completion.choices[0]?.message?.content || ''
        }

      } catch (aiError) {
        console.error('AI generation error:', aiError)
        // Continue with manual content if AI fails
      }
    }

    const project = await db.project.upsert({
      where: { studentId },
      update: {
        title,
        chapter1Introduction,
        chapter2Planning,
        chapter3Analysis,
        chapter4Design,
        chapter5Implementation,
        appendixA,
        appendixB,
        appendixC,
        status: 'completed'
      },
      create: {
        studentId,
        title,
        chapter1Introduction,
        chapter2Planning,
        chapter3Analysis,
        chapter4Design,
        chapter5Implementation,
        appendixA,
        appendixB,
        appendixC,
        status: 'completed'
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error saving project:', error)
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 })
  }
}
