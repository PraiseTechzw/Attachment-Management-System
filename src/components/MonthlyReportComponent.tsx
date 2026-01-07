'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Calendar, BookOpen, Wand2, Inbox } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Log, Report } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'

interface MonthlyReportProps {
  studentId?: string
}

export function MonthlyReportComponent({ studentId: propStudentId }: MonthlyReportProps) {
  const { studentId, refreshStats } = useApp()
  const { toast } = useToast()
  const actualStudentId = propStudentId || studentId

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [error, setError] = useState<string | null>(null)

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }))
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const fetchLogs = async () => {
    if (!actualStudentId) return
    try {
      const response = await fetch(`/api/logs?studentId=${actualStudentId}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      } else {
        console.error('Failed to fetch logs')
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
    }
  }

  const fetchReports = async () => {
    if (!actualStudentId) return;
    try {
      const response = await fetch(`/api/monthly-reports?studentId=${actualStudentId}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchLogs()
    fetchReports()
  }, [actualStudentId])

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)
    setGeneratedReport(null)

    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: actualStudentId, month, year }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedReport(data.report);
        // Optionally save the report and refresh the list
        await saveReport(data.report);
        await fetchReports();
        await refreshStats();
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveReport = async (reportContent: string) => {
    try {
      const response = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `Monthly_Report_${months.find(m => m.value === month)?.name}_${year}.md`,
          content: reportContent,
          type: 'report',
          studentId: actualStudentId,
          month,
          year,
        }),
      });
  
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save report. Please try again.",
        })
        throw new Error('Failed to save the report.');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving report. Please try again.",
      })
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI Monthly Report Generator
            </CardTitle>
            <CardDescription>Select a period to generate a report from your logbook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Month</Label>
                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Year</Label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={generateReport} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700">
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {generatedReport && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Report Preview</CardTitle>
                <CardDescription>AI-crafted summary of your activities.</CardDescription>
              </div>
              <Button onClick={() => { /* Implement download */ }} variant="outline"><Download className="w-4 h-4 mr-2" />Download</Button>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <ReactMarkdown>{generatedReport}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Your Logbook</CardTitle>
            <CardDescription>A collection of your daily log entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
              {logs.length > 0 ? (
                logs.map(log => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-sm">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{log.activities.substring(0, 150)}...</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No log entries yet</p>
                  <p className="text-xs">Your saved entries will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Monthly Reports</CardTitle>
            <CardDescription>Access your previously generated reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
            {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-semibold text-sm">{report.filename}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { /* View report */ }}>View</Button>
                  </div>
                ))
              ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No reports generated yet</p>
              </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
