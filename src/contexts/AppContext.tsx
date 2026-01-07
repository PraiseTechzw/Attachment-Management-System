'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AppStats {
  totalLogs: number
  reports: number
  projects: number
  daysActive: number
}

interface AppContextType {
  stats: AppStats
  refreshStats: () => Promise<void>
  isLoading: boolean
  studentId: string
  token?: string | null
  user?: { id: string; email: string; name: string; studentId: string } | null
  login: (token: string, user: any) => void
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AppStats>({
    totalLogs: 0,
    reports: 0,
    projects: 0,
    daysActive: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const studentId = user?.studentId || '' // Only use authenticated user's studentId

  const login = (newToken: string, newUser: any) => {
    try {
      localStorage.setItem('auth', JSON.stringify({ token: newToken, user: newUser }))
    } catch (e) {}
    setToken(newToken)
    setUser(newUser)
    refreshStats()
  }

  const logout = () => {
    try { localStorage.removeItem('auth') } catch (e) {}
    setToken(null)
    setUser(null)
    refreshStats()
  }

  const refreshStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const documents = await response.json()
        
        const logs = documents.filter((doc: any) => doc.type === 'log').length
        const reports = documents.filter((doc: any) => doc.type === 'report').length
        const projects = documents.filter((doc: any) => doc.type === 'project').length
        
        setStats({
          totalLogs: logs,
          reports: reports,
          projects: projects,
          daysActive: logs
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // load auth from storage
    let initialToken: string | null = null
    try {
      const raw = localStorage.getItem('auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        initialToken = parsed.token
        setToken(parsed.token)
        setUser(parsed.user)
      }
    } catch (e) {}

    // If token is present, verify and fetch current user
    async function validate() {
      if (!initialToken) {
        refreshStats()
        return
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${initialToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          // invalid token
          setToken(null)
          setUser(null)
          try { localStorage.removeItem('auth') } catch {}
        }
      } catch (e) {
        console.error('Error validating token', e)
      } finally {
        refreshStats()
      }
    }

    validate()
  }, [])

  return (
    <AppContext.Provider value={{ stats, refreshStats, isLoading, studentId, token, user, login, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}