"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Search, Bell, X, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGreeting, formatDate } from "@/lib/store"
import { type Task } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface HeaderProps {
  userName: string
  onAddTask: () => void
  tasks: Task[]
  onSearchSelect: (id: string) => void
}

export function Header({ userName, onAddTask, tasks, onSearchSelect }: HeaderProps) {
  const [greeting, setGreeting] = useState("Hello")
  const [date, setDate] = useState("")

  // Search
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setGreeting(getGreeting())
    setDate(formatDate())
  }, [])

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [searchOpen])

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [notifOpen])

  // Close search on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    if (searchOpen) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [searchOpen])

  // ── Search results
  const searchResults = query.trim().length === 0 ? [] : tasks.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6)

  // ── Notifications: overdue + due today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === "done") return false
    return new Date(t.due_date + "T00:00:00") < today
  })

  const dueTodayTasks = tasks.filter(t => {
    if (!t.due_date || t.status === "done") return false
    return new Date(t.due_date + "T00:00:00").toDateString() === today.toDateString()
  })

  const recentlyDone = tasks.filter(t => {
    if (t.status !== "done" || !t.completed_at) return false
    const completedAt = new Date(t.completed_at)
    const diffHours = (Date.now() - completedAt.getTime()) / 1000 / 60 / 60
    return diffHours < 24
  }).slice(0, 3)

  const totalNotifs = overdueTasks.length + dueTodayTasks.length

  const tagColors: Record<string, string> = {
    urgent:   "text-destructive",
    work:     "text-blue-500",
    personal: "text-accent",
  }

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            {date || "\u00A0"}
          </p>
          <div className="flex items-center gap-2">

            {/* ── Search Button */}
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* ── Notifications Button + Dropdown */}
            <div className="relative" ref={notifRef}>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setNotifOpen(prev => !prev)}
              >
                <Bell className="h-4 w-4" />
                {totalNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                    {totalNotifs > 9 ? "9+" : totalNotifs}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="font-semibold text-sm">Notifications</span>
                    {totalNotifs > 0 && (
                      <span className="text-xs text-muted-foreground">{totalNotifs} unread</span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {overdueTasks.length === 0 && dueTodayTasks.length === 0 && recentlyDone.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                        <CheckCircle2 className="h-8 w-8 opacity-30" />
                        <p className="text-sm">All caught up!</p>
                      </div>
                    )}

                    {overdueTasks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wider px-4 py-2 bg-destructive/5">
                          Overdue · {overdueTasks.length}
                        </p>
                        {overdueTasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => { onSearchSelect(task.id); setNotifOpen(false) }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Due {new Date(task.due_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {dueTodayTasks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider px-4 py-2 bg-primary/5">
                          Due Today · {dueTodayTasks.length}
                        </p>
                        {dueTodayTasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => { onSearchSelect(task.id); setNotifOpen(false) }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className={cn("text-xs font-medium", tagColors[task.tag])}>
                                {task.tag.charAt(0).toUpperCase() + task.tag.slice(1)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {recentlyDone.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 bg-muted/30">
                          Completed Today
                        </p>
                        {recentlyDone.map(task => (
                          <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                            <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate line-through text-muted-foreground">
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">Done</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={onAddTask} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
          {greeting}, <span className="text-primary">{userName}</span>.
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what you need to focus on today.
        </p>
      </header>

      {/* ── Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim().length === 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Recent
                  </p>
                  {tasks.slice(0, 4).map(task => (
                    <button
                      key={task.id}
                      onClick={() => { onSearchSelect(task.id); setSearchOpen(false) }}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        task.tag === "urgent"   ? "bg-destructive" :
                        task.tag === "work"     ? "bg-blue-500" : "bg-accent"
                      )} />
                      <span className="text-sm flex-1 truncate">{task.title}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        task.status === "done"
                          ? "bg-muted text-muted-foreground line-through"
                          : "bg-primary/10 text-primary"
                      )}>
                        {task.status === "done" ? "Done" : task.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {query.trim().length > 0 && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <Search className="h-7 w-7 opacity-30" />
                  <p className="text-sm">No tasks match &quot;{query}&quot;</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Results · {searchResults.length}
                  </p>
                  {searchResults.map(task => (
                    <button
                      key={task.id}
                      onClick={() => { onSearchSelect(task.id); setSearchOpen(false) }}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        task.tag === "urgent"   ? "bg-destructive" :
                        task.tag === "work"     ? "bg-blue-500" : "bg-accent"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          task.status === "done" && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                        )}
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                        task.status === "done"
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      )}>
                        {task.status === "done" ? "Done" : task.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">Esc</kbd> to close</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}