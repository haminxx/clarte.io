"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export default function TermsPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <section className="mb-10">
          <h1 className={cn("text-3xl font-bold md:text-4xl", isBright ? "text-black" : "text-white")}>
            Terms of Service
          </h1>
          <p className={cn("mt-3 text-sm md:text-base", isBright ? "text-black/60" : "text-white/60")}>
            Last updated: {new Date().getFullYear()}
          </p>
        </section>

        <div className={cn("space-y-8 text-sm md:text-base leading-relaxed", isBright ? "text-black/80" : "text-white/80")}>
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Clarte, you agree to these Terms of Service. If you do not agree, you may not use
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Use of the Service</h2>
            <p className="mb-2">
              Clarte is provided for personal and professional use to support thinking, planning, and decision-making.
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the service for any illegal or unauthorized purpose.</li>
              <li>Reverse engineer, copy, or misuse the service or underlying models.</li>
              <li>Send harmful, abusive, or infringing content through the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Intellectual Property</h2>
            <p>
              Clarte, including its branding, interface, and underlying technology, is owned or licensed by us and
              protected by applicable intellectual property laws. You receive a limited, non-exclusive, revocable license
              to use the service as provided.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. No Professional Advice</h2>
            <p>
              Clarte is an AI assistant and does not provide legal, medical, financial, or other professional advice.
              You are responsible for verifying information and making final decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an “as is” and “as available” basis. We do not guarantee accuracy, uptime,
              or fitness for a particular purpose. Use of the service is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we will not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Termination</h2>
            <p>
              We may suspend or terminate access to Clarte at any time if we believe you have violated these Terms or
              to protect the service or other users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. When we do, we will update the “Last updated” date above.
              Continued use of Clarte after changes become effective means you accept the revised Terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

