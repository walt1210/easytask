"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Header } from "@/components/header"
import { EnergySelector } from "@/components/energy-selector"
import { StatsCards } from "@/components/stats-cards"
import { FocusCard } from "@/components/focus-card"
import { SmartSuggestion } from "@/components/smart-suggestion"
import { TaskList } from "@/components/task-list"
import { AddTaskModal } from "@/components/add-task-modal"
import { type EnergyLevel } from "@/lib/store"
import { CalendarView } from "@/components/calendar-view"
import { SettingsView } from "../components/settings-view"
import { PomodoroTimer } from "../components/pomodoro-timer"
import { 
  type Task, 
  createTask, 
  updateTaskStatus, 
  deleteTask as deleteTaskAction 
} from "@/lib/actions"
import { Spinner } from "@/components/ui/spinner"
import { rankTasks } from "@/lib/sorting"
import { SuggestedTask } from "@/components/suggested-task"

export default function EasyTaskApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [energy, setEnergy] = useState<EnergyLevel>("high")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [skippedTaskIds, setSkippedTaskIds] = useState<Set<string>>(new Set())
  const [activeView, setActiveView] = useState("dashboard")
  const [activeFilter, setActiveFilter] = useState("all")
  const [userName, setUserName] = useState("User")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const supabase = createClient()

  // ── Pomodoro state (lifted so it persists across view changes)
  const [pomodoroTask, setPomodoroTask]               = useState<Task | null>(null)
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(25 * 60)
  const [pomodoroIsRunning, setPomodoroIsRunning]     = useState(false)
  const [pomodoroMode, setPomodoroMode]               = useState<"work" | "break">("work")
  const [pomodoroSessions, setPomodoroSessions]       = useState(0)
  const [pomodoroPresetIdx, setPomodoroPresetIdx]     = useState(0)
  const [pomodoroCustomWork, setPomodoroCustomWork]   = useState(25)
  const [pomodoroCustomBreak, setPomodoroCustomBreak] = useState(5)

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tasks:", error)
      return
    }

    setTasks(data || [])
  }, [supabase])

  useEffect(() => {
    const checkAuthAndFetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setIsAuthenticated(true)
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User")
      setUserEmail(user.email || "")
      await fetchTasks()
      setIsLoading(false)
    }

    checkAuthAndFetchTasks()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, fetchTasks])

  // Filter tasks by category
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks
    return tasks.filter((t) => t.tag === activeFilter)
  }, [tasks, activeFilter])

  // // Sort tasks based on energy level
  // const sortedTasks = useMemo(() => {
  //   return [...filteredTasks].sort((a, b) => {
  //     // Done tasks at the bottom
  //     if (a.status === "done" && b.status !== "done") return 1
  //     if (b.status === "done" && a.status !== "done") return -1

  //     // Sort by energy match
  //     const energyPriority: Record<EnergyLevel, number> = {
  //       high: energy === "high" ? 0 : energy === "medium" ? 1 : 2,
  //       medium: energy === "medium" ? 0 : 1,
  //       low: energy === "low" ? 0 : energy === "medium" ? 1 : 2,
  //     }

  //     const aPriority = energyPriority[a.energy_required]
  //     const bPriority = energyPriority[b.energy_required]

  //     if (aPriority !== bPriority) return aPriority - bPriority

  //     // Urgent tasks first
  //     if (a.tag === "urgent" && b.tag !== "urgent") return -1
  //     if (b.tag === "urgent" && a.tag !== "urgent") return 1

  //     // Then by due date
  //     if (a.due_date && b.due_date) {
  //       return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  //     }
  //     if (a.due_date) return -1
  //     if (b.due_date) return 1

  //     return 0
  //   })
  // }, [filteredTasks, energy])

  const sortedTasks = useMemo(() => {
    return rankTasks(filteredTasks, energy);
  }, [filteredTasks, energy]);

  // Get the focus task (first non-done, non-skipped task)
  const focusTask = useMemo(() => {
    return sortedTasks.find(
      (t) => t.status !== "done" && !skippedTaskIds.has(t.id)
    ) || null
  }, [sortedTasks, skippedTaskIds])

  // Auto-mark the focus task as "in_progress" when in focus mode
  useEffect(() => {
    if (activeView !== "focus" || !focusTask) return
    if (focusTask.status === "in_progress") return

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === focusTask.id ? { ...t, status: "in_progress" as const } : t
      )
    )
    updateTaskStatus(focusTask.id, "in_progress")
  }, [activeView, focusTask?.id])

  // Handler for the Suggested Task button
  const handleFocusSuggested = useCallback((taskId: string) => {
    // Clear from skipped so it's guaranteed to show in FocusCard
    setSkippedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newStatus = task.status === "done" ? "todo" : "done"
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null }
          : t
      )
    )

    const { error } = await updateTaskStatus(id, newStatus)
    if (error) {
      // Revert on error
      await fetchTasks()
    }

    // Remove from skipped if marking as done
    setSkippedTaskIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleMarkDone = async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: "done" as const, completed_at: new Date().toISOString() }
          : task
      )
    )

    const { error } = await updateTaskStatus(id, "done")
    if (error) {
      await fetchTasks()
    }

    setSkippedTaskIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleSkip = (id: string) => {
    setSkippedTaskIds((prev) => new Set(prev).add(id))
  }

  const handleAddTask = async (taskData: {
    title: string
    description?: string
    dueDate?: Date
    dueTime?: string
    tag: "work" | "personal" | "urgent"
    energyRequired: "high" | "medium" | "low"
  }) => {
    const { task, error } = await createTask({
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.dueDate?.toISOString().split("T")[0],
      due_time: taskData.dueTime,
      tag: taskData.tag,
      energy_required: taskData.energyRequired,
    })

    if (error) {
      console.error("Error creating task:", error)
      return
    }

    if (task) {
      setTasks((prev) => [task, ...prev])
    }
  }

  const handleDeleteTask = async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((task) => task.id !== id))

    const { error } = await deleteTaskAction(id)
    if (error) {
      await fetchTasks()
    }
  }

  const handleEditTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    )

    // For now, just update status if that changed
    if (updates.status) {
      const { error } = await updateTaskStatus(id, updates.status)
      if (error) {
        await fetchTasks()
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter)
          if (activeView !== "calendar") setActiveView("dashboard")
        }}
        userName={userName}
        timerRunning={pomodoroIsRunning}
        timerSecondsLeft={pomodoroSecondsLeft}
        timerTaskName={pomodoroTask?.title ?? null}
      />

        {/* Mobile Navigation */}
        <MobileNav
          activeView={activeView}
          onViewChange={setActiveView}
          activeFilter={activeFilter}
          onFilterChange={(filter) => {
            setActiveFilter(filter)
            if (activeView !== "calendar") setActiveView("dashboard")
          }}
          userName={userName}
          timerRunning={pomodoroIsRunning}
          timerSecondsLeft={pomodoroSecondsLeft}
          timerTaskName={pomodoroTask?.title ?? null}
          onAddTask={() => setIsModalOpen(true)}   // ← add this
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">
      <Header
        userName={userName}
        onAddTask={() => setIsModalOpen(true)}
        tasks={tasks}
        onSearchSelect={(id) => {
          setActiveView("dashboard")
          setActiveFilter("all")
        }}
      />

    {/* ── DASHBOARD / ALL TASKS view ── */}
    {(activeView === "dashboard" || activeView === "tasks") && (
      <>
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-1">
            <EnergySelector value={energy} onChange={setEnergy} />
          </div>
          <div className="lg:col-span-2">
            <StatsCards tasks={tasks} focusedTaskName={pomodoroIsRunning ? pomodoroTask?.title : null} />
          </div>
        </div>
        {/* 2. Pass the central energy state and setter to the SuggestedTask component */}
        <SuggestedTask 
          tasks={tasks} 
          currentEnergy={energy} 
        />
        <div className="space-y-4 mb-6">
          <FocusCard
            task={focusTask}
            onMarkDone={handleMarkDone}
            onSkip={handleSkip}
          />
          <SmartSuggestion tasks={tasks} onApply={() => {}} />
        </div>
        <TaskList
          tasks={sortedTasks}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleEditTask}
        />
      </>
    )}

    {/* ── CALENDAR view ── */}
    {activeView === "calendar" && (
      <CalendarView
        tasks={sortedTasks}
        activeFilter={activeFilter}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
      />
    )}

    {/* ── FOCUS MODE view ── */}
    {activeView === "focus" && (
      <PomodoroTimer
        tasks={tasks}
        onMarkDone={handleMarkDone}
        // persisted state
        selectedTask={pomodoroTask}
        onSelectTask={setPomodoroTask}
        secondsLeft={pomodoroSecondsLeft}
        onSecondsLeftChange={setPomodoroSecondsLeft}
        isRunning={pomodoroIsRunning}
        onIsRunningChange={setPomodoroIsRunning}
        mode={pomodoroMode}
        onModeChange={setPomodoroMode}
        sessionsCompleted={pomodoroSessions}
        onSessionsChange={setPomodoroSessions}
        presetIdx={pomodoroPresetIdx}
        onPresetIdxChange={setPomodoroPresetIdx}
        customWork={pomodoroCustomWork}
        onCustomWorkChange={setPomodoroCustomWork}
        customBreak={pomodoroCustomBreak}
        onCustomBreakChange={setPomodoroCustomBreak}
      />
    )}

    {/* ── SETTINGS view ── */}
    {activeView === "settings" && (
      <SettingsView userName={userName} userEmail={userEmail} />
    )}

    <AddTaskModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onAdd={handleAddTask}
    />
  </div>
</main>
    </div>
  )
}
