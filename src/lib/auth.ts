import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface User {
  id: string
  email: string
  name: string
  studentId: string
  program: string | null
  year: string | null
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

export async function findUserByEmail(email: string): Promise<User | null> {
  const student = await prisma.student.findUnique({ where: { email } })
  if (!student) return null
  return {
    id: student.id,
    email: student.email,
    name: student.name,
    studentId: student.studentNumber || student.id,
    program: student.program || null,
    year: student.updatedAt ? String(student.updatedAt.getFullYear()) : null
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const student = await prisma.student.findUnique({ where: { id } })
  if (!student) return null
  return {
    id: student.id,
    email: student.email,
    name: student.name,
    studentId: student.studentNumber || student.id,
    program: student.program || null,
    year: student.updatedAt ? String(student.updatedAt.getFullYear()) : null
  }
}

export async function validatePassword(email: string, password: string): Promise<User | null> {
  const student = await prisma.student.findUnique({ where: { email } })
  if (!student) return null
  const ok = await bcrypt.compare(password, student.password)
  if (!ok) return null
  return {
    id: student.id,
    email: student.email,
    name: student.name,
    studentId: student.studentNumber || student.id,
    program: student.program || null,
    year: student.updatedAt ? String(student.updatedAt.getFullYear()) : null
  }
}

export async function registerUser(userData: { email: string; password: string; name?: string; studentId?: string; program?: string; year?: string }) {
  const existing = await prisma.student.findUnique({ where: { email: userData.email } })
  if (existing) return null

  const hashed = await bcrypt.hash(userData.password, 10)

  const student = await prisma.student.create({
    data: {
      email: userData.email,
      password: hashed,
      name: userData.name || userData.email.split('@')[0],
      studentNumber: userData.studentId,
      program: userData.program,
      // year left null or set from input
    }
  })

  return {
    id: student.id,
    email: student.email,
    name: student.name,
    studentId: student.studentNumber || student.id,
    program: student.program || null,
    year: student.updatedAt ? String(student.updatedAt.getFullYear()) : null
  }
}