'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye, ExternalLink, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Document {
  name: string
  path: string
  description: string
  type: 'guidelines' | 'template' | 'documentation' | 'report' | 'log' | 'project'
}

export function DocumentViewer() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [docContent, setDocContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)

  // Load documents from upload directory
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoadingDocs(true)
    try {
      // This would typically be an API call to list files in the upload directory
      const staticDocs: Document[] = [
        {
          name: 'Attachment Reports Guidelines',
          path: '/upload/Attachment Reports Guidelines.docx',
          description: 'Official guidelines for formatting and structuring attachment reports',
          type: 'guidelines'
        },
        {
          name: 'Logsheet Template',
          path: '/upload/Logsheet template.docx',
          description: 'Standard template for daily and weekly activity logging',
          type: 'template'
        },
        {
          name: 'Project Documentation Guidelines',
          path: '/upload/Guidelines for Attachment Project Documentation.docx',
          description: 'Requirements for project documentation and methodology',
          type: 'documentation'
        }
      ]

      // Add generated documents (these would be dynamically loaded from your upload directory)
      const generatedDocs = await loadGeneratedDocuments()
      setDocuments([...staticDocs, ...generatedDocs])
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const loadGeneratedDocuments = async (): Promise<Document[]> => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const docs = await response.json()
        return docs.filter((doc: any) => !doc.name.includes('Guidelines') && !doc.name.includes('template'))
      }
    } catch (error) {
      console.error('Error loading generated documents:', error)
    }
    return []
  }

  const previewDocument = async (doc: Document) => {
    setIsLoading(true)
    setDocContent('')
    
    try {
      if (doc.path.endsWith('.docx')) {
        // For .docx files, we'll extract text content
        const response = await fetch(`/api/preview-docx?path=${encodeURIComponent(doc.path)}`)
        if (response.ok) {
          const content = await response.text()
          setDocContent(content)
        } else {
          setDocContent('Error loading document preview. The document may be corrupted or inaccessible.')
        }
      } else {
        // For other file types
        const response = await fetch(doc.path)
        if (response.ok) {
          const content = await response.text()
          setDocContent(content)
        } else {
          setDocContent('Error loading document.')
        }
      }
    } catch (error) {
      console.error('Error previewing document:', error)
      setDocContent('Error loading document preview. Please try downloading the document instead.')
    } finally {
      setIsLoading(false)
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'guidelines': return 'text-blue-600'
      case 'template': return 'text-emerald-600'
      case 'documentation': return 'text-amber-600'
      case 'report': return 'text-purple-600'
      case 'log': return 'text-indigo-600'
      case 'project': return 'text-rose-600'
      default: return 'text-slate-600'
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'guidelines': return 'bg-blue-50 dark:bg-blue-900/20'
      case 'template': return 'bg-emerald-50 dark:bg-emerald-900/20'
      case 'documentation': return 'bg-amber-50 dark:bg-amber-900/20'
      case 'report': return 'bg-purple-50 dark:bg-purple-900/20'
      case 'log': return 'bg-indigo-50 dark:bg-indigo-900/20'
      case 'project': return 'bg-rose-50 dark:bg-rose-900/20'
      default: return 'bg-slate-50 dark:bg-slate-900/20'
    }
  }

  const handleDownload = (doc: Document) => {
    // Create a download link
    const link = document.createElement('a')
    link.href = doc.path
    link.download = doc.name + (doc.path.includes('.docx') ? '.docx' : '.txt')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'guidelines': return 'Guidelines'
      case 'template': return 'Template'
      case 'documentation': return 'Documentation'
      case 'report': return 'Report'
      case 'log': return 'Log Sheet'
      case 'project': return 'Project Doc'
      default: return 'Document'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Document Library
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Access guidelines, templates, and your generated documents
          </p>
        </div>
        <Button onClick={loadDocuments} variant="outline" disabled={isLoadingDocs}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingDocs ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoadingDocs ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${getBgColor(doc.type)} rounded-xl flex items-center justify-center`}>
                    <FileText className={`w-6 h-6 ${getIconColor(doc.type)}`} />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getBgColor(doc.type)} ${getIconColor(doc.type)}`}>
                    {getTypeLabel(doc.type)}
                  </span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  {doc.name}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedDoc(doc)
                          previewDocument(doc)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>{selectedDoc?.name}</DialogTitle>
                        <DialogDescription>
                          {selectedDoc?.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-hidden">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-64">
                            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                            <span className="ml-2 text-slate-500">Loading preview...</span>
                          </div>
                        ) : docContent ? (
                          <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                                {docContent}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 text-center h-64 flex flex-col justify-center">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                              Preview not available
                            </p>
                            <Button onClick={() => selectedDoc && handleDownload(selectedDoc)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download Document
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button 
                          variant="outline"
                          onClick={() => selectedDoc && handleDownload(selectedDoc)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {documents.length === 0 && !isLoadingDocs && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 mb-2">No documents found</p>
          <p className="text-sm text-slate-400">Documents will appear here once uploaded or generated</p>
        </div>
      )}

      {/* Quick Reference Section */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Document Management
          </CardTitle>
          <CardDescription>
            All your attachment documents in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 dark:text-white">Guidelines & Templates</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Official attachment guidelines</li>
                <li>• Report formatting templates</li>
                <li>• Project documentation standards</li>
                <li>• Logsheet templates</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 dark:text-white">Generated Documents</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Daily log entries</li>
                <li>• Monthly reports</li>
                <li>• Final attachment reports</li>
                <li>• Project documentation</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 dark:text-white">Features</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Document preview</li>
                <li>• Download functionality</li>
                <li>• Auto-save to upload folder</li>
                <li>• Version tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}