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
  const studentId = 'demo-student-id' // This could come from authentication

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
    refreshStats()
  }, [])

  return (
    <AppContext.Provider value={{ stats, refreshStats, isLoading, studentId }}>
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