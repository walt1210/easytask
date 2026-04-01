"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, Briefcase, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskList } from "@/components/task-list"
import { type Task } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  tasks: Task[]
  activeFilter: string
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onEditTask: (id: string, updates: Partial<Task>) => void
}

const TAG_COLORS: Record<string, string> = {
  urgent:   "bg-destructive",
  work:     "bg-blue-500",
  personal: "bg-accent",
}

const TAG_SOFT: Record<string, string> = {
  urgent:   "bg-destructive/15 text-destructive border-destructive/30",
  work:     "bg-blue-500/15 text-blue-500 border-blue-500/30",
  personal: "bg-accent/15 text-accent border-accent/30",
  all:      "bg-primary/10 text-primary border-primary/30",
}

const TAG_ICONS: Record<string, React.ReactNode> = {
  urgent:   <AlertTriangle className="h-3 w-3" />,
  work:     <Briefcase className="h-3 w-3" />,
  personal: <User className="h-3 w-3" />,
}

export function CalendarView({
  tasks,
  activeFilter,
  onToggleTask,
  onDeleteTask,
  onEditTask,
}: CalendarViewProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().split("T")[0]
  )

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // ── Build month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarCells: { date: Date; isCurrentMonth: boolean }[] = []

  // Pad start
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  // Pad end to complete 6 rows
  const remaining = 42 - calendarCells.length
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
  }

  // ── Task map: date string → tasks
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach(t => {
      if (!t.due_date) return
      if (!map[t.due_date]) map[t.due_date] = []
      map[t.due_date].push(t)
    })
    return map
  }, [tasks])

  // ── Week strip (7 days starting today)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  // ── Tasks for selected date (filtered)
  const selectedTasks = useMemo(() => {
    if (!selectedDate) return []
    const dayTasks = tasksByDate[selectedDate] || []
    if (activeFilter === "all") return dayTasks
    return dayTasks.filter(t => t.tag === activeFilter)
  }, [selectedDate, tasksByDate, activeFilter])

  // ── All tasks for the list below (filtered by activeFilter + sorted)
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks
    return tasks.filter(t => t.tag === activeFilter)
  }, [tasks, activeFilter])

  const formatDateKey = (d: Date) => d.toISOString().split("T")[0]
  const isToday = (d: Date) => d.toDateString() === today.toDateString()
  const isSelected = (d: Date) => formatDateKey(d) === selectedDate

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))
  const goToday  = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(formatDateKey(today))
  }

  return (
    <div className="space-y-6">

      {/* ── Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {activeFilter === "all"
              ? "All tasks by due date"
              : `Showing: ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} tasks`}
          </p>
        </div>
        {activeFilter !== "all" && (
          <span className={cn(
            "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border",
            TAG_SOFT[activeFilter]
          )}>
            {TAG_ICONS[activeFilter]}
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </span>
        )}
      </div>

      {/* ── Week Strip */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          This Week
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(d => {
            const key = formatDateKey(d)
            const dayTasks = (tasksByDate[key] || []).filter(
              t => activeFilter === "all" || t.tag === activeFilter
            )
            const doneTasks = dayTasks.filter(t => t.status === "done")
            const isSel = isSelected(d)
            const isTod = isToday(d)
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                  isSel
                    ? "bg-primary text-primary-foreground"
                    : isTod
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60 text-foreground"
                )}
              >
                <span className="text-[10px] font-medium uppercase opacity-70">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className={cn(
                  "text-base font-bold w-8 h-8 flex items-center justify-center rounded-full",
                  isTod && !isSel && "bg-primary text-primary-foreground"
                )}>
                  {d.getDate()}
                </span>
                {/* Task dots */}
                <div className="flex gap-0.5 min-h-[6px]">
                  {dayTasks.slice(0, 3).map((t, i) => (
                    <span
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        t.status === "done"
                          ? "bg-current opacity-30"
                          : TAG_COLORS[t.tag] || "bg-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                {dayTasks.length > 0 && (
                  <span className={cn(
                    "text-[9px] font-medium",
                    isSel ? "opacity-80" : "text-muted-foreground"
                  )}>
                    {doneTasks.length}/{dayTasks.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Monthly Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-lg">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs h-8">
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div className="grid grid-cols-7">
          {calendarCells.map(({ date, isCurrentMonth }, idx) => {
            const key = formatDateKey(date)
            const dayTasks = (tasksByDate[key] || []).filter(
              t => activeFilter === "all" || t.tag === activeFilter
            )
            const isTod  = isToday(date)
            const isSel  = isSelected(date)
            const isPast = date < today && !isTod

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(key)}
                className={cn(
                  "min-h-[80px] p-2 border-b border-r border-border text-left transition-colors relative",
                  "hover:bg-muted/40",
                  isSel && "bg-primary/8 ring-2 ring-inset ring-primary/60",
                  !isCurrentMonth && "opacity-35",
                  // last row — no bottom border
                  idx >= 35 && "border-b-0",
                  // last column — no right border
                  (idx + 1) % 7 === 0 && "border-r-0"
                )}
              >
                {/* Date number */}
                <span className={cn(
                  "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                  isTod  && "bg-primary text-primary-foreground",
                  !isTod && isSel && "text-primary font-bold",
                  !isTod && !isSel && isPast && isCurrentMonth && "text-muted-foreground"
                )}>
                  {date.getDate()}
                </span>

                {/* Task pills */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 2).map(t => (
                    <div
                      key={t.id}
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight border",
                        t.status === "done"
                          ? "bg-muted/60 text-muted-foreground line-through border-border"
                          : t.tag === "urgent"
                          ? "bg-destructive text-white border-destructive/80"
                          : t.tag === "work"
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-accent text-white border-accent/80"
                      )}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] text-muted-foreground font-semibold px-1">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Selected Day Tasks */}
      {selectedDate && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h3 className="font-bold text-base">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric"
                })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedTasks.length === 0
                  ? "No tasks for this day"
                  : `${selectedTasks.filter(t => t.status === "done").length} of ${selectedTasks.length} completed`}
              </p>
            </div>
          </div>

          {selectedTasks.length > 0 ? (
            <TaskList
              tasks={selectedTasks}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-muted-foreground gap-2 border border-dashed border-border rounded-xl">
              <Calendar className="h-6 w-6 opacity-30" />
              <p className="text-sm">No tasks due on this day</p>
            </div>
          )}
        </div>
      )}

      {/* ── All filtered tasks below */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-bold text-base">
            {activeFilter === "all" ? "All Tasks" : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Tasks`}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {filteredTasks.length}
          </span>
        </div>
        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-28 text-muted-foreground gap-2 border border-dashed border-border rounded-xl">
            <Calendar className="h-6 w-6 opacity-30" />
            <p className="text-sm">No {activeFilter === "all" ? "" : activeFilter} tasks yet</p>
          </div>
        )}
      </div>
    </div>
  )
}