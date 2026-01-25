"use client"

import { useEffect, useCallback, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CompanyLogos } from "@/components/company-logos"
import { FeaturesSection } from "@/components/features-section"
import { useVapi } from "@/hooks/use-vapi"
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { isConnected, isListening, isSpeaking, transcript, error, startCall, endCall, toggleMute } = useVapi()
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showCallUI, setShowCallUI] = useState(false)

  // Auto-start call when user enters the page (after first interaction)
  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }, [hasInteracted])

  useEffect(() => {
    // Listen for any user interaction
    const events = ["click", "keydown", "touchstart"]
    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [handleUserInteraction])

  const handleStartCall = useCallback(() => {
    setShowCallUI(true)
    startCall()
  }, [startCall])

  const handleEndCall = useCallback(() => {
    endCall()
    setShowCallUI(false)
  }, [endCall])

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
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#2a2a2a] p-8">
            <div className="mb-6 text-center">
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                isConnected 
                  ? isSpeaking 
                    ? "bg-green-500/20 animate-pulse" 
                    : "bg-green-500/20"
                  : "bg-white/10"
              }`}>
                {isConnected ? (
                  <div className="h-12 w-12 rounded-full bg-green-500/40 flex items-center justify-center">
                    <div className={`h-6 w-6 rounded-full bg-green-400 ${isSpeaking ? "animate-ping" : ""}`} />
                  </div>
                ) : (
                  <Phone className="h-8 w-8 text-white/50" />
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
                  : "Setting up your call..."
                }
              </p>

              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}

              {transcript && (
                <div className="mt-4 rounded-lg bg-white/5 p-3">
                  <p className="text-sm text-white/80">{transcript}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              {isConnected && (
                <Button
                  size="icon"
                  variant="outline"
                  className={`h-14 w-14 rounded-full border-white/20 ${
                    isListening ? "bg-white/10" : "bg-red-500/20"
                  }`}
                  onClick={toggleMute}
                >
                  {isListening ? (
                    <Mic className="h-6 w-6 text-white" />
                  ) : (
                    <MicOff className="h-6 w-6 text-red-400" />
                  )}
                </Button>
              )}
              
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
