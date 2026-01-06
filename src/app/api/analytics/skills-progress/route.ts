import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { listDocumentsInUpload } from '@/lib/document-utils'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all log documents for the user
    const documents = listDocumentsInUpload()
    const userLogs = documents.filter(doc => 
      doc.type === 'log' && doc.name.includes(auth.studentId)
    )

    // Extract skills from log entries
    const skillsData = await extractSkillsFromLogs(userLogs)

    return NextResponse.json(skillsData)

  } catch (error) {
    console.error('Error getting skills progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function extractSkillsFromLogs(logs: any[]) {
  const skillsMap = new Map<string, number>()
  
  // Default skills with base progress
  const defaultSkills = [
    'Frontend Development',
    'Backend Development', 
    'Database Management',
    'Project Management',
    'Documentation',
    'Problem Solving',
    'Communication',
    'Teamwork'
  ]

  // Initialize with default skills
  defaultSkills.forEach(skill => {
    skillsMap.set(skill, Math.floor(Math.random() * 30) + 10) // Base 10-40%
  })

  // Process log files to extract mentioned skills
  for (const log of logs) {
    try {
      const fullPath = path.join(process.cwd(), log.path)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        
        // Extract skills from the content
        const skillsSection = extractSkillsSection(content)
        if (skillsSection) {
          const mentionedSkills = parseSkills(skillsSection)
          mentionedSkills.forEach(skill => {
            const current = skillsMap.get(skill) || 0
            skillsMap.set(skill, Math.min(100, current + 5)) // Increase by 5% per mention, max 100%
          })
        }
      }
    } catch (error) {
      console.error('Error reading log file:', error)
    }
  }

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

  const skillsArray = Array.from(skillsMap.entries()).map(([skill, progress], index) => ({
    skill,
    progress: Math.round(progress),
    color: colors[index % colors.length]
  }))

  return skillsArray.slice(0, 8) // Return top 8 skills
}

function extractSkillsSection(content: string): string | null {
  const skillsMatch = content.match(/SKILLS & KNOWLEDGE GAINED:\s*(.*?)(?=\n[A-Z]|\n\n|$)/s)
  return skillsMatch ? skillsMatch[1].trim() : null
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