import { NextRequest, NextResponse } from 'next/server'
import * as mammoth from 'mammoth'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Remove leading slash and construct full path
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
    const fullPath = path.join(process.cwd(), cleanPath)

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read the .docx file
    const buffer = fs.readFileSync(fullPath)
    
    // Convert .docx to HTML using mammoth
    const result = await mammoth.extractRawText({ buffer })
    
    if (result.messages.length > 0) {
      console.warn('Mammoth conversion warnings:', result.messages)
    }

    // Return the extracted text
    return new NextResponse(result.value, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error processing .docx file:', error)
    return NextResponse.json(
      { error: 'Failed to process document' }, 
      { status: 500 }
    )
  }
}