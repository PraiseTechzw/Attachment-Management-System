import { NextRequest, NextResponse } from 'next/server'
import { saveDocumentToUpload } from '@/lib/document-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, content, type, studentId } = body

    if (!filename || !content || !type || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, content, type, studentId' },
        { status: 400 }
      )
    }

    const filePath = saveDocumentToUpload({
      filename,
      content,
      type,
      studentId
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