import { NextResponse } from 'next/server'

export async function POST() {
  // Clear any server-side session if needed
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  // The client will clear localStorage via AppContext.logout()
  return response
}
