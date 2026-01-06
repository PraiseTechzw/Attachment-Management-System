import { NextRequest, NextResponse } from 'next/server'
import { listDocumentsInUpload } from '@/lib/document-utils'

export async function GET(request: NextRequest) {
  try {
    const documents = listDocumentsInUpload()
    
    // Transform documents to match our interface
    const transformedDocs = documents.map(doc => ({
      name: doc.name.replace(/^\w+_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, ''), // Remove timestamp prefix
      path: `/${doc.path}`,
      description: getDescriptionByType(doc.type, doc.name),
      type: mapFileTypeToDocType(doc.type, doc.name),
      size: doc.size,
      modified: doc.modified.toISOString()
    }))

    return NextResponse.json(transformedDocs)
  } catch (error) {
    console.error('Error listing documents:', error)
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 })
  }
}

function getDescriptionByType(type: string, filename: string): string {
  if (filename.includes('Guidelines')) return 'Official guidelines for formatting and structuring attachment reports'
  if (filename.includes('template')) return 'Standard template for daily and weekly activity logging'
  if (filename.includes('Documentation')) return 'Requirements for project documentation and methodology'
  
  switch (type) {
    case 'log': return 'Daily activity log entry'
    case 'report': return 'Generated monthly or final report'
    case 'project': return 'Project documentation and planning'
    default: return 'Attachment-related document'
  }
}

function mapFileTypeToDocType(type: string, filename: string): string {
  if (filename.includes('Guidelines')) return 'guidelines'
  if (filename.includes('template')) return 'template'
  if (filename.includes('Documentation')) return 'documentation'
  
  switch (type) {
    case 'log': return 'log'
    case 'report': return 'report'
    case 'project': return 'project'
    default: return 'documentation'
  }
}