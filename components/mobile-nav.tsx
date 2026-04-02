"use client"

import {
  Menu, X, Sparkles, LayoutDashboard, Calendar,
  Clock, Settings, LogOut, Moon, Sun,
  Briefcase, User, AlertTriangle, CheckSquare, Timer, Plus,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeView: string
  onViewChange: (view: string) => void
  activeFilter: string
  onFilterChange: (filter: string) => void
  userName: string
  timerRunning?: boolean
  timerSecondsLeft?: number
  timerTaskName?: string | null
  onAddTask?: () => void
}

// Bottom tab bar items only
const tabItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar",  label: "Calendar",  icon: Calendar         },
  { id: "focus",     label: "Focus",     icon: Clock            },
  { id: "settings",  label: "Settings",  icon: Settings         },
]

// Drawer categories only
const filterItems = [
  { id: "all",      label: "All Tasks", icon: CheckSquare   },
  { id: "work",     label: "Work",      icon: Briefcase     },
  { id: "personal", label: "Personal",  icon: User          },
  { id: "urgent",   label: "Urgent",    icon: AlertTriangle },
]

function formatTime(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0")
  const s = String(seconds % 60).padStart(2, "0")
  return `${m}:${s}`
}

export function MobileNav({
  activeView,
  onViewChange,
  activeFilter,
  onFilterChange,
  userName,
  timerRunning = false,
  timerSecondsLeft = 0,
  timerTaskName = null,
  onAddTask,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const navigate = (view: string) => {
    onViewChange(view)
    setIsOpen(false)
  }

  const applyFilter = (f: string) => {
    onFilterChange(f)
    // Switch to dashboard to show filtered results
    if (activeView !== "calendar") onViewChange("dashboard")
    setIsOpen(false)
  }

  return (
    <>
      {/* ── Fixed top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-base font-bold text-sidebar-foreground">EasyTask</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live timer chip */}
            {timerRunning && (
              <button
                onClick={() => navigate("focus")}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1.5 rounded-full animate-pulse"
              >
                <Timer className="h-3 w-3" />
                {formatTime(timerSecondsLeft)}
              </button>
            )}

            {/* Add Task */}
            {onAddTask && (
              <Button size="sm" onClick={onAddTask} className="gap-1.5 h-8 px-3 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            )}

            {/* Hamburger — opens category drawer */}
            <button
              onClick={() => setIsOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-[57px]" />

      {/* ── Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border flex items-stretch">
        {tabItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const isFocus = item.id === "focus"
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative transition-colors",
                isActive
                  ? "text-primary"
                  : "text-sidebar-foreground/50 active:text-sidebar-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isFocus && timerRunning && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-primary" : "text-sidebar-foreground/50"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Spacer for tab bar — prevents content being hidden behind it */}
      <div className="lg:hidden h-[60px]" />

      {/* ── Category Drawer (hamburger) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel — slides from right */}
          <div className="absolute right-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground shadow-xl flex flex-col">

            {/* Drawer header */}
            <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-sidebar-foreground leading-none">EasyTask</p>
                  <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Focus Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">

              {/* Live timer strip */}
              {timerRunning && (
                <button
                  onClick={() => navigate("focus")}
                  className="w-full mb-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors flex items-center justify-between"
                >
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-wider">
                      Timer Running
                    </p>
                    <p className="text-xs font-medium text-primary-foreground truncate">
                      {timerTaskName ?? "Focus session"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <p className="text-base font-mono font-bold text-primary-foreground">
                      {formatTime(timerSecondsLeft)}
                    </p>
                    <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                  </div>
                </button>
              )}

              {/* Add Task */}
              {onAddTask && (
                <Button
                  onClick={() => { onAddTask(); setIsOpen(false) }}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Task
                </Button>
              )}

              {/* Categories */}
              <div className="pt-3">
                <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2 px-2">
                  Filter by Category
                </p>
                {filterItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeFilter === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => applyFilter(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex-shrink-0 border-t border-sidebar-border p-4 space-y-1">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>

            {/* User profile */}
            <div className="flex-shrink-0 border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm flex-shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">{userName}</p>
                  <p className="text-xs text-sidebar-foreground/50">Pro Plan</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
