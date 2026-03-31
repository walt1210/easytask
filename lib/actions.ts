"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  due_time: string | null
  tag: "work" | "personal" | "urgent"
  status: "todo" | "in_progress" | "done"
  energy_required: "high" | "medium" | "low"
  completed_at: string | null
  created_at: string
  updated_at: string
}

export async function getTasks() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { tasks: [], error: "Not authenticated" }
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return { tasks: [], error: error.message }
  }

  return { tasks: tasks as Task[], error: null }
}

export async function createTask(formData: {
  title: string
  description?: string
  due_date?: string
  due_time?: string
  tag: "work" | "personal" | "urgent"
  energy_required: "high" | "medium" | "low"
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { task: null, error: "Not authenticated" }
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date || null,
      due_time: formData.due_time || null,
      tag: formData.tag,
      energy_required: formData.energy_required,
      status: "todo",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating task:", error)
    return { task: null, error: error.message }
  }

  revalidatePath("/")
  return { task: task as Task, error: null }
}

export async function updateTaskStatus(taskId: string, status: "todo" | "in_progress" | "done") {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const updateData: { status: string; completed_at?: string | null } = {
    status,
  }

  if (status === "done") {
    updateData.completed_at = new Date().toISOString()
  } else {
    updateData.completed_at = null
  }

  const { error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)

  if (error) {
    console.error("Error updating task:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)

  if (error) {
    console.error("Error deleting task:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}

export async function toggleTaskComplete(taskId: string, currentStatus: string) {
  const newStatus = currentStatus === "done" ? "todo" : "done"
  return updateTaskStatus(taskId, newStatus)
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // We explicitly map the fields to avoid accidental injection of invalid columns
  const allowedUpdates: Partial<Task> = {
    title: updates.title,
    description: updates.description,
    due_date: updates.due_date,
    due_time: updates.due_time,
    tag: updates.tag,
    energy_required: updates.energy_required,
    status: updates.status,
  }

  // Handle auto-setting completed_at if status changed to done
  if (updates.status === "done") {
    allowedUpdates.completed_at = new Date().toISOString()
  } else if (updates.status === "todo" || updates.status === "in_progress") {
    allowedUpdates.completed_at = null
  }

  const { error } = await supabase
    .from("tasks")
    .update(allowedUpdates)
    .eq("id", taskId)
    .eq("user_id", user.id) // Security: Ensure user owns the task

  if (error) {
    console.error("Error updating task:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}