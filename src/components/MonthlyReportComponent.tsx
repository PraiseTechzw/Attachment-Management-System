'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Calendar, TrendingUp, Target, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/contexts/AppContext'

interface MonthlyReportProps {
  studentId?: string
}

export function MonthlyReportComponent({ studentId: propStudentId }: MonthlyReportProps) {
  const { studentId, refreshStats } = useApp()
  const actualStudentId = propStudentId || studentId
  const [reportData, setReportData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: '',
    supervisor: '',
    totalHours: 0,
    daysWorked: 0,
    keyAchievements: '',
    skillsDeveloped: '',
    projectsWorked: '',
    challenges: '',
    learningOutcomes: '',
    futureGoals: '',
    supervisorFeedback: '',
    selfAssessment: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateReport = async () => {
    setIsGenerating(true)
    
    // Create the report content
    const report = `
MONTHLY ATTACHMENT REPORT
${months[reportData.month - 1]} ${reportData.year}

STUDENT INFORMATION
Student ID: ${studentId}
Department: ${reportData.department}
Supervisor: ${reportData.supervisor}

ATTENDANCE SUMMARY
Total Hours Worked: ${reportData.totalHours}
Days Worked: ${reportData.daysWorked}
Average Hours per Day: ${reportData.daysWorked > 0 ? (reportData.totalHours / reportData.daysWorked).toFixed(1) : 0}

KEY ACHIEVEMENTS
${reportData.keyAchievements}

SKILLS DEVELOPED
${reportData.skillsDeveloped}

PROJECTS WORKED ON
${reportData.projectsWorked}

CHALLENGES ENCOUNTERED
${reportData.challenges}

LEARNING OUTCOMES
${reportData.learningOutcomes}

FUTURE GOALS
${reportData.futureGoals}

SUPERVISOR FEEDBACK
${reportData.supervisorFeedback}

SELF ASSESSMENT
${reportData.selfAssessment}

Generated on: ${new Date().toLocaleDateString()}
    `
    
    try {
      // Save to upload directory
      const response = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `Monthly_Report_${months[reportData.month - 1]}_${reportData.year}.txt`,
          content: report,
          type: 'report',
          studentId
        })
      })

      if (response.ok) {
        setGeneratedReport(report)
        console.log('Monthly report saved successfully')
      } else {
        console.error('Failed to save monthly report')
        alert('Failed to save report. Please try again.')
      }
    } catch (error) {
      console.error('Error saving monthly report:', error)
      alert('Error saving report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    if (!generatedReport) return
    
    const blob = new Blob([generatedReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Monthly_Report_${months[reportData.month - 1]}_${reportData.year}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Monthly Report Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive monthly reports from your log entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Period */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Month
              </Label>
              <Select 
                value={reportData.month.toString()} 
                onValueChange={(value) => handleInputChange('month', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={reportData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={reportData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Your department"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total Hours Worked</Label>
              <Input
                type="number"
                value={reportData.totalHours}
                onChange={(e) => handleInputChange('totalHours', parseInt(e.target.value))}
                placeholder="160"
              />
            </div>
            <div className="space-y-2">
              <Label>Days Worked</Label>
              <Input
                type="number"
                value={reportData.daysWorked}
                onChange={(e) => handleInputChange('daysWorked', parseInt(e.target.value))}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label>Supervisor</Label>
              <Input
                value={reportData.supervisor}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                placeholder="Supervisor name"
              />
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Key Achievements
              </Label>
              <Textarea
                value={reportData.keyAchievements}
                onChange={(e) => handleInputChange('keyAchievements', e.target.value)}
                placeholder="List your major accomplishments this month..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Skills Developed
              </Label>
              <Textarea
                value={reportData.skillsDeveloped}
                onChange={(e) => handleInputChange('skillsDeveloped', e.target.value)}
                placeholder="Describe new skills and competencies gained..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Projects Worked On
              </Label>
              <Textarea
                value={reportData.projectsWorked}
                onChange={(e) => handleInputChange('projectsWorked', e.target.value)}
                placeholder="Detail the projects and tasks you contributed to..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Challenges Encountered</Label>
                <Textarea
                  value={reportData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder="Describe difficulties faced..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Learning Outcomes</Label>
                <Textarea
                  value={reportData.learningOutcomes}
                  onChange={(e) => handleInputChange('learningOutcomes', e.target.value)}
                  placeholder="What did you learn from these experiences..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Future Goals</Label>
              <Textarea
                value={reportData.futureGoals}
                onChange={(e) => handleInputChange('futureGoals', e.target.value)}
                placeholder="Your objectives for the next month..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Self Assessment</Label>
              <Textarea
                value={reportData.selfAssessment}
                onChange={(e) => handleInputChange('selfAssessment', e.target.value)}
                placeholder="Evaluate your performance and growth..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            
            {generatedReport && (
              <Button 
                onClick={downloadReport}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Preview */}
      {generatedReport && (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Generated Report Preview</CardTitle>
            <CardDescription>
              Review your monthly report before downloading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono">
                {generatedReport}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Reports */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Previous Reports</CardTitle>
          <CardDescription>Access your previously generated monthly reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No previous reports</p>
            <p className="text-xs">Generated reports will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}