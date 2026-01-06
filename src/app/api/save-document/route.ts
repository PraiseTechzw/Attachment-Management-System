import { NextRequest, NextResponse } from 'next/server'
import { saveDocumentToUpload } from '@/lib/document-utils'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { filename, content, type } = body

    if (!filename || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, content, type' },
        { status: 400 }
      )
    }

    // Use studentId from auth token
    const filePath = saveDocumentToUpload({
      filename,
      content,
      type,
      studentId: auth.studentId
    })

    return NextResponse.json({
      success: true,
      filePath: filePath.replace(process.cwd(), ''),
      message: 'Document saved successfully'
    })

  } catch (error) {
    console.error('Error saving document:', error)
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    )
  }
}