"use client"

import { useMemo } from "react"
import { Task } from "@/lib/actions"
import { rankTasks } from "@/lib/sorting"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type EnergyLevel } from "@/lib/store"

interface SuggestedTaskProps {
  tasks: Task[];
  currentEnergy: EnergyLevel;
}

export function SuggestedTask({ tasks, currentEnergy }: SuggestedTaskProps) {
  const suggestion = useMemo(() => {
    const ranked = rankTasks(tasks, currentEnergy)
    return ranked.find(t => t.status !== "done") || null
  }, [tasks, currentEnergy])

  if (!suggestion) return null

  // Determine the "Why" badge based on task attributes
  const getReasonBadge = () => {
    if (suggestion.tag === "urgent") return { label: "High Urgency", icon: Clock, color: "text-red-500 bg-red-500/10" };
    if (suggestion.energy_required === currentEnergy) return { label: "Perfect Energy Match", icon: Zap, color: "text-amber-500 bg-amber-500/10" };
    return { label: "Top Priority", icon: Star, color: "text-primary bg-primary/10" };
  };

  const reason = getReasonBadge();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-background overflow-hidden shadow-sm mb-8">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Accent Side Bar */}
          <div className="w-1.5 bg-primary" />
          
          <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`border-none font-bold py-1 ${reason.color}`}>
                  <reason.icon className="w-3 h-3 mr-1.5" />
                  {reason.label}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {suggestion.title}
                </h3>
                {suggestion.description && (
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                    {suggestion.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="flex flex-col items-start md:items-end">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Details</span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {suggestion.tag}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {suggestion.energy_required} Energy
                  </Badge>
                </div>
              </div>
              
              {/* Visual Decorative Icon */}
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary/40">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}