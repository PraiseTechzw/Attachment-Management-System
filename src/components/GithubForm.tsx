'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

export function GithubForm({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    repositoryUrl: '',
    branch: 'main',
    autoCommit: false
  })
  const [connected, setConnected] = useState(false)

  const handleConnect = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          repositoryUrl: formData.repositoryUrl,
          branch: formData.branch,
          autoCommit: formData.autoCommit
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConnected(data.connected)
        alert('GitHub connected successfully!')
      }
    } catch (error) {
      console.error('Error connecting GitHub:', error)
      alert('Failed to connect GitHub')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    try {
      const response = await fetch(`/api/github?studentId=${studentId}`)
      const data = await response.json()
      setConnected(data.connected)
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription>
            Connect your repository for version control and automatic backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repositoryUrl">Repository URL *</Label>
              <Input
                id="repositoryUrl"
                placeholder="https://github.com/username/repo"
                value={formData.repositoryUrl}
                onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                disabled={connected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="main"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                disabled={connected}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoCommit"
                checked={formData.autoCommit}
                onChange={(e) => setFormData({ ...formData, autoCommit: e.target.checked })}
                disabled={connected}
                className="w-4 h-4"
              />
              <Label htmlFor="autoCommit" className="cursor-pointer">
                Enable automatic commits on save
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || connected}
                className="flex-1 bg-slate-700 hover:bg-slate-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Connect Repository
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckStatus}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="font-medium text-emerald-900 dark:text-emerald-300">
                  Connected to GitHub
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-400">
                  {formData.repositoryUrl}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Github className="w-6 h-6 text-slate-400" />
              <div className="text-slate-600 dark:text-slate-400">
                Not connected to GitHub
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
