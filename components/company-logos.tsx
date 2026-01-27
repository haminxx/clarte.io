export function CompanyLogos() {
  const companies = [
    "VAPI",
    "Groq",
    "Deepgram",
    "Vercel",
    "Github",
    "Cursor"
  ]

  return (
    <div className="py-6 sm:py-8 w-full overflow-x-hidden">
      <p className="mb-4 sm:mb-6 text-center text-xs sm:text-sm text-muted-foreground px-4">Trusted by builders at</p>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 px-4 sm:px-6 opacity-60">
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
