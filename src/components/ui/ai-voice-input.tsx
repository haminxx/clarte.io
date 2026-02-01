/** @ts-ignore */
import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  onTranscript?: (text: string) => void;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  onTranscript,
}: AIVoiceInputProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    setIsClient(true);
    
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;  // Keep listening until manually stopped
      recognitionInstance.interimResults = true;  // Show live transcription
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setSubmitted(true);
        onStart?.();
        console.log('🎤 Speech recognition started');
      };
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        // Get the most recent transcript
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Only process final results
        if (finalTranscript.trim()) {
          console.log('📝 Final transcript:', finalTranscript);
          onTranscript?.(finalTranscript.trim());
          // Don't stop automatically - let user click to stop
        }
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Speech recognition error:', event.error);
        
        // Handle different error types
        if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please allow microphone access in browser settings.');
          setSubmitted(false);
        } else if (event.error === 'no-speech') {
          // Don't stop on no-speech - just log it
          console.log('🔇 No speech detected, continuing to listen...');
          // Keep listening - don't set submitted to false
        } else if (event.error === 'audio-capture') {
          alert('No microphone found. Please connect a microphone.');
          setSubmitted(false);
        } else if (event.error === 'network') {
          // Network errors can be temporary - don't immediately stop
          console.warn('⚠️ Network error with speech recognition. This may be temporary.');
          console.warn('💡 Make sure you have an internet connection. Web Speech API requires internet.');
          // Don't stop - let it try to recover
          // The onend handler will restart if needed
        } else if (event.error === 'aborted') {
          // Aborted is normal when stopping manually - don't log as error
          console.log('🛑 Recognition aborted (normal when stopping)');
        } else {
          console.warn('⚠️ Other error:', event.error);
          // Don't stop for minor errors - let it try to recover
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('🛑 Speech recognition ended');
        // Only stop if user manually stopped (submitted should be false)
        if (!submitted) {
          onStop?.(time);
          setTime(0);
        } else {
          // If still submitted, restart recognition (for continuous mode)
          // Add a small delay to avoid rapid restart loops
          setTimeout(() => {
            if (submitted) {
              console.log('🔄 Restarting recognition...');
              try {
                recognitionInstance.start();
              } catch (e: any) {
                // If error is "already started", that's okay - ignore it
                if (e.message && e.message.includes('already started')) {
                  console.log('✅ Recognition already running');
                } else {
                  console.error('❌ Error restarting:', e);
                  // Only stop if it's a critical error
                  if (e.message && e.message.includes('not-allowed')) {
                    setSubmitted(false);
                  }
                }
              }
            }
          }, 100); // Small delay to prevent rapid restarts
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = async () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      if (recognition) {
        if (submitted) {
          // Stop listening manually
          console.log('🛑 Stopping recognition...');
          recognition.stop();
          setSubmitted(false);
        } else {
          // Request microphone permission when user clicks (user-initiated action)
          try {
            // Request permission first
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microphone permission granted');
            setMicPermission('granted');
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            
            // Start listening
            console.log('🎤 Starting recognition...');
            recognition.start();
          } catch (error: any) {
            console.error('❌ Microphone permission denied:', error);
            setMicPermission('denied');
            if (error.name === 'NotAllowedError') {
              alert('Microphone permission is required.\n\nTo enable:\n1. Click the lock icon in the address bar\n2. Click "Site settings"\n3. Set Microphone to "Allow"\n4. Click the microphone button again');
            } else if (error.name === 'NotFoundError') {
              alert('No microphone found. Please connect a microphone.');
            } else {
              console.error('Error accessing microphone:', error);
              alert('Could not access microphone. Please check your microphone settings.');
            }
          }
        }
      } else {
        alert('Speech recognition not available. Please use Chrome, Edge, or Safari.');
      }
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            submitted
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {submitted 
            ? "Listening..." 
            : micPermission === 'denied' 
              ? "Microphone permission denied - Click to retry" 
              : "Click to speak"}
        </p>
        {micPermission === 'denied' && (
          <p className="text-xs text-red-500 mt-1 text-center max-w-xs">
            Allow microphone access in browser settings
          </p>
        )}
      </div>
    </div>
  );
}
