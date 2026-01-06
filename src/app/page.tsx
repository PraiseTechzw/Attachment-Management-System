'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, FolderTree, Github, Clipboard, Activity, Settings, User, Zap, Menu, X, Home as HomeIcon } from 'lucide-react'
import { LogEntryForm } from '@/components/LogEntryForm'
import { MonthlyReportComponent } from '@/components/MonthlyReportComponent'
import { FinalReportForm } from '@/components/FinalReportForm'
import { ProjectForm } from '@/components/ProjectForm'
import { DocumentViewer } from '@/components/DocumentViewer'
import { AppProvider, useApp } from '@/contexts/AppContext'

function HomeContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, color: 'text-violet-600' },
    { id: 'logs', label: 'Log Sheets', icon: Clipboard, color: 'text-blue-600' },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: FileText, color: 'text-emerald-600' },
    { id: 'final-report', label: 'Final Report', icon: FileText, color: 'text-amber-600' },
    { id: 'project', label: 'Project Docs', icon: FolderTree, color: 'text-indigo-600' },
    { id: 'guidelines', label: 'Guidelines', icon: BookOpen, color: 'text-purple-600' },
    { id: 'github', label: 'GitHub', icon: Github, color: 'text-slate-700' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                AMS
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                  Demo Student
                </p>
              </div>
              <button className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                <Settings className="w-3 h-3 text-slate-500" />
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
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h2>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
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
          {activeTab === 'guidelines' && <GuidelinesContent />}
          {activeTab === 'github' && <GithubContent />}
        </main>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { stats, isLoading } = useApp()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Logs</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalLogs}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                  {stats.totalLogs > 0 ? 'Active logging' : 'Start logging today'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Clipboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            {/* Mini chart */}
            <div className="mt-4 flex items-end space-x-1 h-8">
              {[4, 6, 8, 5, 9, 7, Math.max(12, stats.totalLogs)].map((height, i) => (
                <div key={i} className="bg-blue-200 dark:bg-blue-800 rounded-sm flex-1" style={{height: `${height * 2}px`}}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reports</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.reports}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                  {stats.reports > 0 ? `${stats.reports} generated` : 'No reports yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            {/* Mini chart */}
            <div className="mt-4 flex items-end space-x-1 h-8">
              {[2, 3, 1, 4, 2, 5, Math.max(8, stats.reports)].map((height, i) => (
                <div key={i} className="bg-emerald-200 dark:bg-emerald-800 rounded-sm flex-1" style={{height: `${height * 2}px`}}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Projects</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.projects}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center mt-1">
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
                  {stats.projects > 0 ? `${stats.projects} documented` : 'No projects yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            {/* Progress rings */}
            <div className="mt-4 flex space-x-2">
              {[...Array(Math.max(3, stats.projects))].map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 ${
                  i < stats.projects 
                    ? 'border-amber-500 dark:border-amber-400' 
                    : 'border-amber-200 dark:border-amber-800'
                }`}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Days Active</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.daysActive}</p>
                <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center mt-1">
                  <span className="inline-block w-2 h-2 bg-violet-500 rounded-full mr-1"></span>
                  {stats.daysActive > 0 ? `${Math.round((stats.daysActive / 60) * 100)}% progress` : 'Start your journey'}
                </p>
              </div>
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            {/* Circular progress */}
            <div className="mt-4 flex justify-center">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${Math.min(89, (stats.daysActive / 60) * 100)}, 100`}
                    className="text-violet-500 dark:text-violet-400"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-200 dark:text-slate-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {Math.round((stats.daysActive / 60) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Activity</CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              Log entries over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 flex items-end justify-between space-x-2">
              {[
                { day: 'Mon', value: 8, color: 'bg-blue-500' },
                { day: 'Tue', value: 12, color: 'bg-blue-500' },
                { day: 'Wed', value: 6, color: 'bg-blue-500' },
                { day: 'Thu', value: 15, color: 'bg-blue-500' },
                { day: 'Fri', value: 10, color: 'bg-blue-500' },
                { day: 'Sat', value: 4, color: 'bg-blue-300' },
                { day: 'Sun', value: 2, color: 'bg-blue-300' }
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${item.color} rounded-t-md transition-all hover:opacity-80`}
                    style={{ height: `${item.value * 8}px` }}
                  ></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Skills Progress</CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              Development areas and competency levels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {[
              { skill: 'Frontend Development', progress: 85, color: 'bg-blue-500' },
              { skill: 'Backend Development', progress: 70, color: 'bg-emerald-500' },
              { skill: 'Database Management', progress: 60, color: 'bg-amber-500' },
              { skill: 'Project Management', progress: 45, color: 'bg-violet-500' },
              { skill: 'Documentation', progress: 90, color: 'bg-rose-500' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.skill}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 group" onClick={() => setActiveTab('logs')}>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
                <Clipboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900 dark:text-white">New Log Entry</div>
                <div className="text-xs text-slate-500">Record daily activities</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950 group" onClick={() => setActiveTab('monthly-reports')}>
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900 dark:text-white">Generate Report</div>
                <div className="text-xs text-slate-500">Create monthly report</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4 hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950 group" onClick={() => setActiveTab('project')}>
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50">
                <FolderTree className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900 dark:text-white">New Project</div>
                <div className="text-xs text-slate-500">Start project documentation</div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950 group" onClick={() => setActiveTab('guidelines')}>
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50">
                <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900 dark:text-white">View Guidelines</div>
                <div className="text-xs text-slate-500">Access templates & docs</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {stats.totalLogs === 0 && stats.reports === 0 && stats.projects === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs">Start by creating your first log entry</p>
                </div>
              ) : (
                <>
                  {stats.totalLogs > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Clipboard className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Created {stats.totalLogs} log entries</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Daily activity logging</p>
                      </div>
                    </div>
                  )}
                  {stats.reports > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Generated {stats.reports} reports</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Monthly and final reports</p>
                      </div>
                    </div>
                  )}
                  {stats.projects > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <FolderTree className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Documented {stats.projects} projects</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Project documentation</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[
                { task: 'Submit weekly report', due: 'Tomorrow', priority: 'high' },
                { task: 'Complete project milestone', due: 'In 3 days', priority: 'medium' },
                { task: 'Update documentation', due: 'Next week', priority: 'low' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className={`w-2 h-2 rounded-full ${
                    item.priority === 'high' ? 'bg-red-500' : 
                    item.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.task}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LogsContent() {
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

      <LogEntryForm />
    </div>
  )
}

function MonthlyReportsContent() {
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

      <MonthlyReportComponent />
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

      <FinalReportForm />
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

      <ProjectForm />
    </div>
  )
}

function GuidelinesContent() {
  return (
    <div className="space-y-6">
      <DocumentViewer />
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

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  )
}