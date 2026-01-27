import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Clarte",
    features: [
      "100 minutes/month",
      "2 voice options",
      "Basic API access",
      "Community support",
    ],
    cta: "Get Started",
    href: "/auth/sign-up",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$15",
    period: "/month",
    description: "For individuals and small projects",
    features: [
      "500 minutes/month",
      "5 voice options",
      "Standard API access",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$30",
    period: "/month",
    description: "For growing businesses",
    features: [
      "2,000 minutes/month",
      "All voice options",
      "Full API access",
      "Priority support",
      "Custom voice training",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale deployments",
    features: [
      "Unlimited minutes",
      "Custom voices",
      "Dedicated support",
      "SLA guarantee",
      "On-premise option",
      "Custom integrations",
      "Advanced security",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
]

const faqs = [
  {
    question: "What counts as a minute?",
    answer: "A minute is counted as 60 seconds of audio processed, including both input speech and generated responses.",
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, Pro plan comes with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Simple, Transparent Pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-blue-500/50 bg-[#1a1a2e]/70"
                  : "border-white/10 bg-[#1a1a2e]/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="ml-1 text-white/60">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-white/60">{plan.description}</p>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                      <Check className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-white text-black hover:bg-white/90"
                      : "border-white/20 bg-transparent text-white hover:bg-white/10"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6"
              >
                <h3 className="font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm text-white/60">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Need a Custom Plan?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Contact our sales team to discuss custom pricing for your specific needs.
          </p>
          <Link href="/contact">
            <Button className="mt-6 bg-white text-black hover:bg-white/90">
              Contact Sales
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
