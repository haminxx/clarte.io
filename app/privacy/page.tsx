"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageThemeBg } from "@/components/page-theme-bg"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

export default function PrivacyPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"

  return (
    <div className="min-h-screen bg-transparent">
      <PageThemeBg />

      <Header />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <section className="mb-10">
          <h1 className={cn("text-3xl font-bold md:text-4xl", isBright ? "text-black" : "text-white")}>
            Privacy Policy
          </h1>
          <p className={cn("mt-3 text-sm md:text-base", isBright ? "text-black/60" : "text-white/60")}>
            Last updated: {new Date().getFullYear()}
          </p>
        </section>

        <div className={cn("space-y-8 text-sm md:text-base leading-relaxed", isBright ? "text-black/80" : "text-white/80")}>
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Overview</h2>
            <p>
              Clarte is a voice-first assistant designed to help you think more clearly. This Privacy Policy explains
              what information we collect, how we use it, and the choices you have.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-2">
              The specific data we collect depends on how you use Clarte. In general, we may collect:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Account information (such as name, email) when you sign up or request access.</li>
              <li>Usage data, including interactions with the app and voice sessions.</li>
              <li>Technical information such as device type, browser, and approximate region.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. How We Use Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide, maintain, and improve the Clarte experience.</li>
              <li>Personalize responses and suggestions during voice sessions.</li>
              <li>Monitor performance, reliability, and security of the system.</li>
              <li>Communicate with you about updates, support, or changes to our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Sharing and Third Parties</h2>
            <p>
              We may rely on infrastructure and AI providers (such as cloud hosting, speech, and language models) to
              operate Clarte. These providers process data on our behalf under contractual safeguards. We do not sell
              your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Data Retention</h2>
            <p>
              We retain information only for as long as necessary to provide the service, comply with legal obligations,
              or resolve disputes. Voice and transcript data may be retained for quality, safety, and product-improvement
              purposes unless you request deletion where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Your Choices</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access, correct, or delete certain personal information.</li>
              <li>Limit or object to certain processing.</li>
              <li>Export your data in a portable format.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us using the information on the Contact page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the “Last updated” date
              above. Continued use of Clarte after changes become effective means you accept the revised policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

