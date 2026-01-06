'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderTree, Download, Plus, Trash2, FileText, Code, Database, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/contexts/AppContext'
import { showToast } from '@/components/ui/toast'

interface ProjectFormProps {
  studentId?: string
}

interface ProjectPhase {
  id: string
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed'
  startDate: string
  endDate: string
}

export function ProjectForm({ studentId: propStudentId }: ProjectFormProps) {
  const { studentId, refreshStats } = useApp()
  const actualStudentId = propStudentId || studentId
  const [projectData, setProjectData] = useState({
    projectTitle: '',
    projectType: '',
    description: '',
    objectives: '',
    scope: '',
    methodology: '',
    technologies: [] as string[],
    timeline: '',
    expectedOutcomes: '',
    riskAssessment: '',
    resources: '',
    stakeholders: '',
    successCriteria: '',
    documentation: ''
  })

  const [phases, setPhases] = useState<ProjectPhase[]>([
    {
      id: '1',
      name: 'Project Planning',
      description: 'Define requirements and create project plan',
      status: 'not-started',
      startDate: '',
      endDate: ''
    },
    {
      id: '2',
      name: 'Design & Architecture',
      description: 'Create system design and architecture',
      status: 'not-started',
      startDate: '',
      endDate: ''
    },
    {
      id: '3',
      name: 'Implementation',
      description: 'Develop the solution',
      status: 'not-started',
      startDate: '',
      endDate: ''
    },
    {
      id: '4',
      name: 'Testing & Quality Assurance',
      description: 'Test and validate the solution',
      status: 'not-started',
      startDate: '',
      endDate: ''
    },
    {
      id: '5',
      name: 'Deployment & Documentation',
      description: 'Deploy solution and complete documentation',
      status: 'not-started',
      startDate: '',
      endDate: ''
    }
  ])

  const [newTechnology, setNewTechnology] = useState('')

  const projectTypes = [
    'Web Application',
    'Mobile Application',
    'Desktop Application',
    'Database System',
    'Network Infrastructure',
    'Security System',
    'Data Analysis',
    'Machine Learning',
    'IoT Solution',
    'API Development',
    'System Integration',
    'Other'
  ]

  const commonTechnologies = [
    'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
    'PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Jenkins'
  ]

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTechnology = (tech: string) => {
    if (tech && !projectData.technologies.includes(tech)) {
      setProjectData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }))
    }
    setNewTechnology('')
  }

  const removeTechnology = (tech: string) => {
    setProjectData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const updatePhase = (phaseId: string, field: string, value: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, [field]: value } : phase
    ))
  }

  const addPhase = () => {
    const newPhase: ProjectPhase = {
      id: Date.now().toString(),
      name: '',
      description: '',
      status: 'not-started',
      startDate: '',
      endDate: ''
    }
    setPhases(prev => [...prev, newPhase])
  }

  const removePhase = (phaseId: string) => {
    setPhases(prev => prev.filter(phase => phase.id !== phaseId))
  }

  const generateProjectDocument = async () => {
    const document = `
PROJECT DOCUMENTATION
${projectData.projectTitle}

STUDENT INFORMATION
Student ID: ${studentId}
Project Type: ${projectData.projectType}

1. PROJECT OVERVIEW
1.1 Description
${projectData.description}

1.2 Objectives
${projectData.objectives}

1.3 Scope
${projectData.scope}

2. METHODOLOGY
${projectData.methodology}

3. TECHNOLOGIES
${projectData.technologies.join(', ')}

4. PROJECT PHASES
${phases.map((phase, index) => `
${index + 1}. ${phase.name}
   Description: ${phase.description}
   Status: ${phase.status}
   Timeline: ${phase.startDate} to ${phase.endDate}
`).join('')}

5. TIMELINE
${projectData.timeline}

6. EXPECTED OUTCOMES
${projectData.expectedOutcomes}

7. RISK ASSESSMENT
${projectData.riskAssessment}

8. RESOURCES REQUIRED
${projectData.resources}

9. STAKEHOLDERS
${projectData.stakeholders}

10. SUCCESS CRITERIA
${projectData.successCriteria}

11. DOCUMENTATION PLAN
${projectData.documentation}

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
          filename: `Project_Documentation_${projectData.projectTitle.replace(/\s+/g, '_')}.txt`,
          content: document,
          type: 'project',
          studentId: actualStudentId
        })
      })

      if (response.ok) {
        console.log('Project documentation saved successfully')
        await refreshStats()
        // Also download the file
        const blob = new Blob([document], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Project_Documentation_${projectData.projectTitle.replace(/\s+/g, '_')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        showToast('success', 'Project documentation saved and downloaded successfully!')
      } else {
        console.error('Failed to save project documentation')
        showToast('error', 'Failed to save documentation. Please try again.')
      }
    } catch (error) {
      console.error('Error saving project documentation:', error)
      showToast('error', 'Error saving documentation. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'in-progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            Project Documentation
          </CardTitle>
          <CardDescription>
            Create comprehensive project documentation following software engineering methodology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input
                value={projectData.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={projectData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description and Objectives */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Description</Label>
              <Textarea
                value={projectData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of your project..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Project Objectives</Label>
              <Textarea
                value={projectData.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                placeholder="List the main objectives and goals of your project..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Project Scope</Label>
              <Textarea
                value={projectData.scope}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                placeholder="Define what is included and excluded from the project..."
                rows={3}
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="space-y-2">
            <Label>Technologies & Tools</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                placeholder="Add technology or tool"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology(newTechnology))}
              />
              <Button type="button" onClick={() => addTechnology(newTechnology)} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Common Technologies */}
            <div className="flex flex-wrap gap-2 mb-2">
              {commonTechnologies.map((tech) => (
                <Button
                  key={tech}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTechnology(tech)}
                  disabled={projectData.technologies.includes(tech)}
                  className="text-xs"
                >
                  {tech}
                </Button>
              ))}
            </div>

            {/* Selected Technologies */}
            {projectData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {projectData.technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTechnology(tech)}
                  >
                    {tech} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Methodology */}
          <div className="space-y-2">
            <Label>Methodology</Label>
            <Textarea
              value={projectData.methodology}
              onChange={(e) => handleInputChange('methodology', e.target.value)}
              placeholder="Describe the development methodology (Agile, Waterfall, etc.) and approach..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Phases */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Project Phases</CardTitle>
          <CardDescription>
            Define and track project phases and milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {phases.map((phase, index) => (
            <div key={phase.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Phase {index + 1}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(phase.status)}>
                    {phase.status.replace('-', ' ')}
                  </Badge>
                  {phases.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhase(phase.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phase Name</Label>
                  <Input
                    value={phase.name}
                    onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                    placeholder="Phase name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={phase.status} 
                    onValueChange={(value) => updatePhase(phase.id, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={phase.startDate}
                    onChange={(e) => updatePhase(phase.id, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={phase.endDate}
                    onChange={(e) => updatePhase(phase.id, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={phase.description}
                  onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                  placeholder="Describe the activities and deliverables for this phase..."
                  rows={2}
                />
              </div>
            </div>
          ))}
          
          <Button type="button" onClick={addPhase} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Phase
          </Button>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Additional Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timeline</Label>
              <Textarea
                value={projectData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                placeholder="Overall project timeline and key milestones..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Outcomes</Label>
              <Textarea
                value={projectData.expectedOutcomes}
                onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                placeholder="What are the expected deliverables and outcomes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Risk Assessment</Label>
              <Textarea
                value={projectData.riskAssessment}
                onChange={(e) => handleInputChange('riskAssessment', e.target.value)}
                placeholder="Identify potential risks and mitigation strategies..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Resources Required</Label>
              <Textarea
                value={projectData.resources}
                onChange={(e) => handleInputChange('resources', e.target.value)}
                placeholder="List required resources, tools, and support..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Stakeholders</Label>
              <Textarea
                value={projectData.stakeholders}
                onChange={(e) => handleInputChange('stakeholders', e.target.value)}
                placeholder="Identify key stakeholders and their roles..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Success Criteria</Label>
              <Textarea
                value={projectData.successCriteria}
                onChange={(e) => handleInputChange('successCriteria', e.target.value)}
                placeholder="Define how success will be measured..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Documentation Plan</Label>
            <Textarea
              value={projectData.documentation}
              onChange={(e) => handleInputChange('documentation', e.target.value)}
              placeholder="Describe the documentation that will be created..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Document */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Button 
              onClick={generateProjectDocument}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Project Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}