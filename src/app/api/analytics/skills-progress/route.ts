import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    
    // Require authentication
    if (!auth?.studentId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentId = auth.studentId

    // Query LogEntry records from database for this student
    const logEntries = await prisma.logEntry.findMany({
      where: { studentId },
      select: { skills: true }
    })

    // Extract and aggregate skills from database records
    const skillsData = extractSkillsFromLogEntries(logEntries)

    return NextResponse.json(skillsData)

  } catch (error) {
    console.error('Error getting skills progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractSkillsFromLogEntries(logEntries: any[]) {
  const skillsMap = new Map<string, number>()
  
  // Parse skills from all log entries
  logEntries.forEach(entry => {
    if (entry.skills) {
      const skillsList = parseSkillsFromText(entry.skills)
      skillsList.forEach(skill => {
        const current = skillsMap.get(skill) || 0
        skillsMap.set(skill, Math.min(100, current + 5)) // Increase by 5% per mention, max 100%
      })
    }
  })

  // Convert to array format with colors
  const colors = [
    'bg-blue-500',
    'bg-emerald-500', 
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-pink-500'
  ]

  const skillsArray = Array.from(skillsMap.entries())
    .map(([skill, progress], index) => ({
      skill,
      progress: Math.round(progress),
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.progress - a.progress) // Sort by progress descending
    .slice(0, 8) // Return top 8 skills

  return skillsArray
}

function parseSkillsFromText(text: string): string[] {
  // Split by common delimiters and clean up
  const skills = text
    .split(/[,;:\n\-\|]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50) // Filter out empty or unreasonably long entries
  
  return skills
}

function parseSkills(skillsText: string): string[] {
  if (!skillsText) return []
  
  // Split by common delimiters and clean up
  const skills = skillsText
    .split(/[,;]/)
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
    .map(skill => {
      // Normalize skill names
      skill = skill.replace(/^\d+\.\s*/, '') // Remove numbering
      skill = skill.replace(/^[-*]\s*/, '') // Remove bullet points
      return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()
    })
    .filter(skill => skill.length > 2)

  return skills
}