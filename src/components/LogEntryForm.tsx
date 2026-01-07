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
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'
import { AILogSuggestion } from './AILogSuggestion'

interface LogEntryFormProps {
  studentId?: string
}

export function LogEntryForm({ studentId: propStudentId }: LogEntryFormProps) {
  const { studentId, refreshStats } = useApp()
  const { toast } = useToast()
  const actualStudentId = propStudentId || studentId
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

  const handleAISuggestion = (suggestion: string) => {
    const descriptionMatch = suggestion.match(/\*\*Detailed Description:\*\*\n([\s\S]*?)\n\n/);
    const skillsMatch = suggestion.match(/\*\*Skills & Knowledge Applied:\*\*\n([\s\S]*?)\n\n/);
    const challengesMatch = suggestion.match(/\*\*Challenges & Resolutions:\*\*\n([\s\S]*?)\n\n/);
    const learningsMatch = suggestion.match(/\*\*Key Learnings & Takeaways:\*\*\n([\s\S]*?)\n\n/);
    const impactMatch = suggestion.match(/\*\*Impact:\*\*\n([\s\S]*?)$/);

    const newFormData: Partial<typeof formData> = {};

    if (descriptionMatch && descriptionMatch[1]) {
      newFormData.activities = descriptionMatch[1].trim();
    }

    if (challengesMatch && challengesMatch[1]) {
      const challengeText = challengesMatch[1];
      const challengeRes = challengeText.split('- **Resolution:**');
      const challenge = challengeRes[0].replace('- **Challenge:**', '').trim();
      newFormData.challenges = challenge;
      if (challengeRes.length > 1) {
        newFormData.solutions = challengeRes[1].trim();
      }
    }

    let reflectionText = '';
    if (learningsMatch && learningsMatch[1]) {
      reflectionText += learningsMatch[1].trim();
    }
    if (impactMatch && impactMatch[1]) {
      reflectionText += `\n\n**Impact:**\n${impactMatch[1].trim()}`;
    }
    if (reflectionText) {
      newFormData.reflection = reflectionText;
    }

    setFormData(prev => ({ ...prev, ...newFormData }));

    if (skillsMatch && skillsMatch[1]) {
      const parsedSkills = skillsMatch[1]
        .split('\n')
        .map(s => s.replace(/^- /g, '').trim()) // remove leading dash
        .map(s => {
          // Extracts skill from "**Skill:** Description"
          const match = s.match(/\*\*(.*?):\*\*/);
          if (match && match[1]) {
            return match[1];
          }
          // Extracts skill from "- Skill"
          return s.replace(/^- /g, '').trim();
        })
        .filter(Boolean);
      setSkills(prev => [...new Set([...prev, ...parsedSkills])]);
    }
  };

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
      const response = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `Log_Entry_${formData.date}.txt`,
          content: logContent,
          type: 'log',
          studentId: actualStudentId
        })
      })

      if (response.ok) {
        console.log('Log entry saved successfully')
        // Refresh stats
        await refreshStats()
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
        toast({
          title: "Success",
          description: "Log entry saved successfully!",
        })
      } else {
        console.error('Failed to save log entry')
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save log entry. Please try again.",
        })
      }
    } catch (error) {
      console.error('Error saving log entry:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving log entry. Please try again.",
      })
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
      <AILogSuggestion onSuggestion={handleAISuggestion} />
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

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Log Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
