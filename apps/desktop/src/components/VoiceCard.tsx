const VOICE_OPTIONS = [
  { name: "Marin", voiceId: "marin" },
  { name: "Cedar", voiceId: "cedar" },
] as const

interface VoiceCardProps {
  selectedVoiceId: string
  onVoiceChange: (voiceId: string) => void
  onStartCall: () => void
}

export function VoiceCard({ selectedVoiceId, onVoiceChange, onStartCall }: VoiceCardProps) {
  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[var(--foreground)]/80">Welcome to Clarte — your Executive Assistant.</p>
        <div className="flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-[var(--muted-foreground)]">Ready</span>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          Start with voice. Ask Clarte to see your screen or camera when you need it.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted-foreground)]">Voice:</span>
            <div
              role="group"
              aria-label="Voice selection"
              className="inline-flex rounded-full bg-[var(--muted)]/50 p-1 ring-1 ring-[var(--border)]/50"
            >
              {VOICE_OPTIONS.map(({ name, voiceId }) => (
                <button
                  key={voiceId}
                  type="button"
                  onClick={() => onVoiceChange(voiceId)}
                  aria-pressed={selectedVoiceId === voiceId}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedVoiceId === voiceId
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onStartCall}
            className="flex h-12 items-center gap-2 rounded-full bg-[var(--primary)] px-6 font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Connect to Assistant
          </button>
        </div>
      </div>
    </div>
  )
}
