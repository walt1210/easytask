"use client"

import {
  CheckCircle2,
  Circle,
  Clock,
  Briefcase,
  Home,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/actions"

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onDeleteTask?: (id: string) => void
  onEditTask?: (id: string, updates: Partial<Task>) => void
}

type TaskTag = "work" | "personal" | "urgent"

const tagIcons: Record<TaskTag, typeof Briefcase> = {
  work: Briefcase,
  personal: Home,
  urgent: AlertTriangle,
}

const tagColors: Record<TaskTag, string> = {
  work: "bg-primary/10 text-primary",
  personal: "bg-accent/10 text-accent",
  urgent: "bg-destructive/10 text-destructive",
}

export function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskListProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Today&apos;s Tasks</h2>
          <span className="text-sm text-muted-foreground">
            {tasks.filter(t => t.status === "done").length} of {tasks.length} completed
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, updates: Partial<Task>) => void
}) {
  const isDone = task.status === "done"
  const TagIcon = tagIcons[task.tag]

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getDueText = () => {
    if (isDone && task.completed_at) {
      return `Done at ${formatTime(task.completed_at)}`
    }
    if (task.due_date) {
      const today = new Date()
      const dueDate = new Date(task.due_date)
      const isToday = dueDate.toDateString() === today.toDateString()
      const isTomorrow =
        dueDate.toDateString() ===
        new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()

      if (isToday && task.due_time) {
        return `Today ${new Date(`2000-01-01T${task.due_time}`).toLocaleTimeString(
          "en-US",
          { hour: "numeric", minute: "2-digit", hour12: true }
        )}`
      }
      if (isTomorrow) return "Tomorrow"
      return dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
    return null
  }

  const dueText = getDueText()

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors",
        isDone && "opacity-60"
      )}
    >
      <button
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        onClick={() => onToggle(task.id)}
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-accent" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggle(task.id)}>
        <p
          className={cn(
            "font-medium text-foreground truncate",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {(task.description || dueText) && (
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
            {dueText && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {dueText}
              </span>
            )}
            {task.description && dueText && <span>·</span>}
            {task.description && (
              <span className="truncate">{task.description}</span>
            )}
          </p>
        )}
      </div>

      <span
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
          tagColors[task.tag]
        )}
      >
        <TagIcon className="h-3 w-3" />
        {task.tag}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onEdit?.(task.id, { status: isDone ? "todo" : "done" })}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isDone ? "Mark as Todo" : "Mark as Done"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(task.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
