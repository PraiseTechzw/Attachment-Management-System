'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { Log } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

const LogbookPage = () => {
  const { studentId } = useApp()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      if (!studentId) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/logs?studentId=${studentId}`)
        if (response.ok) {
          const data = await response.json()
          setLogs(data)
        } else {
          console.error('Failed to fetch logs')
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [studentId])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container mx-auto p-4 md:p-8 print-container">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between no-print">
          <CardTitle>Industrial Attachment Logbook</CardTitle>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Logbook
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold">CHINHOYI UNIVERSITY OF TECHNOLOGY (CUT)</h1>
            <h2 className="text-lg font-semibold">SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</h2>
            <h3 className="text-md">ICT AND ELECTRONICS DEPARTMENT</h3>
            <h4 className="text-md font-bold mt-4">INDUSTRIAL ATTACHMENT LOG SHEET</h4>
          </div>

          {loading ? (
            <p>Loading logs...</p>
          ) : logs.length > 0 ? (
            <div className="border-t border-b border-gray-300 dark:border-gray-600 divide-y divide-gray-300 dark:divide-gray-600">
              <div className="grid grid-cols-3 font-bold bg-gray-100 dark:bg-gray-800 p-2">
                <div className="border-r border-gray-300 dark:border-gray-600 px-2">Date</div>
                <div className="border-r border-gray-300 dark:border-gray-600 px-2">Activities</div>
                <div className="px-2">Comments</div>
              </div>
              {logs.map(log => (
                <div key={log.id} className="grid grid-cols-3 p-2 text-sm">
                  <div className="border-r border-gray-300 dark:border-gray-600 px-2 break-words">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                  <div className="border-r border-gray-300 dark:border-gray-600 px-2 break-words">
                    {log.activities}
                  </div>
                  <div className="px-2 break-words">
                    {log.reflection} 
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8">No log entries found.</p>
          )}

          <div className="mt-12">
            <p className="text-md">Supervisor`s Signature: ........................................</p>
            <p className="text-md mt-4">Date: ........................................</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogbookPage
