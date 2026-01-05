import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET a single log entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const log = await db.logEntry.findUnique({
      where: { id: params.id }
    })

    if (!log) {
      return NextResponse.json({ error: 'Log entry not found' }, { status: 404 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error fetching log:', error)
    return NextResponse.json({ error: 'Failed to fetch log entry' }, { status: 500 })
  }
}

// DELETE a log entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.logEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Log entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting log:', error)
    return NextResponse.json({ error: 'Failed to delete log entry' }, { status: 500 })
  }
}
