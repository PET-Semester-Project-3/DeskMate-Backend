import cron from "node-cron"
import { prisma } from "../db/prisma"
import * as simulatorService from "../services/simulatorService"
import { SimulatorTimeoutError, SimulatorConnectionError } from "../errors/DeskErrors"

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

      console.log(`[Scheduler] [${now.toISOString()}] Polling... found ${dueTasks.length} due task(s)`)


       // Find all pending tasks that are due
      const dueInProgressTasks = await prisma.scheduledTask.findMany({
        where: {
          status: "IN_PROGRESS",
          scheduled_at: { lte: now },
        },
        include: { desk: true, user: true },
      })
      console.log(`[Scheduler] [${now.toISOString()}] Polling... found ${dueInProgressTasks.length} in-progress task(s)`)

      if (dueTasks.length === 0 && dueInProgressTasks.length === 0) return

      for (const task of dueInProgressTasks) {
        try {
         // if desk is locked ignore
         if (task.desk.is_locked) 
         {
          console.log(`[Scheduler] Task ${task.id} failed: Desk is still occupied`)
          continue
         }

         // do task, as the board is not occupied

          console.log(
            `[Scheduler] Executing task ${task.id}: Set desk "${task.desk.name}" to ${task.new_height}cm`
          )

          // Convert cm to mm and call simulator
          const position_mm = task.new_height * 10
          let simulatorOffline = false

          try {
            await simulatorService.setDeskPosition(task.desk.id, position_mm)
          } catch (simError) {
            if (simError instanceof SimulatorTimeoutError || simError instanceof SimulatorConnectionError) {
              console.warn(`[Scheduler] Simulator unavailable, updating database only`)
              simulatorOffline = true
            } else {
              throw simError
            }
          }

          // Update desk height in last_data
          const currentData =
            (task.desk.last_data as Record<string, unknown>) || {}
          const updatedData = {
            ...currentData,
            position_mm: position_mm,
            height: task.new_height,
            last_adjusted_at: new Date().toISOString(),
            adjusted_by: simulatorOffline ? "scheduler (simulator offline)" : "scheduler",
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





        }catch (error) {
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

      // Process each task
      for (const task of dueTasks) {
        try {
          // Check if desk is occupied (locked)
          if (task.desk.is_locked) {
            await prisma.scheduledTask.update({
              where: { id: task.id },
              data: {
                status: "IN_PROGRESS",
                error_message: "Desk is occupied",
                completed_at: new Date(),
              },
            })
            console.log(`[Scheduler] Task ${task.id} failed: Desk is occupied`)
            continue
          }

          // Mark as in progress
          await prisma.scheduledTask.update({
            where: { id: task.id },
            data: { status: "IN_PROGRESS" },
          })

          console.log(
            `[Scheduler] Executing task ${task.id}: Set desk "${task.desk.name}" to ${task.new_height}cm`
          )

          // Convert cm to mm and call simulator
          const position_mm = task.new_height * 10
          let simulatorOffline = false

          try {
            await simulatorService.setDeskPosition(task.desk.id, position_mm)
          } catch (simError) {
            if (simError instanceof SimulatorTimeoutError || simError instanceof SimulatorConnectionError) {
              console.warn(`[Scheduler] Simulator unavailable, updating database only`)
              simulatorOffline = true
            } else {
              throw simError
            }
          }

          // Update desk height in last_data
          const currentData =
            (task.desk.last_data as Record<string, unknown>) || {}
          const updatedData = {
            ...currentData,
            position_mm: position_mm,
            height: task.new_height,
            last_adjusted_at: new Date().toISOString(),
            adjusted_by: simulatorOffline ? "scheduler (simulator offline)" : "scheduler",
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
