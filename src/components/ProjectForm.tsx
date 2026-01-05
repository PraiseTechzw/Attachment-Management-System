'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FolderTree, Download, Loader2, Sparkles } from 'lucide-react'

export function ProjectForm({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    chapter1Introduction: '',
    chapter2Planning: '',
    chapter3Analysis: '',
    chapter4Design: '',
    chapter5Implementation: '',
    appendixA: '',
    appendixB: '',
    appendixC: ''
  })

  const handleSave = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, ...formData })
      })

      if (response.ok) {
        alert('Project documentation saved successfully!')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAI = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          ...formData,
          generateAI: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, ...data }))
        alert('Chapters generated with AI successfully!')
      }
    } catch (error) {
      console.error('Error generating with AI:', error)
      alert('Failed to generate chapters')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)

    try {
      const response = await fetch('/api/export/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'project-documentation.md'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading project:', error)
      alert('Failed to download project')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Chapters with AI</CardTitle>
          <CardDescription>
            AI will generate comprehensive project documentation chapters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="Enter your project title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <Button
              onClick={handleGenerateAI}
              disabled={loading || !formData.title}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Chapters...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Documentation</CardTitle>
          <CardDescription>
            Complete all chapters for your project documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chapter 1: Introduction</h3>
              <Textarea
                placeholder="Include: Background, Company Organogram, Vision, Mission, Problem Definition, Aim, Objectives, Constraints, Justification, Conclusion"
                value={formData.chapter1Introduction}
                onChange={(e) => setFormData({ ...formData, chapter1Introduction: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chapter 2: Planning</h3>
              <Textarea
                placeholder="Include: Business Value, Feasibility Study, Risk Analysis, Project Plan, Gantt Chart"
                value={formData.chapter2Planning}
                onChange={(e) => setFormData({ ...formData, chapter2Planning: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chapter 3: Analysis</h3>
              <Textarea
                placeholder="Include: Information Gathering, Analysis of existing system, Process Analysis, Data Analysis, Weaknesses, Evaluation of Alternatives, Requirements Analysis"
                value={formData.chapter3Analysis}
                onChange={(e) => setFormData({ ...formData, chapter3Analysis: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chapter 4: Design</h3>
              <Textarea
                placeholder="Include: System Design, Architectural Design, Physical Design, Database Design, Program Design, Interface Design"
                value={formData.chapter4Design}
                onChange={(e) => setFormData({ ...formData, chapter4Design: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chapter 5: Implementation</h3>
              <Textarea
                placeholder="Include: Coding, Testing, Installation, Training"
                value={formData.chapter5Implementation}
                onChange={(e) => setFormData({ ...formData, chapter5Implementation: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appendices</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="appendixA">Appendix A: User Manual</Label>
                  <Textarea
                    id="appendixA"
                    placeholder="User manual content..."
                    value={formData.appendixA}
                    onChange={(e) => setFormData({ ...formData, appendixA: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="appendixB">Appendix B: Sample Code</Label>
                  <Textarea
                    id="appendixB"
                    placeholder="Code snippets..."
                    value={formData.appendixB}
                    onChange={(e) => setFormData({ ...formData, appendixB: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="appendixC">Appendix C: Research Methodologies</Label>
                  <Textarea
                    id="appendixC"
                    placeholder="Research methodologies..."
                    value={formData.appendixC}
                    onChange={(e) => setFormData({ ...formData, appendixC: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Save Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
