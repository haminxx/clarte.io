export function CompanyLogos() {
  const companies = [
    "Sedgwick",
    "Reddit",
    "Calendly",
    "OM1",
    "Huckberry"
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-12 px-6 py-8 opacity-60">
      {companies.map((company) => (
        <div
          key={company}
          className="text-lg font-medium tracking-wide text-white/50"
        >
          {company}
        </div>
      ))}
    </div>
  )
}
