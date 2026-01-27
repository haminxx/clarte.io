import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0a0a14]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M8 8L16 4L24 8V16L16 28L8 16V8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="16" cy="12" r="3" fill="currentColor" />
              </svg>
              <span className="text-lg font-semibold text-white">Clarte</span>
            </Link>
          </div>

          {/* Main Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Main</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-white/60 hover:text-white transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className="text-sm text-white/60 hover:text-white transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/get-started" className="text-sm text-white/60 hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="https://github.com/haminxx/clart" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Clarte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
