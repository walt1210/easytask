"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Play, Pause, RotateCcw, CheckCircle2, ChevronDown,
  Timer, Coffee, Settings2, X, Zap, Flame, Leaf,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/actions"

// ── Types & constants (outside the component)
type TimerMode = "work" | "break"
type Preset = { label: string; work: number; break: number }

const PRESETS: Preset[] = [
  { label: "Pomodoro", work: 25, break: 5  },
  { label: "Long",     work: 50, break: 10 },
  { label: "Short",    work: 15, break: 3  },
  { label: "Custom",   work: 25, break: 5  },
]

const ENERGY_ICONS: Record<string, React.ReactNode> = {
  high:   <Flame className="h-3 w-3" />,
  medium: <Zap   className="h-3 w-3" />,
  low:    <Leaf  className="h-3 w-3" />,
}
const ENERGY_COLORS: Record<string, string> = {
  high:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low:    "bg-green-500/15  text-green-400  border-green-500/30",
}
const TAG_COLORS: Record<string, string> = {
  urgent:   "bg-destructive/15 text-destructive border-destructive/30",
  work:     "bg-blue-500/15 text-blue-400 border-blue-500/30",
  personal: "bg-accent/15 text-accent border-accent/30",
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

// ── Props interface (outside the component)
interface PomodoroTimerProps {
  tasks: Task[]
  onMarkDone: (id: string) => void
  // lifted state
  selectedTask: Task | null
  onSelectTask: (task: Task | null) => void
  secondsLeft: number
  onSecondsLeftChange: (s: number) => void
  isRunning: boolean
  onIsRunningChange: (v: boolean) => void
  mode: TimerMode
  onModeChange: (m: TimerMode) => void
  sessionsCompleted: number
  onSessionsChange: (n: number) => void
  presetIdx: number
  onPresetIdxChange: (n: number) => void
  customWork: number
  onCustomWorkChange: (n: number) => void
  customBreak: number
  onCustomBreakChange: (n: number) => void
}

// ── Single export (outside the component)
export function PomodoroTimer({
  tasks,
  onMarkDone,
  selectedTask,
  onSelectTask,
  secondsLeft,
  onSecondsLeftChange,
  isRunning,
  onIsRunningChange,
  mode,
  onModeChange,
  sessionsCompleted,
  onSessionsChange,
  presetIdx,
  onPresetIdxChange,
  customWork,
  onCustomWorkChange,
  customBreak,
  onCustomBreakChange,
}: PomodoroTimerProps) {

  // ── Local UI-only state (not lifted — doesn't need to persist)
  const [showTaskPicker, setShowTaskPicker] = useState(false)
  const [showCustom, setShowCustom]         = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Use a ref to always have fresh values inside the interval callback
  const secondsLeftRef  = useRef(secondsLeft)
  const modeRef         = useRef(mode)
  const sessionsRef     = useRef(sessionsCompleted)
  const customWorkRef   = useRef(customWork)
  const customBreakRef  = useRef(customBreak)
  const presetIdxRef    = useRef(presetIdx)

  // Keep refs in sync with props
  useEffect(() => { secondsLeftRef.current  = secondsLeft      }, [secondsLeft])
  useEffect(() => { modeRef.current         = mode             }, [mode])
  useEffect(() => { sessionsRef.current     = sessionsCompleted }, [sessionsCompleted])
  useEffect(() => { customWorkRef.current   = customWork       }, [customWork])
  useEffect(() => { customBreakRef.current  = customBreak      }, [customBreak])
  useEffect(() => { presetIdxRef.current    = presetIdx        }, [presetIdx])

  const currentPreset = presetIdx === 3
    ? { label: "Custom", work: customWork, break: customBreak }
    : PRESETS[presetIdx]

  const totalSeconds = mode === "work"
    ? currentPreset.work * 60
    : currentPreset.break * 60

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  // ── Beep sound
  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = "sine"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.8)
    } catch {}
  }, [])

  // ── Tick — reads from refs so the dependency array stays stable
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      const current  = secondsLeftRef.current
      const curMode  = modeRef.current
      const curIdx   = presetIdxRef.current
      const cWork    = customWorkRef.current
      const cBreak   = customBreakRef.current
      const sessions = sessionsRef.current

      const preset = curIdx === 3
        ? { work: cWork, break: cBreak }
        : PRESETS[curIdx]

      if (current <= 1) {
        playBeep()
        clearInterval(intervalRef.current!)
        onIsRunningChange(false)
        if (curMode === "work") {
          onSessionsChange(sessions + 1)
          onModeChange("break")
          onSecondsLeftChange(preset.break * 60)
        } else {
          onModeChange("work")
          onSecondsLeftChange(preset.work * 60)
        }
      } else {
        onSecondsLeftChange(current - 1)
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning]) // ← only re-runs when isRunning changes; reads fresh values via refs

  // ── Reset when preset changes
  const applyPreset = (idx: number) => {
    onIsRunningChange(false)
    onPresetIdxChange(idx)
    onModeChange("work")
    const p = idx === 3
      ? { work: customWork, break: customBreak }
      : PRESETS[idx]
    onSecondsLeftChange(p.work * 60)
  }

  const handleReset = useCallback(() => {
    onIsRunningChange(false)
    onModeChange("work")
    const p = presetIdxRef.current === 3
      ? { work: customWorkRef.current, break: customBreakRef.current }
      : PRESETS[presetIdxRef.current]
    onSecondsLeftChange(p.work * 60)
  }, [onIsRunningChange, onModeChange, onSecondsLeftChange])

  const handleStart = () => {
    if (!selectedTask) { setShowTaskPicker(true); return }
    onIsRunningChange(true)
  }

  const handleMarkDone = () => {
    if (!selectedTask) return
    onMarkDone(selectedTask.id)
    onSelectTask(null)
    onIsRunningChange(false)
    handleReset()
  }

  // ── SVG ring
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const pendingTasks = tasks.filter(t => t.status !== "done")

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Focus Mode</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Pick a task, set your timer, and get into deep work.
        </p>
      </div>

      {/* ── Task Selector */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Focusing on
        </p>
        {selectedTask ? (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{selectedTask.title}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                  TAG_COLORS[selectedTask.tag]
                )}>
                  {selectedTask.tag}
                </span>
                <span className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                  ENERGY_COLORS[selectedTask.energy_required]
                )}>
                  {ENERGY_ICONS[selectedTask.energy_required]}
                  {selectedTask.energy_required} energy
                </span>
                {selectedTask.due_date && (
                  <span className="text-xs text-muted-foreground">
                    Due {new Date(selectedTask.due_date + "T00:00:00")
                      .toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => { onSelectTask(null); onIsRunningChange(false); handleReset() }}
              className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowTaskPicker(true)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
          >
            <span className="text-sm font-medium">Select a task to focus on…</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Task Picker Dropdown */}
      {showTaskPicker && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-sm">Choose a task</p>
            <button onClick={() => setShowTaskPicker(false)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-border">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <CheckCircle2 className="h-8 w-8 opacity-30" />
                <p className="text-sm">All tasks completed!</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => { onSelectTask(task); setShowTaskPicker(false); handleReset() }}
                  className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                    task.tag === "urgent"   ? "bg-destructive" :
                    task.tag === "work"     ? "bg-blue-500" : "bg-accent"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize">{task.tag}</span>
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          · {new Date(task.due_date + "T00:00:00")
                            .toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border flex-shrink-0",
                    ENERGY_COLORS[task.energy_required]
                  )}>
                    {ENERGY_ICONS[task.energy_required]}
                    {task.energy_required}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Preset Tabs */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Timer Preset
          </p>
          {presetIdx === 3 && (
            <button
              onClick={() => setShowCustom(p => !p)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {showCustom ? "Hide" : "Edit custom"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => { applyPreset(i); if (i === 3) setShowCustom(true) }}
              className={cn(
                "flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all",
                presetIdx === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-sm font-bold">
                {i === 3 ? `${customWork}m` : `${p.work}m`}
              </span>
              <span className="text-[10px] font-medium mt-0.5">{p.label}</span>
            </button>
          ))}
        </div>

        {presetIdx === 3 && showCustom && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Work (min)
              </label>
              <input
                type="number" min={1} max={120}
                value={customWork}
                onChange={e => {
                  const v = Math.max(1, Math.min(120, Number(e.target.value)))
                  onCustomWorkChange(v)
                  if (!isRunning && mode === "work") onSecondsLeftChange(v * 60)
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Break (min)
              </label>
              <input
                type="number" min={1} max={60}
                value={customBreak}
                onChange={e => {
                  const v = Math.max(1, Math.min(60, Number(e.target.value)))
                  onCustomBreakChange(v)
                  if (!isRunning && mode === "break") onSecondsLeftChange(v * 60)
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Timer Ring */}
      <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6">

        <div className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border",
          mode === "work"
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-accent/10 text-accent border-accent/30"
        )}>
          {mode === "work" ? <Timer className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
          {mode === "work" ? "Work Session" : "Break Time"}
          {sessionsCompleted > 0 && (
            <span className="ml-1 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
              {sessionsCompleted} done
            </span>
          )}
        </div>

        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
            <circle
              cx="110" cy="110" r={radius}
              fill="none" stroke="currentColor" strokeWidth="10"
              className="text-border"
            />
            <circle
              cx="110" cy="110" r={radius}
              fill="none" stroke="currentColor" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                "transition-all duration-1000",
                mode === "work" ? "text-primary" : "text-accent"
              )}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold font-mono tracking-tight text-foreground">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">
              {selectedTask
                ? <span className="truncate max-w-[120px] block text-center">{selectedTask.title}</span>
                : "no task selected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline" size="icon"
            className="h-11 w-11 rounded-full"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full text-lg shadow-lg transition-all",
              !selectedTask && "opacity-60"
            )}
            onClick={isRunning ? () => onIsRunningChange(false) : handleStart}
          >
            {isRunning
              ? <Pause className="h-6 w-6" />
              : <Play  className="h-6 w-6 ml-0.5" />}
          </Button>

          {selectedTask && (
            <Button
              variant="outline" size="icon"
              className="h-11 w-11 rounded-full border-accent/40 hover:bg-accent/10 hover:text-accent"
              onClick={handleMarkDone}
              title="Mark task as done"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!selectedTask && (
          <p className="text-xs text-muted-foreground">
            Select a task above to start the timer
          </p>
        )}
      </div>

      {sessionsCompleted > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Timer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {sessionsCompleted} session{sessionsCompleted > 1 ? "s" : ""} completed today
            </p>
            <p className="text-xs text-muted-foreground">
              {sessionsCompleted * currentPreset.work} minutes of focused work — great job!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
