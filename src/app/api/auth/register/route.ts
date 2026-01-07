import { NextRequest, NextResponse } from 'next/server'
import { registerUser, generateToken, findUserByEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, studentId, program, year } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const user = registerUser({ email, password, name, studentId, program, year })
    if (!user) {
      return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
    }

    const token = generateToken(user)
    return NextResponse.json({ token, user })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
