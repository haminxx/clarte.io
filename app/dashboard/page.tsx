"use client"

import { useEffect, useState } from "react"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { LogOut, MessageSquare, Settings, User as UserIcon } from "lucide-react"

interface ConversationDoc {
  id: string
  title?: string
  updated_at?: { toDate?: () => Date }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<ConversationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      router.replace("/auth/login")
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        router.replace("/auth/login")
        return
      }
      if (!db) {
        setLoading(false)
        return
      }
      const q = query(
        collection(db, "conversations"),
        where("user_id", "==", u.uid),
        orderBy("updated_at", "desc"),
        limit(10)
      )
      getDocs(q)
        .then((snap) => {
          setConversations(
            snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              updated_at: d.data().updated_at,
            })) as ConversationDoc[]
          )
        })
        .catch((err) => {
          if (err?.message?.includes("index")) {
            console.warn("Firestore index required. Create the composite index at the URL in the error:", err)
          }
          setConversations([])
        })
        .finally(() => setLoading(false))
    })
    return () => unsub()
  }, [auth, db, router])

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
          <Link href="/" className="mt-4 inline-block text-white underline">Back to home</Link>
        </div>
      </div>
    )
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a14]">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
        </div>
        <header className="relative z-10 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="h-7 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-9 w-20 animate-pulse rounded bg-white/10" />
          </div>
        </header>
        <main className="relative z-10 mx-auto flex-1 max-w-7xl px-4 py-12">
          <div className="mb-8">
            <div className="h-9 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-5 w-72 animate-pulse rounded bg-white/10" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-white/10" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-full animate-pulse rounded bg-white/10" />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
              <div className="mb-4 h-6 w-40 animate-pulse rounded bg-white/10" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full animate-pulse rounded bg-white/10" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-8 w-12 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a14]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            Clarte
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">{user.email}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex-1 max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-white/60">Manage your voice conversations and settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full justify-start bg-white/5 text-white hover:bg-white/10">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start New Conversation
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start border-white/20 bg-transparent text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20 bg-transparent text-white hover:bg-white/10">
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Recent Conversations</h2>
            {conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{conv.title || "Untitled Conversation"}</p>
                      <p className="text-sm text-white/40">
                        {conv.updated_at?.toDate?.()?.toLocaleDateString?.() ?? "—"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-white/20" />
                <p className="text-white/40">No conversations yet</p>
                <Link href="/">
                  <Button className="mt-4 bg-white text-black hover:bg-white/90">
                    Start Your First Conversation
                  </Button>
                </Link>
              </div>
            )}
          </div>
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
  )
}
