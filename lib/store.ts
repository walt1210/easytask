export type EnergyLevel = "high" | "medium" | "low"
export type TaskTag = "work" | "personal" | "urgent"
export type TaskStatus = "todo" | "in-progress" | "done"

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  dueTime?: string
  tag: TaskTag
  status: TaskStatus
  energyRequired: EnergyLevel
  completedAt?: Date
  createdAt: Date
}

export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Finalize Q2 budget report for stakeholders",
    description: "Review all department budgets and prepare final presentation",
    dueDate: new Date(),
    dueTime: "17:00",
    tag: "urgent",
    status: "in-progress",
    energyRequired: "high",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Review pull requests for the new auth module",
    description: "Check code quality and security implications",
    dueDate: new Date(),
    dueTime: "15:00",
    tag: "work",
    status: "in-progress",
    energyRequired: "high",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Call Mom — confirm Sunday dinner plans",
    dueDate: new Date(),
    dueTime: "17:00",
    tag: "personal",
    status: "todo",
    energyRequired: "low",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Write up sprint retrospective notes",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    tag: "work",
    status: "in-progress",
    energyRequired: "medium",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: "5",
    title: "Morning workout — 30 min run",
    tag: "personal",
    status: "done",
    energyRequired: "high",
    completedAt: new Date(new Date().setHours(7, 15, 0, 0)),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    title: "Send weekly status email to the team",
    tag: "work",
    status: "done",
    energyRequired: "low",
    completedAt: new Date(new Date().setHours(9, 0, 0, 0)),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "7",
    title: "Prepare presentation slides for Monday meeting",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    tag: "work",
    status: "todo",
    energyRequired: "high",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "8",
    title: "Review insurance renewal options",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    tag: "personal",
    status: "todo",
    energyRequired: "medium",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
  {
    id: "9",
    title: "Update project documentation",
    tag: "work",
    status: "done",
    energyRequired: "medium",
    completedAt: new Date(new Date().setHours(10, 30, 0, 0)),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "10",
    title: "Schedule dentist appointment",
    tag: "personal",
    status: "done",
    energyRequired: "low",
    completedAt: new Date(new Date().setHours(11, 0, 0, 0)),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "11",
    title: "Code review for intern's first PR",
    dueDate: new Date(),
    dueTime: "16:00",
    tag: "work",
    status: "in-progress",
    energyRequired: "medium",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "12",
    title: "Order groceries for the week",
    tag: "personal",
    status: "done",
    energyRequired: "low",
    completedAt: new Date(new Date().setHours(8, 30, 0, 0)),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
]

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase()
}
