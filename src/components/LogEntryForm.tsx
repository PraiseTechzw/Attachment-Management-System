'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Plus, Save, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LogEntryFormProps {
  studentId: string
}

export function LogEntryForm({ studentId }: LogEntryFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    department: '',
    supervisor: '',
    activities: '',
    skillsLearned: '',
    challenges: '',
    solutions: '',
    reflection: '',
    attachments: [] as string[]
  })

  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  const departments = [
    'Information Technology',
    'Software Development',
    'Network Administration',
    'Database Management',
    'Cybersecurity',
    'Project Management',
    'Quality Assurance',
    'Technical Support',
    'Research & Development',
    'Other'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const logEntry = {
      ...formData,
      skillsLearned: skills.join(', '),
      studentId,
      createdAt: new Date().toISOString()
    }
    
    // Create formatted log entry content
    const logContent = `
DAILY ACTIVITY LOG ENTRY
Date: ${formData.date}
Time: ${formData.startTime} - ${formData.endTime} (${calculateHours()} hours)
Department: ${formData.department}
Supervisor: ${formData.supervisor}

ACTIVITIES PERFORMED:
${formData.activities}

SKILLS & KNOWLEDGE GAINED:
${skills.join(', ')}

CHALLENGES ENCOUNTERED:
${formData.challenges}

SOLUTIONS & APPROACHES:
${formData.solutions}

DAILY REFLECTION:
${formData.reflection}

Generated on: ${new Date().toLocaleString()}
    `
    
    try {
      // Save to upload directory
      const response = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `Log_Entry_${formData.date}.txt`,
          content: logContent,
          type: 'log',
          studentId
        })
      })

      if (response.ok) {
        console.log('Log entry saved successfully')
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '17:00',
          department: '',
          supervisor: '',
          activities: '',
          skillsLearned: '',
          challenges: '',
          solutions: '',
          reflection: '',
          attachments: []
        })
        setSkills([])
        
        // Show success message (you could add a toast notification here)
        alert('Log entry saved successfully!')
      } else {
        console.error('Failed to save log entry')
        alert('Failed to save log entry. Please try again.')
      }
    } catch (error) {
      console.error('Error saving log entry:', error)
      alert('Error saving log entry. Please try again.')
    }
  }

  const calculateHours = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return diff > 0 ? diff.toFixed(1) : '0'
    }
    return '0'
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Daily Activity Log Entry
          </CardTitle>
          <CardDescription>
            Record your daily activities, learning outcomes, and reflections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">
                  Total Hours: {calculateHours()}
                </p>
              </div>
            </div>

            {/* Department and Supervisor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department/Unit</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor/Mentor</Label>
                <Input
                  id="supervisor"
                  value={formData.supervisor}
                  onChange={(e) => handleInputChange('supervisor', e.target.value)}
                  placeholder="Name of supervisor or mentor"
                  required
                />
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-2">
              <Label htmlFor="activities">Activities Performed</Label>
              <Textarea
                id="activities"
                value={formData.activities}
                onChange={(e) => handleInputChange('activities', e.target.value)}
                placeholder="Describe the tasks and activities you performed today..."
                rows={4}
                required
              />
            </div>

            {/* Skills Learned */}
            <div className="space-y-2">
              <Label>Skills & Knowledge Gained</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill or knowledge area"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Challenges and Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges Encountered</Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder="Describe any difficulties or obstacles..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solutions">Solutions & Approaches</Label>
                <Textarea
                  id="solutions"
                  value={formData.solutions}
                  onChange={(e) => handleInputChange('solutions', e.target.value)}
                  placeholder="How did you address the challenges..."
                  rows={3}
                />
              </div>
            </div>

            {/* Reflection */}
            <div className="space-y-2">
              <Label htmlFor="reflection">Daily Reflection</Label>
              <Textarea
                id="reflection"
                value={formData.reflection}
                onChange={(e) => handleInputChange('reflection', e.target.value)}
                placeholder="Reflect on your learning experience, what went well, areas for improvement..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Log Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Entries Preview */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Recent Log Entries</CardTitle>
          <CardDescription>Your latest activity logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No log entries yet</p>
            <p className="text-xs">Your saved entries will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}