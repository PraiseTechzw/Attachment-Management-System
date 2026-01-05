'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clipboard, Plus, Trash2, Edit } from 'lucide-react'

interface LogEntry {
  id?: string
  date: string
  time?: string
  activity: string
  skills?: string
  challenges?: string
  solutions?: string
  category?: string
}

export function LogEntryForm({ studentId }: { studentId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [formData, setFormData] = useState<LogEntry>({
    date: new Date().toISOString().split('T')[0],
    time: '',
    activity: '',
    skills: '',
    challenges: '',
    solutions: '',
    category: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [studentId])

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs?studentId=${studentId}`)
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingId ? `/api/logs/${editingId}` : '/api/logs'
      const method = editingId ? 'PUT' : 'POST'
      const body = { ...formData, studentId }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchLogs()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving log:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (log: LogEntry) => {
    setFormData(log)
    setEditingId(log.id || null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return

    try {
      const response = await fetch(`/api/logs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchLogs()
      }
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '',
      activity: '',
      skills: '',
      challenges: '',
      solutions: '',
      category: ''
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Log Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-violet-600" />
            {editingId ? 'Edit Log Entry' : 'New Log Entry'}
          </CardTitle>
          <CardDescription>
            Record your daily activities, skills learned, and challenges faced
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Software Development</SelectItem>
                  <SelectItem value="maintenance">System Maintenance</SelectItem>
                  <SelectItem value="research">Research & Learning</SelectItem>
                  <SelectItem value="meetings">Meetings</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Description *</Label>
              <Textarea
                id="activity"
                placeholder="Describe what you did during this session..."
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills Gained</Label>
              <Textarea
                id="skills"
                placeholder="What skills did you learn or practice?"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges Faced</Label>
              <Textarea
                id="challenges"
                placeholder="Any difficulties or challenges encountered?"
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solutions">Solutions Applied</Label>
              <Textarea
                id="solutions"
                placeholder="How did you solve the challenges?"
                value={formData.solutions}
                onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {loading ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Log Entries</CardTitle>
          <CardDescription>
            Your latest activity logs ({logs.length} entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clipboard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No log entries yet</p>
              <p className="text-sm">Start by adding your first log entry above</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-violet-600">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                        {log.time && (
                          <span className="text-sm text-slate-500">
                            {log.time}
                          </span>
                        )}
                        {log.category && (
                          <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded-full">
                            {log.category}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 dark:text-white mb-2">
                        {log.activity}
                      </p>
                      {log.skills && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          <span className="font-medium">Skills:</span> {log.skills}
                        </p>
                      )}
                      {log.challenges && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          <span className="font-medium">Challenges:</span> {log.challenges}
                        </p>
                      )}
                      {log.solutions && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Solutions:</span> {log.solutions}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(log)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(log.id!)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
