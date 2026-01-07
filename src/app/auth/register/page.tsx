'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/contexts/AppContext'


export default function RegisterPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Simple client-side validation
  const validate = () => {
    if (!name.trim()) return 'Name is required.'
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return 'Valid email is required.'
    if (!studentId.trim()) return 'Student ID is required.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, studentId })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
      } else {
        login(data.token, data.user)
        router.push('/')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AMS</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign up to get started
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="text-red-600 dark:text-red-400 font-bold mr-2">!</span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="studentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Student ID
              </Label>
              <Input
                id="studentId"
                type="text"
                placeholder="e.g. STU12345"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum 8 characters</p>
            </div>
            <Button
              type="submit"
              disabled={loading || !name || !email || !studentId || !password}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-6"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <a href="/auth/login" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
