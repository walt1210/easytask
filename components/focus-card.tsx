"use client"

import { Clock, AlertTriangle, CheckCircle2, Zap, Star, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/actions"
import { type EnergyLevel } from "@/lib/store"

interface FocusCardProps {
  task: Task | null
  currentEnergy: EnergyLevel
  onMarkDone: (id: string) => void
  onFocusMode: () => void // New redirect handler
}

export function FocusCard({ task, currentEnergy, onMarkDone, onFocusMode }: FocusCardProps) {
  if (!task) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
        <CheckCircle2 className="h-12 w-12 text-primary/40 mx-auto mb-3" />
        <p className="text-lg font-medium text-foreground">All caught up!</p>
        <p className="text-sm text-muted-foreground">No pending tasks match your filters.</p>
      </div>
    )
  }

  // Reason logic moved here for the unified "Energy Match / Focus Now" UI
  const getReason = () => {
    if (task.tag === "urgent") return { label: "High Urgency", icon: Clock, color: "text-red-500 bg-red-500/10" };
    if (task.energy_required === currentEnergy) return { label: "Perfect Energy Match", icon: Zap, color: "text-orange-500 bg-orange-500/10" };
    return { label: "Top Priority", icon: Star, color: "text-primary bg-primary/10" };
  };

  const reason = getReason();
  const dueTime = task.due_time ? `Today, ${task.due_time}` : "No deadline";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-background rounded-2xl p-6 border-2 border-primary/20 shadow-sm">
      {/* Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`border-none font-bold py-1 ${reason.color}`}>
              <reason.icon className="w-3 h-3 mr-1.5" />
              {reason.label}
            </Badge>
            <span className="text-xs font-medium text-primary uppercase tracking-tighter">Focus Now</span>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground leading-tight mb-1">
              {task.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-1">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{dueTime}</span>
            </div>
            <div className="flex items-center gap-1.5 capitalize">
              <Zap className="h-3.5 w-3.5" />
              <span>{task.energy_required} Energy</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={onFocusMode} 
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-bold shadow-lg shadow-primary/20"
          >
            <Play className="h-4 w-4 fill-current" />
            Do Now
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onMarkDone(task.id)} 
            className="gap-2 border-primary/20 hover:bg-primary/5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}