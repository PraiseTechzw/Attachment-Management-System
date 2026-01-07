import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'db', 'tasks.json')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 })
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const tasks = JSON.parse(content)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error reading tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
