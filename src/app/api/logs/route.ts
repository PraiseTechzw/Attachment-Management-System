import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all log entries for a student
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const logs = await db.logEntry.findMany({
      where: { studentId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

// POST create a new log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { studentId, date, time, activity, skills, challenges, solutions, category } = body

    if (!studentId || !date || !activity) {
      return NextResponse.json({ error: 'Student ID, date, and activity are required' }, { status: 400 })
    }

    const log = await db.logEntry.create({
      data: {
        studentId,
        date: new Date(date),
        time,
        activity,
        skills,
        challenges,
        solutions,
        category
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json({ error: 'Failed to create log entry' }, { status: 500 })
  }
}

// PUT update a log entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, date, time, activity, skills, challenges, solutions, category } = body

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 })
    }

    const log = await db.logEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        time,
        activity,
        skills,
        challenges,
        solutions,
        category
      }
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error updating log:', error)
    return NextResponse.json({ error: 'Failed to update log entry' }, { status: 500 })
  }
}
