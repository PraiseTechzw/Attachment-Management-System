import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { listDocumentsInUpload } from '@/lib/document-utils'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)

    // Allow a studentId query param for dev / client-side requests when no auth header is present
    const url = new URL(request.url)
    const qStudentId = url.searchParams.get('studentId')
    const studentId = auth?.studentId || qStudentId || process.env.DEV_DEMO_STUDENT_ID || 'demo-student-id'

    // Get all log documents for the (resolved) student
    const documents = listDocumentsInUpload()
    const userLogs = documents.filter(doc => 
      doc.type === 'log' && doc.name.includes(studentId)
    )

    // Calculate weekly activity data
    const weeklyData = calculateWeeklyActivity(userLogs)

    return NextResponse.json(weeklyData)

  } catch (error) {
    console.error('Error getting weekly activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateWeeklyActivity(logs: any[]) {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
  
  const weeklyData = [
    { day: 'Sun', value: 0, color: 'bg-blue-300' },
    { day: 'Mon', value: 0, color: 'bg-blue-500' },
    { day: 'Tue', value: 0, color: 'bg-blue-500' },
    { day: 'Wed', value: 0, color: 'bg-blue-500' },
    { day: 'Thu', value: 0, color: 'bg-blue-500' },
    { day: 'Fri', value: 0, color: 'bg-blue-500' },
    { day: 'Sat', value: 0, color: 'bg-blue-300' }
  ]

  logs.forEach(log => {
    const logDate = new Date(log.modified)
    const daysDiff = Math.floor((logDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff >= 0 && daysDiff < 7) {
      weeklyData[daysDiff].value += 1
    }
  })

  return weeklyData
}