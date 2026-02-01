import { useState, useEffect } from "react";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function ClarteVoiceApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      // Check backend connection first
      const healthCheck = await fetch(`${BACKEND_URL}/health`, {
        method: "GET",
      }).catch(() => null);

      if (!healthCheck || !healthCheck.ok) {
        throw new Error(
          `Cannot connect to backend at ${BACKEND_URL}. ` +
          `Make sure the backend server is running: python clarte_backend_api.py`
        );
      }

      // Send to backend
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Backend error (${response.status}): ${errorText || 'Unknown error'}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Add assistant message
        const assistantMessage: Message = {
          role: "assistant",
          text: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Play audio if available
        if (data.audio_url) {
          // Convert relative URL to absolute URL pointing to backend
          const audioUrl = data.audio_url.startsWith('http') 
            ? data.audio_url 
            : `${BACKEND_URL}${data.audio_url}`;
          
          const audio = new Audio(audioUrl);
          audio.play().catch((err) => {
            console.error("Error playing audio:", err);
            setError("Could not play audio. Check browser console for details.");
          });
        }
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err: any) {
      console.error("Error:", err);
      const errorMessage = err.message || "Error communicating with backend";
      setError(errorMessage);
      
      // Show detailed error in console for debugging
      console.error("Backend URL:", BACKEND_URL);
      console.error("Full error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = () => {
    setError(null);
  };

  const handleStop = (duration: number) => {
    console.log(`Recording stopped after ${duration} seconds`);
  };

  // Check backend connection status
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    // Check backend health on component mount
    fetch(`${BACKEND_URL}/health`)
      .then((res) => {
        if (res.ok) {
          setBackendStatus("connected");
        } else {
          setBackendStatus("disconnected");
        }
      })
      .catch((err) => {
        console.warn('Backend health check failed:', err);
        setBackendStatus("disconnected");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Clarte
          </h1>
          
          {/* Backend Status Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                backendStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : backendStatus === "disconnected"
                  ? "bg-red-500"
                  : "bg-yellow-500 animate-pulse"
              }`}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {backendStatus === "connected"
                ? "Backend Connected"
                : backendStatus === "disconnected"
                ? "Backend Disconnected"
                : "Checking Backend..."}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm font-semibold mb-1">
              Connection Error
            </p>
            <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-2">
              Backend URL: {BACKEND_URL}
            </p>
          </div>
        )}

        <div className="mb-8">
          <AIVoiceInput
            onStart={handleStart}
            onStop={handleStop}
            onTranscript={handleTranscript}
            visualizerBars={48}
          />
        </div>

        {isProcessing && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing...
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {message.role === "user" ? "You" : "Clarte"}
                  </div>
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
