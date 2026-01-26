import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, MessageSquare, Settings, User } from "lucide-react"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            Clarte
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">{user.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-white/60">Manage your voice conversations and settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Quick Actions */}
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
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Recent Conversations</h2>
            {conversations && conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{conv.title || "Untitled Conversation"}</p>
                      <p className="text-sm text-white/40">
                        {new Date(conv.updated_at).toLocaleDateString()}
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

        {/* Stats */}
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6">
            <p className="text-sm text-white/40">Total Conversations</p>
            <p className="mt-2 text-3xl font-bold text-white">{conversations?.length || 0}</p>
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
    </div>
  )
}
