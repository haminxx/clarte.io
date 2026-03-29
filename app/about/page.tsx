"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { useTranslation } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import AboutSection2 from "@/components/ui/about-section-2"

export default function AboutPage() {
  const { theme } = useClarteTheme()
  const { t } = useTranslation()
  const isBright = theme === "bright"
  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AboutSection2 />

        {/* Three-step thinking cards */}
        <AnimateOnScroll animation="fade-blur-slower" delay={80}>
          <section className="mb-16 space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-md",
                  isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
                )}
              >
                <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>
                  {t("about.discoverTitle")}
                </h2>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  {t("about.discoverDesc")}
                </p>
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-md",
                  isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
                )}
              >
                <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>
                  {t("about.stressTestTitle")}
                </h2>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  {t("about.stressTestDesc")}
                </p>
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-md",
                  isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
                )}
              >
                <h2 className={cn("mb-2 text-lg font-semibold", isBright ? "text-black" : "text-white")}>
                  {t("about.validateTitle")}
                </h2>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  {t("about.validateDesc")}
                </p>
              </div>
            </div>
          </section>
        </AnimateOnScroll>

        {/* Capabilities: voice + screen + camera */}
        <AnimateOnScroll animation="fade-up-slow" delay={140}>
          <section
            className={cn(
              "mt-4 rounded-2xl border p-8 md:p-10 backdrop-blur-md",
              isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/60"
            )}
          >
            <h2 className={cn("text-2xl font-semibold mb-4", isBright ? "text-black" : "text-white")}>
              {t("about.voiceAgentTitle")}
            </h2>
            <p className={cn("mb-6 text-sm md:text-base leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
              {t("about.voiceAgentIntro")}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className={cn("mb-1 text-sm font-semibold uppercase tracking-wide", isBright ? "text-black/80" : "text-white/80")}>
                  {t("about.screenShareTitle")}
                </h3>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  {t("about.screenShareDesc")}
                </p>
              </div>
              <div>
                <h3 className={cn("mb-1 text-sm font-semibold uppercase tracking-wide", isBright ? "text-black/80" : "text-white/80")}>
                  {t("about.cameraTitle")}
                </h3>
                <p className={cn("text-sm leading-relaxed", isBright ? "text-black/70" : "text-white/70")}>
                  {t("about.cameraDesc")}
                </p>
              </div>
            </div>
            <p className={cn("mt-6 text-xs md:text-sm", isBright ? "text-black/50" : "text-white/50")}>
              {t("about.optInNote")}
            </p>
          </section>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
