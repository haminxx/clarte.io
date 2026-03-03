"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { PageThemeBg } from "@/components/page-theme-bg"
import { useClarteTheme } from "@/lib/clarte-theme-context"
import { cn } from "@/lib/utils"

const JOB_TITLE_OPTIONS = [
  { value: "engineer", label: "Engineer" },
  { value: "product_manager", label: "Product Manager" },
  { value: "student", label: "Student" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
] as const

export default function ContactPage() {
  const { theme } = useClarteTheme()
  const isBright = theme === "bright"
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    jobTitle: "",
    industry: "",
    useCase: "",
    schoolEmail: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.jobTitle) return
    setLoading(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    setSubmitted(true)
  }

  const isStudent = formData.jobTitle === "student"

  return (
    <div className="min-h-screen bg-transparent">
      <PageThemeBg />

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-[clamp(7rem,22vh,14rem)] pb-24">
        <AnimateOnScroll animation="fade-up">
          <div className="mb-12 text-center">
            <h1 className={cn("text-4xl font-bold md:text-5xl", isBright ? "text-black" : "text-white")}>
              Request Access
            </h1>
            <p className={cn("mx-auto mt-4 max-w-2xl text-lg", isBright ? "text-black/60" : "text-white/60")}>
              Request early access to Clarte. We&apos;ll review your request and get back to you.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-blur" delay={100}>
          <div className="mx-auto max-w-2xl" id="form">
            {/* Contact Form */}
            <div
              className={cn(
                "rounded-2xl border p-8 backdrop-blur-md",
                isBright ? "border-black/10 bg-white/70" : "border-white/10 bg-[#1a1a2e]/50"
              )}
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h2 className={cn("text-2xl font-bold", isBright ? "text-black" : "text-white")}>Request Received!</h2>
                  <p className={cn("mt-4", isBright ? "text-black/60" : "text-white/60")}>
                    Thank you for your interest. We&apos;ll review your request and get back to you soon.
                  </p>
                  <Button
                    className={cn("mt-6", isBright ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90")}
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({
                        email: "",
                        jobTitle: "",
                        industry: "",
                        useCase: "",
                        schoolEmail: "",
                      })
                    }}
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={cn("mb-2 block text-sm", isBright ? "text-black/60" : "text-white/60")}>Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={cn(
                        isBright
                          ? "border-black/15 bg-white/80 text-black placeholder:text-black/40"
                          : "border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      )}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className={cn("mb-2 block text-sm", isBright ? "text-black/60" : "text-white/60")}>Job title</label>
                    <Select
                      value={formData.jobTitle}
                      onValueChange={(value) => setFormData({ ...formData, jobTitle: value })}
                      required
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full [&>span]:font-normal",
                          isBright
                            ? "border-black/15 bg-white/80 text-black [&>span]:text-black/90"
                            : "border-white/20 bg-white/5 text-white [&>span]:text-white/90"
                        )}
                      >
                        <SelectValue placeholder="Select your job title" />
                      </SelectTrigger>
                      <SelectContent className={cn(isBright ? "border-black/10 bg-white" : "border-white/10 bg-[#1a1a2e]")}>
                        {JOB_TITLE_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className={cn(
                              isBright
                                ? "text-black focus:bg-black/5 focus:text-black"
                                : "text-white focus:bg-white/10 focus:text-white"
                            )}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={cn("mb-2 block text-sm", isBright ? "text-black/60" : "text-white/60")}>Industry</label>
                    <Input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className={cn(
                        isBright
                          ? "border-black/15 bg-white/80 text-black placeholder:text-black/40"
                          : "border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      )}
                      placeholder="e.g. Technology, Healthcare, Education"
                      required
                    />
                  </div>
                  <div>
                    <label className={cn("mb-2 block text-sm", isBright ? "text-black/60" : "text-white/60")}>
                      What do you plan to use Clarte for?
                    </label>
                    <Textarea
                      value={formData.useCase}
                      onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                      className={cn(
                        "min-h-[150px]",
                        isBright
                          ? "border-black/15 bg-white/80 text-black placeholder:text-black/40"
                          : "border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      )}
                      placeholder="Describe how you plan to use Clarte..."
                      required
                    />
                  </div>
                  {isStudent && (
                    <div>
                      <label className={cn("mb-2 block text-sm", isBright ? "text-black/60" : "text-white/60")}>School email</label>
                      <Input
                        type="email"
                        value={formData.schoolEmail}
                        onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
                        className={cn(
                          isBright
                            ? "border-black/15 bg-white/80 text-black placeholder:text-black/40"
                            : "border-white/20 bg-white/5 text-white placeholder:text-white/40"
                        )}
                        placeholder="you@university.edu"
                      />
                    </div>
                  )}
                  <Button
                    type="submit"
                    className={cn("w-full", isBright ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90")}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </AnimateOnScroll>
      </main>

      <Footer />
    </div>
  )
}
