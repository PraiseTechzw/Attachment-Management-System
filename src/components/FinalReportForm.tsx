'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Download, Loader2, Sparkles } from 'lucide-react'

export function FinalReportForm({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [formData, setFormData] = useState({
    coverPage: '',
    introduction: '',
    companyBackground: '',
    majorDuties: '',
    majorChallenges: '',
    suggestedSolutions: '',
    mainBody: '',
    detailedDuties: '',
    challengesEncountered: '',
    problemProcedures: '',
    alternatives: '',
    skillsGained: '',
    conclusions: '',
    recommendations: ''
  })

  const handleSave = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, ...formData })
      })

      if (response.ok) {
        alert('Final report saved successfully!')
      }
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Failed to save report')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFromLogs = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          ...formData,
          generateFromLogs: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.companyBackground) setFormData(prev => ({ ...prev, ...data }))
        alert('Report generated from logs successfully!')
      }
    } catch (error) {
      console.error('Error generating from logs:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)

    try {
      const response = await fetch('/api/export/final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'final-attachment-report.md'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate from Logs</CardTitle>
          <CardDescription>
            Auto-generate report using all your log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateFromLogs}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate from Logs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Final Report Sections</CardTitle>
          <CardDescription>
            Complete all sections for your industrial attachment final report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverPage">Cover Page</Label>
                <Textarea
                  id="coverPage"
                  placeholder="Enter cover page details..."
                  value={formData.coverPage}
                  onChange={(e) => setFormData({ ...formData, coverPage: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  placeholder="Enter introduction..."
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyBackground">Company Background</Label>
                <Textarea
                  id="companyBackground"
                  placeholder="Enter company background..."
                  value={formData.companyBackground}
                  onChange={(e) => setFormData({ ...formData, companyBackground: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="majorDuties">Major Duties/Activities</Label>
                <Textarea
                  id="majorDuties"
                  placeholder="Enter major duties..."
                  value={formData.majorDuties}
                  onChange={(e) => setFormData({ ...formData, majorDuties: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="majorChallenges">Major Challenges/Problems</Label>
                <Textarea
                  id="majorChallenges"
                  placeholder="Enter major challenges..."
                  value={formData.majorChallenges}
                  onChange={(e) => setFormData({ ...formData, majorChallenges: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestedSolutions">Suggested Solutions</Label>
                <Textarea
                  id="suggestedSolutions"
                  placeholder="Enter solutions..."
                  value={formData.suggestedSolutions}
                  onChange={(e) => setFormData({ ...formData, suggestedSolutions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainBody">Main Body/Analysis</Label>
                <Textarea
                  id="mainBody"
                  placeholder="Enter main body analysis..."
                  value={formData.mainBody}
                  onChange={(e) => setFormData({ ...formData, mainBody: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailedDuties">Detailed Duties</Label>
                <Textarea
                  id="detailedDuties"
                  placeholder="Enter detailed duties..."
                  value={formData.detailedDuties}
                  onChange={(e) => setFormData({ ...formData, detailedDuties: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challengesEncountered">Challenges Encountered</Label>
                <Textarea
                  id="challengesEncountered"
                  placeholder="Enter challenges..."
                  value={formData.challengesEncountered}
                  onChange={(e) => setFormData({ ...formData, challengesEncountered: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemProcedures">Problem Procedures</Label>
                <Textarea
                  id="problemProcedures"
                  placeholder="Enter problem-solving procedures..."
                  value={formData.problemProcedures}
                  onChange={(e) => setFormData({ ...formData, problemProcedures: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternatives">Alternatives</Label>
                <Textarea
                  id="alternatives"
                  placeholder="Enter alternatives..."
                  value={formData.alternatives}
                  onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillsGained">Skills Gained</Label>
                <Textarea
                  id="skillsGained"
                  placeholder="Enter skills gained..."
                  value={formData.skillsGained}
                  onChange={(e) => setFormData({ ...formData, skillsGained: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conclusions">Conclusions</Label>
                <Textarea
                  id="conclusions"
                  placeholder="Enter conclusions..."
                  value={formData.conclusions}
                  onChange={(e) => setFormData({ ...formData, conclusions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Enter recommendations..."
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {loading ? 'Saving...' : 'Save Report'}
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
