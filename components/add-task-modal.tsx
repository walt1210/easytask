"use client"

import { useState } from "react"
import { X, Briefcase, Home, AlertTriangle, Zap, Activity, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TaskTag = "work" | "personal" | "urgent"
type EnergyLevel = "high" | "medium" | "low"

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (task: {
    title: string
    description?: string
    dueDate?: Date
    dueTime?: string
    tag: TaskTag
    energyRequired: EnergyLevel
  }) => void
}

const tags: { value: TaskTag; label: string; icon: typeof Briefcase }[] = [
  { value: "work", label: "Work", icon: Briefcase },
  { value: "personal", label: "Personal", icon: Home },
  { value: "urgent", label: "Urgent", icon: AlertTriangle },
]

const energyLevels: { value: EnergyLevel; label: string; icon: typeof Zap }[] = [
  { value: "high", label: "High", icon: Zap },
  { value: "medium", label: "Medium", icon: Activity },
  { value: "low", label: "Low", icon: Battery },
]

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")
  const [tag, setTag] = useState<TaskTag>("work")
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>("medium")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dueTime: dueTime || undefined,
      tag,
      energyRequired,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setDueDate("")
    setDueTime("")
    setTag("work")
    setEnergyRequired("medium")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            What do you need to get done today?
          </p>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Task title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Due date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Time
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Tag
            </label>
            <div className="flex gap-2">
              {tags.map((t) => {
                const Icon = t.icon
                const isSelected = tag === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTag(t.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Energy Required
            </label>
            <div className="flex gap-2">
              {energyLevels.map((e) => {
                const Icon = e.icon
                const isSelected = energyRequired === e.value
                return (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setEnergyRequired(e.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {e.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
