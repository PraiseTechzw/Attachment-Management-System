import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET student info
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const studentId = searchParams.get('id')

    if (email) {
      const student = await db.student.findUnique({
        where: { email },
        include: {
          organization: true,
          githubIntegration: true
        }
      })
      return NextResponse.json(student)
    }

    if (studentId) {
      const student = await db.student.findUnique({
        where: { id: studentId },
        include: {
          organization: true,
          githubIntegration: true
        }
      })
      return NextResponse.json(student)
    }

    const students = await db.student.findMany({
      include: {
        organization: true,
        githubIntegration: true
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

// POST create or update student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, studentNumber, department, program } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    const student = await db.student.upsert({
      where: { email },
      update: {
        name,
        studentNumber,
        department,
        program
      },
      create: {
        email,
        name,
        studentNumber,
        department,
        program
      },
      include: {
        organization: true,
        githubIntegration: true
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating student:', error)
    return NextResponse.json({ error: 'Failed to create/update student' }, { status: 500 })
  }
}
