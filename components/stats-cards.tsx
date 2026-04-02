"use client"

import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"
import type { Task } from "@/lib/actions"

interface StatsCardsProps {
  tasks: Task[]
  focusedTaskName?: string | null
}

export function StatsCards({ tasks, focusedTaskName }: StatsCardsProps) {
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length
  const todoTasks = tasks.filter((t) => t.status !== "done").length
  const overdueTasks = tasks.filter((t) => {
    if (t.status === "done" || !t.due_date) return false
    const now = new Date()
    const dueDate = new Date(t.due_date)
    if (t.due_time) {
      const [hours, minutes] = t.due_time.split(":").map(Number)
      dueDate.setHours(hours, minutes, 0, 0)
    }
    return dueDate < now
  }).length
  const newTasks = tasks.filter((t) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return new Date(t.created_at) > oneDayAgo && t.status !== "done"
  }).length
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{totalTasks}</p>
            <p className="text-sm text-muted-foreground">Total tasks today</p>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {newTasks} new
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-accent">{doneTasks}</p>
            <p className="text-sm text-muted-foreground">Done</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-accent" />
        </div>
        <p className="text-xs text-accent mt-2 font-medium">on track</p>
      </div>

      {/* <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-bold text-foreground">{inProgressTasks}</p>
          <p className="text-sm text-muted-foreground">In progress</p>
        </div>
        <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
      </div>
      {focusedTaskName ? (
        <p className="text-xs text-yellow-500 mt-2 font-medium truncate flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
          {focusedTaskName}
        </p>
      ) : overdueTasks > 0 ? (
        <p className="text-xs text-destructive mt-2 font-medium flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {overdueTasks} overdue
        </p>
      ) : null}
    </div> */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{todoTasks}</p>
            <p className="text-sm text-muted-foreground font-medium">Tasks To Do</p>
          </div>
          <Clock className="h-5 w-5 text-orange-500/50" />
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-3xl font-bold text-foreground">{progressPercent}%</p>
            <p className="text-sm font-medium text-foreground">Daily Progress</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mb-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Keep it up — you&apos;re ahead!
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {doneTasks} done · {totalTasks - doneTasks} left
        </p>
      </div>
    </div>
  )
}
