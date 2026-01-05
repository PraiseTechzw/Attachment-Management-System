import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET a single monthly report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await db.monthlyReport.findUnique({
      where: { id: params.id }
    })

    if (!report) {
      return NextResponse.json({ error: 'Monthly report not found' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching monthly report:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly report' }, { status: 500 })
  }
}

// PUT update a monthly report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { summary, duties, problems, analysis, conclusion, status } = body

    const report = await db.monthlyReport.update({
      where: { id: params.id },
      data: {
        summary,
        duties,
        problems,
        analysis,
        conclusion,
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating monthly report:', error)
    return NextResponse.json({ error: 'Failed to update monthly report' }, { status: 500 })
  }
}

// DELETE a monthly report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.monthlyReport.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Monthly report deleted successfully' })
  } catch (error) {
    console.error('Error deleting monthly report:', error)
    return NextResponse.json({ error: 'Failed to delete monthly report' }, { status: 500 })
  }
}
