"use client"

import { useState } from "react"
import { X, FileText, Calendar, CheckSquare, Download, Loader2, Copy, Check, FileSpreadsheet, FileJson, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConversationMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  screenContext?: string
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: ConversationMessage[]
}

const exportOptions = [
  {
    id: "timeline",
    name: "Timeline",
    description: "Chronological view of events and decisions",
    icon: Calendar,
  },
  {
    id: "milestones",
    name: "Milestones & Tasks",
    description: "Action items and goals with priorities",
    icon: CheckSquare,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Professional summary with key points",
    icon: FileText,
  },
  {
    id: "notion",
    name: "Notion Export",
    description: "Formatted for Notion import",
    icon: FileText,
  },
  {
    id: "google-doc",
    name: "Google Doc",
    description: "Ready to paste into Google Docs",
    icon: FileText,
  },
  {
    id: "spreadsheet",
    name: "Spreadsheet (CSV)",
    description: "Structured data for Excel/Sheets",
    icon: FileSpreadsheet,
  },
  {
    id: "json",
    name: "JSON Export",
    description: "Structured data for integrations",
    icon: FileJson,
  },
]

export function ExportModal({ isOpen, onClose, conversation }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [includeScreenContext, setIncludeScreenContext] = useState(true)

  const handleGenerate = async (format: string) => {
    setSelectedFormat(format)
    setIsGenerating(true)
    setGeneratedContent(null)

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation,
          format,
          includeScreenContext,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedContent(data.content)
    } catch (error: any) {
      console.error("[v0] Export generation error:", error)
      setGeneratedContent(`Error generating export: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!generatedContent || !selectedFormat) return

    const extension = selectedFormat === "spreadsheet" ? "csv" : selectedFormat === "json" ? "json" : "md"
    const mimeType = selectedFormat === "spreadsheet" ? "text/csv" : selectedFormat === "json" ? "application/json" : "text/markdown"

    const blob = new Blob([generatedContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-${selectedFormat}-${Date.now()}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleBack = () => {
    setSelectedFormat(null)
    setGeneratedContent(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {generatedContent ? "Export Preview" : "Export Conversation"}
            </h2>
            <p className="text-sm text-white/60">
              {generatedContent
                ? "Review and download your export"
                : "Choose a format to export your conversation"}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80vh - 160px)" }}>
          {!generatedContent ? (
            <>
              {/* Screen context toggle */}
              <label className="mb-6 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScreenContext}
                  onChange={(e) => setIncludeScreenContext(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-white"
                />
                <span className="text-sm text-white/70">
                  Include screen context in export
                </span>
              </label>

              {/* Export options grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleGenerate(option.id)}
                    disabled={isGenerating}
                    className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <option.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{option.name}</h3>
                      <p className="text-sm text-white/50">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {isGenerating && (
                <div className="mt-6 flex items-center justify-center gap-3 text-white/60">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating your export...</span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Generated content preview */}
              <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <pre className="whitespace-pre-wrap text-sm text-white/80 font-mono">
                  {generatedContent}
                </pre>
              </div>

              {/* Integration buttons */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={() => window.open("https://notion.so/new", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Notion
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={() => window.open("https://docs.google.com/document/create", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Google Docs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={() => window.open("https://sheets.google.com/create", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Google Sheets
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {generatedContent && (
          <div className="flex items-center justify-between border-t border-white/10 p-4">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleBack}
            >
              Back to formats
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                className="bg-white text-black hover:bg-white/90"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
