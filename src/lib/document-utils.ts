import * as fs from 'fs'
import * as path from 'path'

export interface SaveDocumentOptions {
  filename: string
  content: string
  type: 'log' | 'report' | 'project' | 'other'
  studentId: string
}

export function saveDocumentToUpload(options: SaveDocumentOptions): string {
  const { filename, content, type, studentId } = options
  
  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'upload')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Create type-specific subdirectory
  const typeDir = path.join(uploadDir, type)
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true })
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fullFilename = `${studentId}_${timestamp}_${safeFilename}`
  
  // Save file
  const filePath = path.join(typeDir, fullFilename)
  fs.writeFileSync(filePath, content, 'utf8')
  
  return filePath
}

export function listDocumentsInUpload(): Array<{
  name: string
  path: string
  type: string
  size: number
  modified: Date
}> {
  const uploadDir = path.join(process.cwd(), 'upload')
  
  if (!fs.existsSync(uploadDir)) {
    return []
  }

  const documents: Array<{
    name: string
    path: string
    type: string
    size: number
    modified: Date
  }> = []

  function scanDirectory(dir: string, type: string = 'other') {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stats = fs.statSync(itemPath)
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(itemPath, item)
      } else if (stats.isFile()) {
        documents.push({
          name: item,
          path: path.relative(process.cwd(), itemPath),
          type: type,
          size: stats.size,
          modified: stats.mtime
        })
      }
    }
  }

  scanDirectory(uploadDir)
  return documents
}

export function deleteDocument(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting document:', error)
    return false
  }
}