"use client"

import { Flame, Zap, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EnergyLevel } from "@/lib/store"

interface EnergySelectorProps {
  value: EnergyLevel
  onChange: (value: EnergyLevel) => void
}

const energyOptions: { value: EnergyLevel; label: string; icon: typeof Flame; color: string }[] = [
  { value: "high",   label: "High",   icon: Flame, color: "text-orange-500" },
  { value: "medium", label: "Medium", icon: Zap,   color: "text-yellow-500" },
  { value: "low",    label: "Low",    icon: Leaf,  color: "text-green-500"  },
]

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full">
      <p className="text-sm text-muted-foreground mb-3">Energy today</p>
      <div className="grid grid-cols-3 gap-1.5">
        {energyOptions.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all text-sm font-medium w-full",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isSelected ? "text-primary-foreground" : option.color)} />
              <span className="truncate">{option.label}</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {value === "high"   && "High energy — showing deep-work tasks first"}
        {value === "medium" && "Medium energy — balanced task priority"}
        {value === "low"    && "Low energy — showing lighter tasks first"}
      </p>
    </div>
  )
}