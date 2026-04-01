"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  Settings,
  Sparkles,
  LogOut,
  Moon,
  Sun,
  Briefcase,
  User,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  activeFilter: string
  onFilterChange: (filter: string) => void
  userName: string
  timerRunning: boolean
  timerSecondsLeft: number
  timerTaskName: string | null
}

const mainNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "focus", label: "Focus Mode", icon: Clock },
]

const filterItems = [
  { id: "all", label: "All Tasks", icon: CheckSquare, count: 0 },
  { id: "work", label: "Work", icon: Briefcase, count: 0 },
  { id: "personal", label: "Personal", icon: User, count: 0 },
  { id: "urgent", label: "Urgent", icon: AlertTriangle, count: 0 },
]

export function AppSidebar({
  activeView,
  onViewChange,
  activeFilter,
  onFilterChange,
  userName,
  timerRunning,
  timerSecondsLeft,
  timerTaskName,
}: AppSidebarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">EasyTask</h1>
            <p className="text-xs text-sidebar-foreground/60">Focus Assistant</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3">
          Navigation
        </p>
      {mainNavItems.map((item) => {
        const Icon = item.icon
        const isActive = activeView === item.id
        const isFocus = item.id === "focus"

        return (
          <div key={item.id}>
            <Button
              variant={isActive ? "default" : "ghost"}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2.5 h-auto",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {isFocus && timerRunning && (
                <span className="ml-auto flex items-center gap-1.5 bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  ● LIVE
                </span>
              )}
            </Button>

            {/* Mini timer strip — shows under Focus Mode when running + not on focus view */}
            {isFocus && timerRunning && activeView !== "focus" && (
              <div
                onClick={() => onViewChange("focus")}
                className="mx-1 mt-1 mb-1 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
              >
                <p className="text-[10px] font-semibold text-primary truncate">
                  {timerTaskName ?? "Timer running"}
                </p>
                <p className="text-[11px] font-mono font-bold text-foreground mt-0.5">
                  {String(Math.floor(timerSecondsLeft / 60)).padStart(2, "0")}:
                  {String(timerSecondsLeft % 60).padStart(2, "0")}
                </p>
              </div>
            )}
          </div>
        )
      })}

        {/* Categories */}
        <div className="pt-6">
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3">
            Categories
          </p>
          {filterItems.map((item) => {
            const Icon = item.icon
            const isActive = activeFilter === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 h-auto",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          onClick={() => onViewChange("settings")}
          className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60">Pro Plan</p>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="p-1.5 h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
