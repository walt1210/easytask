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

const mainNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar",  label: "Calendar",  icon: Calendar         },
  { id: "focus",     label: "Focus",     icon: Clock            },
]

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

  const filter = (f: string) => {
    onFilterChange(f)
    setIsOpen(false)
  }

  return (
    <>
      {/* ── Fixed top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">EasyTask</span>
          </div>

          <div className="flex items-center gap-2">
            {timerRunning && (
              <button
                onClick={() => navigate("focus")}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full animate-pulse"
              >
                <Timer className="h-3 w-3" />
                {formatTime(timerSecondsLeft)}
              </button>
            )}
            {onAddTask && (
              <Button
                size="sm"
                onClick={onAddTask}
                className="gap-1.5 h-8 px-3 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="text-sidebar-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="lg:hidden h-[60px]" />

      {/* ── Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border px-2 py-2 flex items-center justify-around">
        {mainNavItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const isFocus = item.id === "focus"
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all relative",
                isActive ? "text-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isFocus && timerRunning && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
        <button
          onClick={() => navigate("settings")}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all relative",
            activeView === "settings" ? "text-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
          {activeView === "settings" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </nav>

      <div className="lg:hidden h-[64px]" />

      {/* ── Slide-in drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground shadow-xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-sidebar-foreground">EasyTask</h1>
                  <p className="text-xs text-sidebar-foreground/60">Focus Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={() => setIsOpen(false)}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable nav */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">

              {/* Live timer strip */}
              {timerRunning && (
                <button
                  onClick={() => navigate("focus")}
                  className="w-full mb-4 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors flex items-center justify-between"
                >
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-primary-foreground/80 uppercase tracking-wider">
                      Timer Running
                    </p>
                    <p className="text-xs font-medium text-primary-foreground truncate">
                      {timerTaskName ?? "Focus session"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <p className="text-lg font-mono font-bold text-primary-foreground">
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
                  className="w-full gap-2 mb-4"
                >
                  <Plus className="h-4 w-4" />
                  Add New Task
                </Button>
              )}

              {/* Navigation — no "All Tasks" */}
              <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3 pt-2">
                Navigation
              </p>
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                const isFocus = item.id === "focus"
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => navigate(item.id)}
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
                      <span className="ml-auto flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        ● LIVE
                      </span>
                    )}
                  </Button>
                )
              })}

              {/* Categories */}
              <div className="pt-5">
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
                      onClick={() => filter(item.id)}
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
            </div>

            {/* Bottom actions */}
            <div className="flex-shrink-0 p-4 border-t border-sidebar-border space-y-1">
              <Button
                variant="ghost"
                onClick={() => navigate("settings")}
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

            {/* User */}
            <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm flex-shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                  <p className="text-xs text-sidebar-foreground/60">Pro Plan</p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  onClick={handleLogout}
                  className="p-1.5 h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
