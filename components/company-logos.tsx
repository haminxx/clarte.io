export function CompanyLogos() {
  const companies = [
    "VAPI",
    "Groq",
    "Deepgram",
    "Vercel"
  ]

  return (
    <div className="py-8">
      <p className="mb-6 text-center text-sm text-muted-foreground">Trusted by builders at</p>
      <div className="flex flex-wrap items-center justify-center gap-12 px-6 opacity-60">
        {companies.map((company) => (
          <div
            key={company}
            className="text-lg font-medium tracking-wide text-foreground/50"
          >
            {company}
          </div>
        ))}
      </div>
    </div>
  )
}
