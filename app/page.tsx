"use client"

import { useEffect, useCallback, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { FeaturesSection } from "@/components/features-section"
import { ExportModal } from "@/components/export-modal"
import { useVapi } from "@/hooks/use-vapi"
import { useScreenShare } from "@/hooks/use-screen-share"
import { Phone, PhoneOff, Mic, MicOff, Monitor, MonitorOff, Eye, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    conversationHistory,
    startCall,
    endCall,
    toggleMute,
    clearHistory,
    setScreenCaptureFunction,
    requestScreenAnalysis,
  } = useVapi()

  const {
    isSharing,
    startScreenShare,
    stopScreenShare,
    captureFrame,
  } = useScreenShare()

  const [hasInteracted, setHasInteracted] = useState(false)
  const [showCallUI, setShowCallUI] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [callEnded, setCallEnded] = useState(false)

  // Set the capture function when screen sharing starts
  useEffect(() => {
    if (isSharing && captureFrame) {
      setScreenCaptureFunction(captureFrame)
    }
  }, [isSharing, captureFrame, setScreenCaptureFunction])

  // Auto-start call when user enters the page (after first interaction)
  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }, [hasInteracted])

  useEffect(() => {
    // Listen for any user interaction
    const events = ["click", "keydown", "touchstart"]
    for (const event of events) {
      window.addEventListener(event, handleUserInteraction, { once: true })
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleUserInteraction)
      }
    }
  }, [handleUserInteraction])

  const handleStartCall = useCallback(async (withScreenShare: boolean = false) => {
    setShowCallUI(true)
    setCallEnded(false)

    if (withScreenShare) {
      const stream = await startScreenShare()
      if (stream) {
        startCall(true)
      } else {
        // If screen share was cancelled, start without it
        startCall(false)
      }
    } else {
      startCall(false)
    }
  }, [startCall, startScreenShare])

  const handleEndCall = useCallback(() => {
    endCall()
    stopScreenShare()
    setCallEnded(true)
  }, [endCall, stopScreenShare])

  const handleCloseCallUI = useCallback(() => {
    setShowCallUI(false)
    setCallEnded(false)
    clearHistory()
  }, [clearHistory])

  const handleManualScreenAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    await requestScreenAnalysis()
    setIsAnalyzing(false)
  }, [requestScreenAnalysis])

  const handleToggleScreenShare = useCallback(async () => {
    if (isSharing) {
      stopScreenShare()
    } else {
      const stream = await startScreenShare()
      if (stream) {
        setScreenCaptureFunction(captureFrame)
      }
    }
  }, [isSharing, startScreenShare, stopScreenShare, captureFrame, setScreenCaptureFunction])

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Header />

      <main>
        <HeroSection onStartCall={handleStartCall} isCallActive={isConnected} />

        {/* Company Logos */}
        <div className="border-y border-white/10 bg-[#1a1a1a]">
          <CompanyLogos />
        </div>

        <FeaturesSection />
      </main>

      {/* Call UI Overlay */}
      {showCallUI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#2a2a2a] p-8">
            {/* Call Active State */}
            {!callEnded ? (
              <>
                <div className="mb-6 text-center">
                  {/* Status indicator */}
                  <div
                    className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${
                      isConnected
                        ? isSpeaking
                          ? "bg-green-500/20 animate-pulse"
                          : "bg-green-500/20"
                        : "bg-white/10"
                    }`}
                  >
                    {isConnected ? (
                      <div className="h-14 w-14 rounded-full bg-green-500/40 flex items-center justify-center">
                        <div className={`h-7 w-7 rounded-full bg-green-400 ${isSpeaking ? "animate-ping" : ""}`} />
                      </div>
                    ) : (
                      <Phone className="h-10 w-10 text-white/50" />
                    )}
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {isConnected ? "Call in Progress" : "Connecting..."}
                  </h3>

                  <p className="text-sm text-white/60">
                    {isConnected
                      ? isSpeaking
                        ? "AI is speaking..."
                        : isListening
                        ? "Listening..."
                        : "Connected"
                      : "Setting up your call..."}
                  </p>

                  {/* Screen sharing status */}
                  {isSharing && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-emerald-400">
                      <Monitor className="h-4 w-4" />
                      <span>Screen sharing active</span>
                    </div>
                  )}

                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                  {transcript && (
                    <div className="mt-4 rounded-lg bg-white/5 p-3 max-h-32 overflow-y-auto">
                      <p className="text-sm text-white/80">{transcript}</p>
                    </div>
                  )}
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {isConnected && (
                    <>
                      {/* Mute button */}
                      <Button
                        size="icon"
                        variant="outline"
                        className={`h-12 w-12 rounded-full border-white/20 ${
                          isListening ? "bg-white/10" : "bg-red-500/20"
                        }`}
                        onClick={toggleMute}
                        title={isListening ? "Mute" : "Unmute"}
                      >
                        {isListening ? (
                          <Mic className="h-5 w-5 text-white" />
                        ) : (
                          <MicOff className="h-5 w-5 text-red-400" />
                        )}
                      </Button>

                      {/* Screen share toggle */}
                      <Button
                        size="icon"
                        variant="outline"
                        className={`h-12 w-12 rounded-full border-white/20 ${
                          isSharing ? "bg-emerald-500/20" : "bg-white/10"
                        }`}
                        onClick={handleToggleScreenShare}
                        title={isSharing ? "Stop sharing" : "Share screen"}
                      >
                        {isSharing ? (
                          <Monitor className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <MonitorOff className="h-5 w-5 text-white/60" />
                        )}
                      </Button>

                      {/* Manual screen analysis */}
                      {isSharing && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-12 w-12 rounded-full border-white/20 bg-white/10"
                          onClick={handleManualScreenAnalysis}
                          disabled={isAnalyzing}
                          title="Analyze screen now"
                        >
                          <Eye className={`h-5 w-5 text-white ${isAnalyzing ? "animate-pulse" : ""}`} />
                        </Button>
                      )}
                    </>
                  )}

                  {/* End call button */}
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600"
                    onClick={handleEndCall}
                    title="End call"
                  >
                    <PhoneOff className="h-5 w-5 text-white" />
                  </Button>
                </div>

                {/* Start with screen share hint */}
                {!isConnected && (
                  <p className="mt-4 text-center text-xs text-white/40">
                    Tip: You can share your screen during the call for AI assistance
                  </p>
                )}
              </>
            ) : (
              /* Call Ended State */
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <Phone className="h-8 w-8 text-white/50" />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-white">Call Ended</h3>

                  <p className="text-sm text-white/60">
                    {conversationHistory.length > 0
                      ? `${conversationHistory.length} messages in conversation`
                      : "No conversation recorded"}
                  </p>
                </div>

                {/* Export options */}
                {conversationHistory.length > 0 && (
                  <div className="mb-6">
                    <Button
                      className="w-full bg-white text-black hover:bg-white/90"
                      onClick={() => setShowExportModal(true)}
                    >
                      <FileDown className="mr-2 h-5 w-5" />
                      Export Conversation
                    </Button>
                    <p className="mt-2 text-center text-xs text-white/40">
                      Create timelines, milestones, docs, and more
                    </p>
                  </div>
                )}

                {/* Close / New call buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={handleCloseCallUI}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => handleStartCall(true)}
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    New Call with Screen
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        conversation={conversationHistory}
      />
    </div>
  )
}
