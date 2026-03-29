"use client"

import { Sparkles, ArrowRight } from "lucide-react"
import type { Task } from "@/lib/actions"

interface SmartSuggestionProps {
  tasks: Task[]
  onApply: () => void
}

export function SmartSuggestion({ tasks, onApply }: SmartSuggestionProps) {
  // Find a personal task that might conflict with the current focused task
  const upcomingPersonalTask = tasks.find(
    (t) =>
      t.tag === "personal" &&
      t.status !== "done" &&
      t.due_date &&
      new Date(t.due_date).toDateString() === new Date().toDateString()
  )

  if (!upcomingPersonalTask) return null

  const dueTime = upcomingPersonalTask.due_time
    ? new Date(`2000-01-01T${upcomingPersonalTask.due_time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "later"

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-800/30 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-2">
          <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </div>
        <p className="text-sm text-foreground">
          <span className="font-medium">Smart sort:</span>{" "}
          <span className="text-muted-foreground">
            {upcomingPersonalTask.title.split("—")[0].trim()} is due at {dueTime} — consider scheduling it after your current task.
          </span>
        </p>
      </div>
      <button
        onClick={onApply}
        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors shrink-0"
      >
        Apply suggestion <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
