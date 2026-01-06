'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

interface FinalReportFormProps {
  studentId?: string
}

export function FinalReportForm({ studentId: propStudentId }: FinalReportFormProps) {
  const { studentId, refreshStats } = useApp()
  const { toast } = useToast()
  const actualStudentId = propStudentId || studentId
  const [currentSection, setCurrentSection] = useState(0)
  const [reportData, setReportData] = useState({
    // Basic Information
    studentName: '',
    studentId: actualStudentId,
    program: '',
    year: '',
    organization: '',
    department: '',
    supervisor: '',
    attachmentPeriod: {
      startDate: '',
      endDate: ''
    },
    
    // Executive Summary
    executiveSummary: '',
    
    // Organization Overview
    organizationBackground: '',
    organizationStructure: '',
    departmentRole: '',
    
    // Activities and Tasks
    dailyActivities: '',
    majorProjects: '',
    technicalSkills: '',
    softSkills: '',
    
    // Learning Outcomes
    theoreticalApplication: '',
    practicalExperience: '',
    professionalDevelopment: '',
    
    // Challenges and Solutions
    challengesFaced: '',
    solutionsImplemented: '',
    lessonsLearned: '',
    
    // Recommendations
    organizationRecommendations: '',
    programRecommendations: '',
    futureStudents: '',
    
    // Conclusion
    overallExperience: '',
    careerImpact: '',
    acknowledgments: ''
  })

  const sections = [
    { id: 0, title: 'Basic Information', icon: '📋' },
    { id: 1, title: 'Executive Summary', icon: '📊' },
    { id: 2, title: 'Organization Overview', icon: '🏢' },
    { id: 3, title: 'Activities & Tasks', icon: '⚡' },
    { id: 4, title: 'Learning Outcomes', icon: '🎓' },
    { id: 5, title: 'Challenges & Solutions', icon: '🔧' },
    { id: 6, title: 'Recommendations', icon: '💡' },
    { id: 7, title: 'Conclusion', icon: '✅' }
  ]

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setReportData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setReportData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const getCompletionPercentage = () => {
    const totalFields = Object.keys(reportData).length
    const completedFields = Object.values(reportData).filter(value => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== '')
      }
      return value !== ''
    }).length
    return Math.round((completedFields / totalFields) * 100)
  }

  const generateFinalReport = async () => {
    const report = `
INDUSTRIAL ATTACHMENT FINAL REPORT

STUDENT INFORMATION
Name: ${reportData.studentName}
Student ID: ${reportData.studentId}
Program: ${reportData.program}
Year: ${reportData.year}

ORGANIZATION DETAILS
Organization: ${reportData.organization}
Department: ${reportData.department}
Supervisor: ${reportData.supervisor}
Period: ${reportData.attachmentPeriod.startDate} to ${reportData.attachmentPeriod.endDate}

EXECUTIVE SUMMARY
${reportData.executiveSummary}

1. ORGANIZATION OVERVIEW
1.1 Background
${reportData.organizationBackground}

1.2 Organizational Structure
${reportData.organizationStructure}

1.3 Department Role
${reportData.departmentRole}

2. ACTIVITIES AND TASKS PERFORMED
2.1 Daily Activities
${reportData.dailyActivities}

2.2 Major Projects
${reportData.majorProjects}

2.3 Technical Skills Developed
${reportData.technicalSkills}

2.4 Soft Skills Developed
${reportData.softSkills}

3. LEARNING OUTCOMES
3.1 Application of Theoretical Knowledge
${reportData.theoreticalApplication}

3.2 Practical Experience Gained
${reportData.practicalExperience}

3.3 Professional Development
${reportData.professionalDevelopment}

4. CHALLENGES AND SOLUTIONS
4.1 Challenges Faced
${reportData.challengesFaced}

4.2 Solutions Implemented
${reportData.solutionsImplemented}

4.3 Lessons Learned
${reportData.lessonsLearned}

5. RECOMMENDATIONS
5.1 For the Organization
${reportData.organizationRecommendations}

5.2 For the Academic Program
${reportData.programRecommendations}

5.3 For Future Students
${reportData.futureStudents}

6. CONCLUSION
6.1 Overall Experience
${reportData.overallExperience}

6.2 Career Impact
${reportData.careerImpact}

6.3 Acknowledgments
${reportData.acknowledgments}

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
          filename: `Final_Attachment_Report_${reportData.studentId}.txt`,
          content: report,
          type: 'report',
          studentId: actualStudentId
        })
      })

      if (response.ok) {
        console.log('Final report saved successfully')
        await refreshStats()
        // Also download the file
        const blob = new Blob([report], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Final_Attachment_Report_${reportData.studentId}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "Final report saved and downloaded successfully!",
        })
      } else {
        console.error('Failed to save final report')
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save report. Please try again.",
        })
      }
    } catch (error) {
      console.error('Error saving final report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving report. Please try again.",
      })
    }
  }

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input
                  value={reportData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Program</Label>
                <Input
                  value={reportData.program}
                  onChange={(e) => handleInputChange('program', e.target.value)}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Year of Study</Label>
                <Select value={reportData.year} onValueChange={(value) => handleInputChange('year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input
                  value={reportData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Company/Organization name"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={reportData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Department/Unit"
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
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={reportData.attachmentPeriod.startDate}
                  onChange={(e) => handleInputChange('attachmentPeriod.startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={reportData.attachmentPeriod.endDate}
                  onChange={(e) => handleInputChange('attachmentPeriod.endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 1: // Executive Summary
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Executive Summary</Label>
              <Textarea
                value={reportData.executiveSummary}
                onChange={(e) => handleInputChange('executiveSummary', e.target.value)}
                placeholder="Provide a concise overview of your attachment experience, key achievements, and learning outcomes..."
                rows={6}
              />
              <p className="text-xs text-slate-500">
                This should be a brief summary (200-300 words) of your entire attachment experience.
              </p>
            </div>
          </div>
        )

      case 2: // Organization Overview
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Background</Label>
              <Textarea
                value={reportData.organizationBackground}
                onChange={(e) => handleInputChange('organizationBackground', e.target.value)}
                placeholder="Describe the organization's history, mission, vision, and core business..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Organizational Structure</Label>
              <Textarea
                value={reportData.organizationStructure}
                onChange={(e) => handleInputChange('organizationStructure', e.target.value)}
                placeholder="Explain the organizational hierarchy and reporting structure..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Department Role</Label>
              <Textarea
                value={reportData.departmentRole}
                onChange={(e) => handleInputChange('departmentRole', e.target.value)}
                placeholder="Describe your department's role within the organization..."
                rows={3}
              />
            </div>
          </div>
        )

      case 3: // Activities & Tasks
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Activities</Label>
              <Textarea
                value={reportData.dailyActivities}
                onChange={(e) => handleInputChange('dailyActivities', e.target.value)}
                placeholder="Describe your typical daily activities and responsibilities..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Major Projects</Label>
              <Textarea
                value={reportData.majorProjects}
                onChange={(e) => handleInputChange('majorProjects', e.target.value)}
                placeholder="Detail the major projects you worked on..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Technical Skills Developed</Label>
              <Textarea
                value={reportData.technicalSkills}
                onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                placeholder="List and describe technical skills you developed..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Soft Skills Developed</Label>
              <Textarea
                value={reportData.softSkills}
                onChange={(e) => handleInputChange('softSkills', e.target.value)}
                placeholder="Describe soft skills like communication, teamwork, leadership..."
                rows={3}
              />
            </div>
          </div>
        )

      case 4: // Learning Outcomes
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Application of Theoretical Knowledge</Label>
              <Textarea
                value={reportData.theoreticalApplication}
                onChange={(e) => handleInputChange('theoreticalApplication', e.target.value)}
                placeholder="How did you apply classroom knowledge in practice..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Practical Experience Gained</Label>
              <Textarea
                value={reportData.practicalExperience}
                onChange={(e) => handleInputChange('practicalExperience', e.target.value)}
                placeholder="Describe new practical skills and experience gained..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Professional Development</Label>
              <Textarea
                value={reportData.professionalDevelopment}
                onChange={(e) => handleInputChange('professionalDevelopment', e.target.value)}
                placeholder="How has this experience contributed to your professional growth..."
                rows={4}
              />
            </div>
          </div>
        )

      case 5: // Challenges & Solutions
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Challenges Faced</Label>
              <Textarea
                value={reportData.challengesFaced}
                onChange={(e) => handleInputChange('challengesFaced', e.target.value)}
                placeholder="Describe the main challenges you encountered..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Solutions Implemented</Label>
              <Textarea
                value={reportData.solutionsImplemented}
                onChange={(e) => handleInputChange('solutionsImplemented', e.target.value)}
                placeholder="How did you address these challenges..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Lessons Learned</Label>
              <Textarea
                value={reportData.lessonsLearned}
                onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                placeholder="What key lessons did you learn from these experiences..."
                rows={4}
              />
            </div>
          </div>
        )

      case 6: // Recommendations
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recommendations for the Organization</Label>
              <Textarea
                value={reportData.organizationRecommendations}
                onChange={(e) => handleInputChange('organizationRecommendations', e.target.value)}
                placeholder="Suggest improvements for the organization..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Recommendations for the Academic Program</Label>
              <Textarea
                value={reportData.programRecommendations}
                onChange={(e) => handleInputChange('programRecommendations', e.target.value)}
                placeholder="Suggest improvements for the academic program..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Advice for Future Students</Label>
              <Textarea
                value={reportData.futureStudents}
                onChange={(e) => handleInputChange('futureStudents', e.target.value)}
                placeholder="What advice would you give to future attachment students..."
                rows={4}
              />
            </div>
          </div>
        )

      case 7: // Conclusion
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Overall Experience</Label>
              <Textarea
                value={reportData.overallExperience}
                onChange={(e) => handleInputChange('overallExperience', e.target.value)}
                placeholder="Summarize your overall attachment experience..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Career Impact</Label>
              <Textarea
                value={reportData.careerImpact}
                onChange={(e) => handleInputChange('careerImpact', e.target.value)}
                placeholder="How has this experience influenced your career goals..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Acknowledgments</Label>
              <Textarea
                value={reportData.acknowledgments}
                onChange={(e) => handleInputChange('acknowledgments', e.target.value)}
                placeholder="Acknowledge people who helped during your attachment..."
                rows={4}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Final Report Progress
          </CardTitle>
          <CardDescription>
            Complete all sections to generate your final attachment report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-slate-600">{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={currentSection === section.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSection(section.id)}
                  className="justify-start text-xs"
                >
                  <span className="mr-1">{section.icon}</span>
                  {section.title}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Section */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{sections[currentSection].icon}</span>
            {sections[currentSection].title}
          </CardTitle>
          <CardDescription>
            Section {currentSection + 1} of {sections.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderSection()}
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentSection === sections.length - 1 ? (
                <Button
                  onClick={generateFinalReport}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Final Report
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}