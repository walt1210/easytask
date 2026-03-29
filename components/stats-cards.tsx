"use client"

import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"
import type { Task } from "@/lib/actions"

interface StatsCardsProps {
  tasks: Task[]
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length
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

      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{inProgressTasks}</p>
            <p className="text-sm text-muted-foreground">In progress</p>
          </div>
          <Clock className="h-5 w-5 text-yellow-500" />
        </div>
        {overdueTasks > 0 && (
          <p className="text-xs text-destructive mt-2 font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {overdueTasks} overdue
          </p>
        )}
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
