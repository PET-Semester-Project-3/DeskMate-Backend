import cron from "node-cron"
import { prisma } from "../db/prisma"

export function initSchedulerJob() {
  console.log("Initializing scheduler job...")

  // Poll every minute for due tasks
  cron.schedule("* * * * *", async () => {
    const now = new Date()

    try {
      // Find all pending tasks that are due
      const dueTasks = await prisma.scheduledTask.findMany({
        where: {
          status: "PENDING",
          scheduled_at: { lte: now },
        },
        include: { desk: true, user: true },
      })

      if (dueTasks.length === 0) return

      console.log(`[Scheduler] Found ${dueTasks.length} due task(s)`)

      // Process each task
      for (const task of dueTasks) {
        try {
          // Mark as in progress
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: { status: "IN_PROGRESS" },
          })

          console.log(
            `[Scheduler] Executing task ${task.id}: Set desk "${task.desk.name}" to ${task.new_height}cm`
          )

          // Update desk height in last_data
          const currentData =
            (task.desk.last_data as Record<string, unknown>) || {}
          const updatedData = {
            ...currentData,
            height: task.new_height,
            last_adjusted_at: new Date().toISOString(),
            adjusted_by: "scheduler",
          }

          await prisma.desk.update({
            where: { id: task.desk_id },
            data: {
              last_data: updatedData,
              last_data_at: new Date(),
            },
          })

          // Mark as completed
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: {
              status: "COMPLETED",
              completed_at: new Date(),
            },
          })

          console.log(`[Scheduler] Task ${task.id} completed successfully`)
        } catch (error) {
          // Mark as failed
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error"

          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: {
              status: "FAILED",
              error_message: errorMessage,
              completed_at: new Date(),
            },
          })

          console.error(`[Scheduler] Task ${task.id} failed:`, errorMessage)
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error polling tasks:", error)
    }
  })

  console.log("Scheduler job initialized - polling every minute")
}
