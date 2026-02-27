"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User as UserIcon,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard", icon: MessageSquare, label: "Conversations" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/profile", icon: UserIcon, label: "Profile" },
  ]

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
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive =
              (href === "/dashboard" && pathname === "/dashboard") ||
              (href === "/profile" && pathname === "/profile") ||
              (href === "/settings" && pathname === "/settings")
            return (
              <Tooltip key={href + label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white",
                      isActive ? "bg-white/10 text-white" : "text-white/60"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          })}
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
