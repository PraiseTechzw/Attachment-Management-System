import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET GitHub integration status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const github = await db.githubIntegration.findUnique({
      where: { studentId }
    })

    // Don't return the actual token
    if (github) {
      const { githubToken, ...safeData } = github as any
      return NextResponse.json({
        ...safeData,
        connected: !!githubToken
      })
    }

    return NextResponse.json({ connected: false })
  } catch (error) {
    console.error('Error fetching GitHub integration:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub integration' }, { status: 500 })
  }
}

// POST connect or update GitHub integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentId,
      githubToken,
      repositoryUrl,
      branch,
      autoCommit
    } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    if (!githubToken && !repositoryUrl) {
      return NextResponse.json(
        { error: 'Either GitHub token or repository URL is required' },
        { status: 400 }
      )
    }

    const github = await db.githubIntegration.upsert({
      where: { studentId },
      update: {
        githubToken,
        repositoryUrl,
        branch,
        autoCommit,
        lastSyncAt: new Date()
      },
      create: {
        studentId,
        githubToken,
        repositoryUrl,
        branch: branch || 'main',
        autoCommit: autoCommit || false,
        lastSyncAt: new Date()
      }
    })

    // Don't return the token in response
    const { githubToken: _, ...safeData } = github as any

    return NextResponse.json({
      ...safeData,
      connected: true
    }, { status: 201 })
  } catch (error) {
    console.error('Error connecting GitHub:', error)
    return NextResponse.json({ error: 'Failed to connect GitHub' }, { status: 500 })
  }
}
