'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, FolderTree, Github, Clipboard, Activity, BarChart3, Settings, User, Zap, Menu, X, Home } from 'lucide-react'
import { LogEntryForm } from '@/components/LogEntryForm'
import { MonthlyReportComponent } from '@/components/MonthlyReportComponent'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-violet-600' },
    { id: 'logs', label: 'Log Sheets', icon: Clipboard, color: 'text-blue-600' },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: FileText, color: 'text-emerald-600' },
    { id: 'final-report', label: 'Final Report', icon: FileText, color: 'text-amber-600' },
    { id: 'project', label: 'Project Docs', icon: FolderTree, color: 'text-indigo-600' },
    { id: 'github', label: 'GitHub', icon: Github, color: 'text-slate-700' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  AMS
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Attachment System
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  Demo Student
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  demo@student.edu
                </p>
              </div>
              <button className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your industrial attachment activities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'logs' && <LogsContent />}
          {activeTab === 'monthly-reports' && <MonthlyReportsContent />}
          {activeTab === 'final-report' && <FinalReportContent />}
          {activeTab === 'project' && <ProjectContent />}
          {activeTab === 'github' && <GithubContent />}
        </main>
      </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-4">
          Welcome to Your Dashboard
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Manage your industrial attachment activities, generate AI-powered reports, and track your progress
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group hover:shadow-xl transition-all border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <Clipboard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                  Log Sheets
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Daily & weekly activity logging with skills tracking
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-violet-600 hover:bg-violet-700">
              Start Logging
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  Monthly Reports
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-powered monthly reports generated from your logs
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Final Report
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complete industrial attachment report with analysis
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Create Report
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Project Docs
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Software engineering methodology documentation
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Start Project
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all border-2 border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-700 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-slate-700 transition-colors">
                  GitHub Integration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Version control and automatic backups
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-slate-700 hover:bg-slate-800">
              Connect
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-600" />
            Your Progress Overview
          </CardTitle>
          <CardDescription>
            Track your industrial attachment journey and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-2xl border border-violet-200 dark:border-violet-800">
              <div className="text-4xl font-bold text-violet-600 mb-2">0</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Log Entries</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">This week</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-4xl font-bold text-emerald-600 mb-2">0</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Reports Generated</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Total</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="text-4xl font-bold text-amber-600 mb-2">0%</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Project Progress</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Completion</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Days Logged</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">This month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LogsContent() {
  const demoStudentId = 'demo-student-id'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Log Sheets
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Record your daily activities during industrial attachment
        </p>
      </div>

      <LogEntryForm studentId={demoStudentId} />
    </div>
  )
}

function MonthlyReportsContent() {
  const demoStudentId = 'demo-student-id'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Monthly Reports
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Auto-generated reports from your log entries
        </p>
      </div>

      <MonthlyReportComponent studentId={demoStudentId} />
    </div>
  )
}

function FinalReportContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Final Industrial Attachment Report
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Complete your attachment report with all required sections
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Final Report Builder</CardTitle>
          <CardDescription>
            Create your comprehensive industrial attachment final report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Final report builder will be implemented here</p>
            <p className="text-sm">This will include all sections required for the final report</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Project Documentation
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Create comprehensive project documentation following software engineering methodology
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Chapters</CardTitle>
          <CardDescription>
            Work through each chapter of your project documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              'Chapter 1: Introduction',
              'Chapter 2: Planning',
              'Chapter 3: Analysis',
              'Chapter 4: Design',
              'Chapter 5: Implementation',
              'Appendices'
            ].map((chapter, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{chapter}</span>
                </div>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GithubContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          GitHub Integration
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Connect to GitHub for version control and automatic backups
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connect Your Repository</CardTitle>
          <CardDescription>
            Enter your GitHub repository details to enable automatic backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <Github className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>GitHub integration setup will be implemented here</p>
            <p className="text-sm">This will allow you to sync your documents with GitHub</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}