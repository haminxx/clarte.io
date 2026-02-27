"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import {
  LogOut,
  MessageSquare,
  Settings,
  User as UserIcon,
  LayoutDashboard,
  Bell,
  Menu,
  ChevronLeft,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StrategyPlanCard, type StrategyPlanItem } from "@/components/dashboard/strategy-plan-card"
import { cn } from "@/lib/utils"

/** Lazy-load VoiceAgentCard to avoid pulling LiveKit into initial bundle. Firestore index: user_id + updated_at. */
const VoiceAgentCard = dynamic(
  () => import("@/components/dashboard/voice-agent-card").then((m) => ({ default: m.VoiceAgentCard })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-[#1a1a2e]/50" /> }
)

interface MindmapNode {
  id: string
  label: string
  type: string
}
interface MindmapEdge {
  from: string
  to: string
}
interface ConversationDoc {
  id: string
  title?: string
  updated_at?: { toDate?: () => Date }
  strategy_plan?: StrategyPlanItem
  summary?: string
  mindmap?: { nodes: MindmapNode[]; edges: MindmapEdge[] }
}

interface DashboardSidebarProps {
  onMobileMenuToggle?: () => void
}

function DashboardSidebar({ onMobileMenuToggle }: DashboardSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-0 flex h-screen w-16 flex-col border-r border-white/10 bg-[#0a0a14]/95 backdrop-blur-md lg:w-16">
      <div className="flex flex-col items-center gap-4 py-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Back to home</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Conversations</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-auto flex flex-col items-center gap-2 pb-4">
        <Link href="/" className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <span className="text-xs font-bold text-white">C</span>
          </div>
          <span className="hidden text-sm font-semibold text-white lg:inline">Clarte</span>
        </Link>
      </div>
    </aside>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<ConversationDoc[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const router = useRouter()
  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()

  const refetchConversations = useCallback(() => {
    if (!db || !user) return
    setConversationsLoading(true)
    const q = query(
      collection(db, "conversations"),
      where("user_id", "==", user.uid),
      orderBy("updated_at", "desc"),
      limit(10)
    )
    getDocs(q)
      .then((snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          updated_at: d.data().updated_at,
          strategy_plan: d.data().strategy_plan as StrategyPlanItem | undefined,
          summary: d.data().summary,
          mindmap: d.data().mindmap,
        })) as ConversationDoc[]
        setConversations(docs)
        setSelectedConvId((prev) => (prev && docs.some((d) => d.id === prev) ? prev : docs[0]?.id ?? null))
      })
      .catch((err) => {
        if (err?.message?.includes("index")) {
          console.warn("Firestore index required. Create the composite index at the URL in the error:", err)
        }
        setConversations([])
      })
      .finally(() => setConversationsLoading(false))
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
    if (!user || !db) return
    setConversationsLoading(true)
    const q = query(
      collection(db, "conversations"),
      where("user_id", "==", user.uid),
      orderBy("updated_at", "desc"),
      limit(10)
    )
    getDocs(q)
      .then((snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          updated_at: d.data().updated_at,
          strategy_plan: d.data().strategy_plan as StrategyPlanItem | undefined,
          summary: d.data().summary,
          mindmap: d.data().mindmap,
        })) as ConversationDoc[]
        setConversations(docs)
        setSelectedConvId((prev) => (prev && docs.some((d) => d.id === prev) ? prev : docs[0]?.id ?? null))
      })
      .catch((err) => {
        if (err?.message?.includes("index")) {
          console.warn("Firestore index required. Create the composite index at the URL in the error:", err)
        }
        setConversations([])
      })
      .finally(() => setConversationsLoading(false))
  }, [user, db])

  const handleSignOut = async () => {
    if (!auth) return
    await signOut(auth)
    router.replace("/")
    router.refresh()
  }

  const selectedPlan = selectedConvId
    ? conversations.find((c) => c.id === selectedConvId)?.strategy_plan
    : conversations[0]?.strategy_plan
  const selectedConvTitle = selectedConvId
    ? conversations.find((c) => c.id === selectedConvId)?.title
    : conversations[0]?.title

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a14]">
        <div className="text-center text-white/60">
          <p>Firebase is not configured.</p>
          <Link href="/" className="mt-4 inline-block text-white underline">Back to home</Link>
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
            <div className="mb-6">
              <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/10" />
            </div>
            <div className="mb-8 h-48 animate-pulse rounded-2xl border border-white/10 bg-[#1a1a2e]/50" />
            <div className="mb-6 h-6 w-56 animate-pulse rounded bg-white/10" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
                <div className="mb-4 h-6 w-40 animate-pulse rounded bg-white/10" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full animate-pulse rounded bg-white/10" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-white/10" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded bg-white/10" />
                  ))}
                </div>
              </div>
            </div>
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="text-xl font-bold text-white">
                Clarte
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
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
                </Tooltip>
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
                    <Link href="/dashboard" className="cursor-pointer text-white">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer text-white">
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
            <h1 className="text-2xl font-bold text-white">Talk to Voice Agent</h1>
            <p className="mt-1 text-sm text-white/60">Start a conversation with Clarte. Ask for research, sources, or planning.</p>
          </div>

          <div className="mb-8">
            <VoiceAgentCard
              userId={user?.uid}
              userDisplayName={user?.displayName ?? null}
              getAuthToken={async () => (user ? (await user.getIdToken?.()) ?? null : null)}
              onConversationSaved={refetchConversations}
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Conversation & Strategy</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Conversation History</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/dashboard">View Conversations</Link>
                </Button>
              </div>
              {conversationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-white/10" />
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.slice(0, 5).map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10",
                        selectedConvId === conv.id && "ring-1 ring-white/20"
                      )}
                      onClick={() => setSelectedConvId(conv.id)}
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-white">{conv.title || "Untitled Conversation"}</p>
                        <Button size="sm" variant="outline" className="shrink-0 border-white/20 bg-transparent text-white hover:bg-white/10" asChild>
                          <Link href="/dashboard">View</Link>
                        </Button>
                      </div>
                      {conv.summary && (
                        <p className="line-clamp-2 text-sm text-white/60">{conv.summary}</p>
                      )}
                      <p className="text-xs text-white/40">
                        {conv.updated_at?.toDate?.()?.toLocaleDateString?.() ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-4 h-12 w-12 text-white/20" />
                  <p className="text-white/40">No conversations yet</p>
                  <p className="mt-1 text-sm text-white/30">Start a conversation above to see history here.</p>
                </div>
              )}
            </div>

            <StrategyPlanCard
              plan={selectedPlan}
              conversationTitle={selectedConvTitle}
              summary={selectedConvId ? conversations.find((c) => c.id === selectedConvId)?.summary : conversations[0]?.summary}
              mindmap={selectedConvId ? conversations.find((c) => c.id === selectedConvId)?.mindmap : conversations[0]?.mindmap}
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <p className="text-sm text-white/40">Total Conversations</p>
              <p className="mt-2 text-3xl font-bold text-white">{conversations.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <p className="text-sm text-white/40">Minutes Used</p>
              <p className="mt-2 text-3xl font-bold text-white">0</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <p className="text-sm text-white/40">Plan</p>
              <p className="mt-2 text-3xl font-bold text-white">Free</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <p className="text-sm text-white/40">API Calls</p>
              <p className="mt-2 text-3xl font-bold text-white">0</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
