"use client"

import { Clock, AlertTriangle, CheckCircle2, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/actions"

interface FocusCardProps {
  task: Task | null
  onMarkDone: (id: string) => void
  onSkip: (id: string) => void
}

function getTimeAgo(date: string): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "just now"
  if (hours === 1) return "1 hour ago"
  return `${hours} hours ago`
}

function getEstimatedTime(task: Task): string {
  switch (task.energy_required) {
    case "high":
      return "45 min"
    case "medium":
      return "30 min"
    case "low":
      return "15 min"
  }
}

export function FocusCard({ task, onMarkDone, onSkip }: FocusCardProps) {
  if (!task) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-border shadow-sm">
        <p className="text-sm font-medium text-primary mb-2">Focus Now</p>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">No urgent tasks to focus on</p>
          </div>
        </div>
      </div>
    )
  }

  const isUrgent = task.tag === "urgent"
  const dueTime = task.due_time
    ? `Today, ${new Date(`2000-01-01T${task.due_time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    : "No deadline"

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-border shadow-sm">
      <p className="text-sm font-medium text-primary mb-4">Focus Now</p>
      
      <h3 className="text-xl font-semibold text-foreground mb-2 text-balance">
        {task.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2 flex-wrap">
        <span>Last edited {getTimeAgo(task.created_at)}</span>
        <span>·</span>
        <span>Estimated {getEstimatedTime(task)}</span>
        <span>·</span>
        <span className="capitalize">{task.energy_required} energy task</span>
      </p>

      <div className="flex gap-3 mb-5">
        <Button onClick={() => onMarkDone(task.id)} className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Mark Done
        </Button>
        <Button variant="outline" onClick={() => onSkip(task.id)} className="gap-2">
          <SkipForward className="h-4 w-4" />
          Skip for now
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Deadline</span>
          <span>{dueTime}</span>
        </div>
        {isUrgent && (
          <span className="flex items-center gap-1 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-medium">
            <AlertTriangle className="h-3 w-3" />
            Urgent
          </span>
        )}
      </div>
    </div>
  )
}
