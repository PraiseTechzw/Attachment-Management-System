'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Sparkles, Download, Trash2, Eye } from 'lucide-react'

interface MonthlyReport {
  id: string
  month: string
  year: string
  summary: string
  duties: string
  problems: string
  analysis: string
  conclusion: string
  status: string
  createdAt: string
}

export function MonthlyReportComponent({ studentId }: { studentId: string }) {
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [generating, setGenerating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [viewingReport, setViewingReport] = useState<MonthlyReport | null>(null)

  useEffect(() => {
    fetchReports()
  }, [studentId])

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/monthly-reports?studentId=${studentId}`)
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const generateReport = async () => {
    if (!selectedMonth || !selectedYear) {
      alert('Please select both month and year')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/monthly-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          month: selectedMonth,
          year: selectedYear
        })
      })

      if (response.ok) {
        await fetchReports()
        alert('Monthly report generated successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      const response = await fetch(`/api/monthly-reports/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchReports()
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  return (
    <div className="space-y-6">
      {!viewingReport ? (
        <>
          {/* Generate New Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Generate Monthly Report
              </CardTitle>
              <CardDescription>
                AI will analyze your logs and create a comprehensive monthly report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {generating ? 'Generating with AI...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Your Monthly Reports</CardTitle>
              <CardDescription>
                Generated reports ({reports.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Generate your first monthly report above</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {getMonthName(parseInt(report.month))} {report.year}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingReport(report)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert('Download functionality coming soon!')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteReport(report.id)}
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
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {getMonthName(parseInt(viewingReport.month))} {viewingReport.year} Report
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingReport(null)}
              >
                Back
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 prose dark:prose-invert max-w-none">
              <section>
                <h3 className="text-lg font-semibold mb-2">Introduction/Summary</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {viewingReport.summary}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Duties and Activities</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {viewingReport.duties}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Problems/Challenges</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {viewingReport.problems}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Analysis</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {viewingReport.analysis}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {viewingReport.conclusion}
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Unknown'
}
