'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Wand2 } from 'lucide-react'

interface AILogSuggestionProps {
  onSuggestion: (suggestion: string) => void
}

export function AILogSuggestion({ onSuggestion }: AILogSuggestionProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (response.ok) {
        const data = await response.json()
        onSuggestion(data.suggestion)
      } else {
        console.error('Failed to get AI suggestion')
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-purple-500" />
        AI-Powered Log Assistant
      </h4>
      <p className="text-xs text-slate-500">
        Describe your main activity, and the AI will help you draft the rest of the log entry.
      </p>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'Fixed a bug in the authentication flow' or 'Attended a meeting on Q3 planning'"
        rows={2}
        className="bg-white dark:bg-slate-900"
      />
      <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} size="sm" className="bg-purple-600 hover:bg-purple-700">
        {isLoading ? 'Generating...' : 'Generate Log Entry'}
      </Button>
    </div>
  )
}
