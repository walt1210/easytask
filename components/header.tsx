"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGreeting, formatDate } from "@/lib/store"

interface HeaderProps {
  userName: string
  onAddTask: () => void
}

export function Header({ userName, onAddTask }: HeaderProps) {
  const [greeting, setGreeting] = useState("Hello")
  const [date, setDate] = useState("")

  useEffect(() => {
    setGreeting(getGreeting())
    setDate(formatDate())
  }, [])

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          {date || "\u00A0"}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Button onClick={onAddTask} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
        {greeting}, <span className="text-primary">{userName}</span>.
      </h1>
      <p className="text-muted-foreground mt-1">
        Here&apos;s what you need to focus on today.
      </p>
    </header>
  )
}
