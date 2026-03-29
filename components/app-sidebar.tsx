"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  activeFilter: string
  onFilterChange: (filter: string) => void
  userName: string
}

const mainNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "All Tasks", icon: CheckSquare },
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
}: AppSidebarProps) {
  const router = useRouter()
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
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
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
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
          <Moon className="h-4 w-4" />
          Dark Mode
        </button>
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
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
