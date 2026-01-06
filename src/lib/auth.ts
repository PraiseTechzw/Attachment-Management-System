import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface User {
  id: string
  email: string
  name: string
  studentId: string
  program: string
  year: string
}

export interface AuthToken {
  userId: string
  email: string
  studentId: string
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      studentId: user.studentId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch (error) {
    return null
  }
}

export function getAuthFromRequest(request: NextRequest): AuthToken | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// Mock user database - in production, use a real database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@student.edu',
    name: 'Demo Student',
    studentId: 'demo-student-id',
    program: 'Computer Science',
    year: '3'
  }
]

export function findUserByEmail(email: string): User | null {
  return mockUsers.find(user => user.email === email) || null
}

export function findUserById(id: string): User | null {
  return mockUsers.find(user => user.id === id) || null
}

export function validatePassword(email: string, password: string): User | null {
  // In production, hash and compare passwords properly
  if (email === 'demo@student.edu' && password === 'demo123') {
    return findUserByEmail(email)
  }
  return null
}