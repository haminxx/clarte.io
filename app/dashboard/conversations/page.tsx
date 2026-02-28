"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, subDays, startOfDay } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  LogOut,
  MessageSquare,
  Settings,
  User as UserIcon,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

const DAYS_TO_SHOW = 30

function aggregateCallsByDay(
  conversations: { updated_at?: { toDate?: () => Date } }[]
): { date: string; label: string; calls: number }[] {
  const counts: Record<string, number> = {}
  const today = startOfDay(new Date())

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = subDays(today, DAYS_TO_SHOW - 1 - i)
    const key = format(d, "yyyy-MM-dd")
    counts[key] = 0
  }

  for (const conv of conversations) {
    const ts = conv.updated_at?.toDate?.()
    if (!ts) continue
    const key = format(startOfDay(ts), "yyyy-MM-dd")
    if (key in counts) counts[key] += 1
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, calls]) => ({
      date,
      label: format(new Date(date), "MMM d"),
      calls,
    }))
}

export default function ConversationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<
    { id: string; updated_at?: { toDate?: () => Date } }[]
  >([])
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()

  const chartData = aggregateCallsByDay(conversations)
  const totalCalls = chartData.reduce((s, d) => s + d.calls, 0)
  const prevPeriodCalls = chartData.slice(0, Math.floor(chartData.length / 2)).reduce((s, d) => s + d.calls, 0)

  const fetchConversations = useCallback(() => {
    if (!db || !user) return
    setLoading(true)
    const q = query(
      collection(db, "conversations"),
      where("user_id", "==", user.uid),
      orderBy("updated_at", "desc"),
      limit(200)
    )
    getDocs(q)
      .then((snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          updated_at: d.data().updated_at,
        })) as { id: string; updated_at?: { toDate?: () => Date } }[]
        setConversations(docs)
      })
      .catch((err) => {
        if (err?.message?.includes("index")) {
          console.warn("Firestore index required:", err)
        }
        setConversations([])
      })
      .finally(() => setLoading(false))
  }, [db, user])

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      router.replace("/auth/login")
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        router.replace("/auth/login")
        return
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [auth, router])

  useEffect(() => {
    if (user && db) fetchConversations()
  }, [user, db, fetchConversations])

  const handleSignOut = async () => {
    if (!auth) return
    await signOut(auth)
    router.replace("/")
    router.refresh()
  }

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a14]">
        <div className="text-center text-white/60">
          <p>Firebase is not configured.</p>
          <Link href="/" className="mt-4 inline-block text-white underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a14]">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
        </div>
        <DashboardSidebar />
        <div className="relative z-10 ml-16 flex min-h-screen flex-col lg:ml-16">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="h-7 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-9 w-20 animate-pulse rounded-full bg-white/10" />
            </div>
          </header>
          <main className="relative z-10 mx-auto flex-1 w-full max-w-6xl px-4 py-8">
            <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-[#1a1a2e]/50" />
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a14]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
      </div>

      <DashboardSidebar />

      <div className="relative z-10 ml-16 flex min-h-screen flex-col lg:ml-16">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white lg:hidden"
                onClick={() => {}}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="text-xl font-bold text-white">
                Clarte
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </UITooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full ring-2 ring-white/20 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? undefined} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#1a1a2e]">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-white">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-white focus:bg-white/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex-1 w-full max-w-6xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Conversations</h1>
            <p className="mt-1 text-sm text-white/60">
              Call activity and usage over time
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Active Calls by Day</h2>
                <p className="mt-1 text-3xl font-bold text-white">{totalCalls}</p>
                <p className="text-sm text-white/50">
                  Previous period: {prevPeriodCalls} calls
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/50">Group by</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  1d
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="h-[320px] animate-pulse rounded-lg bg-white/5" />
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(26, 26, 46, 0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                      formatter={(value: number) => [value, "Calls"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar
                      dataKey="calls"
                      fill="rgba(139, 92, 246, 0.8)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/dashboard">
                <MessageSquare className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
