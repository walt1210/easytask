// lib/sorting.ts
import { Task } from "./actions";
import { EnergyLevel } from "./store";

export function rankTasks(tasks: Task[], currentEnergy: EnergyLevel): Task[] {
  const now = new Date();

  const calculateScore = (task: Task) => {
    let score = 0;

    // 1. Deadline Urgency (Max 100 pts)
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const diffInTime = dueDate.getTime() - now.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

      if (diffInDays < 0) score += 100;      // Overdue
      else if (diffInDays === 0) score += 80; // Due Today
      else if (diffInDays === 1) score += 50; // Due Tomorrow
      else if (diffInDays <= 3) score += 20;  // Soon
    }

    // 2. Energy Alignment (30 pts)
    if (task.energy_required === currentEnergy) {
      score += 30;
    } else if (
      (currentEnergy === "low" && task.energy_required === "high") ||
      (currentEnergy === "high" && task.energy_required === "low")
    ) {
      score -= 20; // Penalty for mismatch
    }

    // 3. Priority Tag (40 pts)
    if (task.tag === "urgent") score += 40;
    if (task.tag === "work") score += 10;

    return score;
  };

  return [...tasks].sort((a, b) => {
    // Done tasks always at the bottom
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;

    return calculateScore(b) - calculateScore(a);
  });
}