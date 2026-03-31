"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Circle,
  Clock,
  Briefcase,
  Home,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
  Edit2,
  Zap,
  Calendar,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/actions"
import { updateTask } from "@/lib/actions" // Import the action

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  // onUpdateTask is now optional because we can call the action directly or via prop
  onUpdateTask?: (id: string, updates: Partial<Task>) => void 
}

const tagIcons = {
  work: Briefcase,
  personal: Home,
  urgent: AlertTriangle,
}

const energyConfig = {
  low: { color: "text-blue-500 bg-blue-50 border-blue-100", label: "Low Energy" },
  medium: { color: "text-amber-600 bg-amber-50 border-amber-100", label: "Med Energy" },
  high: { color: "text-orange-600 bg-orange-50 border-orange-200", label: "High Energy" },
}

export function TaskList({ tasks, onToggleTask, onDeleteTask, onUpdateTask }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Wrapper to handle updates either via prop or direct action
  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    if (onUpdateTask) {
      onUpdateTask(id, updates)
    } else {
      await updateTask(id, updates)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Today&apos;s Focus</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
            <Badge variant="secondary" className="rounded-full px-3">
              {tasks.filter((t) => t.status === "done").length}/{tasks.length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onEditClick={() => setEditingTask(task)}
            onQuickUpdate={handleUpdate}
          />
        ))}
        {tasks.length === 0 && (
          <div className="p-16 text-center">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Clock className="text-primary/40 h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium">All clear!</h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
              No tasks scheduled. Enjoy your free time or add a new goal.
            </p>
          </div>
        )}
      </div>

      <Sheet open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md border-l shadow-2xl">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl font-bold">Edit Task</SheetTitle>
          </SheetHeader>
          {editingTask && (
            <EditTaskForm 
              task={editingTask} 
              onSave={(updates) => {
                handleUpdate(editingTask.id, updates)
                setEditingTask(null)
              }} 
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete, onEditClick, onQuickUpdate }: any) {
  const isDone = task.status === "done"
  const TagIcon = tagIcons[task.tag as keyof typeof tagIcons] || Briefcase
  const energy = energyConfig[task.energy_required as keyof typeof energyConfig]

  return (
    <div className={cn(
      "group flex items-center gap-4 p-4 hover:bg-muted/30 transition-all duration-200 cursor-pointer",
      isDone && "bg-muted/10 opacity-75"
    )}>
      {/* Status Toggle */}
      <button
        className="shrink-0 transition-transform active:scale-75"
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
      >
        {isDone ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500 fill-emerald-50" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground/40 hover:text-primary transition-colors" />
        )}
      </button>

      {/* Content Area */}
      <div className="flex-1 min-w-0" onClick={onEditClick}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "font-semibold text-[15px] leading-tight transition-all",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </span>
          <Badge variant="outline" className={cn("px-1.5 h-5 text-[10px] uppercase font-bold border-none", energy.color)}>
            <Zap className="w-2.5 h-2.5 mr-0.5 fill-current" />
            {task.energy_required}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <TagIcon className="h-3 w-3" />
            {task.tag}
          </span>
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.description && <span className="truncate max-w-[150px] italic">· {task.description}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-xl border-border">
            <DropdownMenuItem onClick={onEditClick} className="cursor-pointer">
              <Edit2 className="h-4 w-4 mr-2" /> Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickUpdate(task.id, { status: isDone ? "todo" : "done" })} className="cursor-pointer">
              <CheckCircle2 className="h-4 w-4 mr-2" /> {isDone ? "Reopen Task" : "Complete Task"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4 mr-2" /> Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  )
}

function EditTaskForm({ task, onSave }: { task: Task; onSave: (updates: Partial<Task>) => void }) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    tag: task.tag,
    energy_required: task.energy_required,
    due_date: task.due_date || "",
  })

  return (
    <div className="space-y-6 py-6 overflow-y-auto max-h-[calc(100vh-180px)] px-1">
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground/70 uppercase tracking-tighter">What needs to be done?</label>
        <Input 
          className="text-lg font-medium py-6 border-2 focus-visible:ring-primary/20"
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground/70 uppercase tracking-tighter">Details & Notes</label>
        <Textarea 
          placeholder="Add context, links, or instructions..." 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          className="min-h-[120px] resize-none border-2 focus-visible:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/70 uppercase tracking-tighter">Category</label>
          <select 
            className="w-full p-2.5 rounded-md border-2 bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            value={formData.tag} 
            onChange={(e) => setFormData({...formData, tag: e.target.value as any})}
          >
            <option value="work">💼 Work</option>
            <option value="personal">🏠 Personal</option>
            <option value="urgent">🔥 Urgent</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/70 uppercase tracking-tighter">Energy Level</label>
          <select 
            className="w-full p-2.5 rounded-md border-2 bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            value={formData.energy_required} 
            onChange={(e) => setFormData({...formData, energy_required: e.target.value as any})}
          >
            <option value="low">☕ Low Energy</option>
            <option value="medium">⚡ Medium Energy</option>
            <option value="high">🚀 High Energy</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground/70 uppercase tracking-tighter">Deadline</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            type="date" 
            className="pl-10 border-2 focus-visible:ring-primary/20 h-11"
            value={formData.due_date} 
            onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
          />
        </div>
      </div>

      <div className="pt-8 space-y-3">
        <Button 
          className="w-full py-6 text-md font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={() => onSave(formData)}
        >
          Save Changes
        </Button>
        <SheetClose asChild>
          <Button variant="ghost" className="w-full text-muted-foreground font-medium">
            Discard changes
          </Button>
        </SheetClose>
      </div>
    </div>
  )
}