import { Request, Response } from "express"
import { prisma } from "../db/prisma"

// #region GetAll

/**
 * Get scheduled tasks
 * GET /api/scheduled-tasks
 * Optional query params: deskId, userId
 */
export const getAllScheduledTasks = async (req: Request, res: Response) => {
  try {
    const { deskId, userId } = req.query

    const where: any = {}
    if (deskId) where.desk_id = String(deskId)
    if (userId) where.user_id = String(userId)

    const tasks = await prisma.scheduledTask.findMany({
      where,
      include: { user: true, desk: true },
      orderBy: { scheduled_at: "asc" },
    })

    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error)
    res.status(500).json({ success: false, message: "Failed to fetch scheduled tasks" })
  }
}

// #endregion

// #region Get

/**
 * Get scheduled task by ID
 * GET /api/scheduled-tasks/:id
 */
export const getScheduledTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const task = await prisma.scheduledTask.findUnique({
      where: { id },
      include: { user: true, desk: true },
    })

    if (!task)
      return res.status(404).json({ success: false, message: "ScheduledTask not found" })

    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error fetching scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to fetch scheduled task" })
  }
}

// #endregion

// #region Create

/**
 * Create scheduled task
 * POST /api/scheduled-tasks
 * Body: { deskId, userId, description, new_height, scheduled_at }
 */
export const createScheduledTask = async (req: Request, res: Response) => {
  try {
    const { deskId, userId, description, new_height, scheduled_at } = req.body

    if (
      !deskId ||
      !userId ||
      description == null ||
      new_height == null ||
      !scheduled_at
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "deskId, userId, description, new_height and scheduled_at are required",
        })
    }

    const [user, desk] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.desk.findUnique({ where: { id: deskId } }),
    ])

    if (!user || !desk)
      return res.status(404).json({ success: false, message: "User or Desk not found" })

    const task = await prisma.scheduledTask.create({
      data: {
        desk_id: deskId,
        user_id: userId,
        description,
        new_height: Number(new_height),
        scheduled_at: new Date(scheduled_at),
      },
      include: { user: true, desk: true },
    })

    res.status(201).json({ success: true, data: task })
  } catch (error) {
    console.error("Error creating scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to create scheduled task" })
  }
}

// #endregion

// #region Update

/**
 * Update scheduled task
 * PUT /api/scheduled-tasks/:id
 * Body: { description?, new_height?, scheduled_at?, status?, completed_at?, error_message? }
 */
export const updateScheduledTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { description, new_height, scheduled_at, status, completed_at, error_message } =
      req.body

    const existing = await prisma.scheduledTask.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "ScheduledTask not found" })

    const data: any = {}
    if (description !== undefined) data.description = description
    if (new_height !== undefined) data.new_height = Number(new_height)
    if (scheduled_at !== undefined) data.scheduled_at = new Date(scheduled_at)
    if (status !== undefined) data.status = status
    if (completed_at !== undefined) data.completed_at = new Date(completed_at)
    if (error_message !== undefined) data.error_message = error_message

    const task = await prisma.scheduledTask.update({
      where: { id },
      data,
      include: { user: true, desk: true },
    })

    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error updating scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to update scheduled task" })
  }
}

// #endregion

// #region Delete

/**
 * Delete scheduled task
 * DELETE /api/scheduled-tasks/:id
 */
export const deleteScheduledTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existing = await prisma.scheduledTask.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "ScheduledTask not found" })

    await prisma.scheduledTask.delete({ where: { id } })
    res.json({ success: true, message: "ScheduledTask deleted successfully" })
  } catch (error) {
    console.error("Error deleting scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to delete scheduled task" })
  }
}

// #endregion

// #region Start Task

/**
 * Convenience actions for task lifecycle
 * POST /api/scheduled-tasks/:id/start
 * POST /api/scheduled-tasks/:id/complete
 * POST /api/scheduled-tasks/:id/cancel
 * POST /api/scheduled-tasks/:id/fail  (body: { error_message })
 */
export const startScheduledTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const task = await prisma.scheduledTask.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
      include: { user: true, desk: true },
    })
    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error starting scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to start scheduled task" })
  }
}

// #endregion

// #region Complete Task

export const completeScheduledTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const task = await prisma.scheduledTask.update({
      where: { id },
      data: { status: "COMPLETED", completed_at: new Date() },
      include: { user: true, desk: true },
    })
    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error completing scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to complete scheduled task" })
  }
}

// #endregion

// #region Cancel Task

export const cancelScheduledTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const task = await prisma.scheduledTask.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { user: true, desk: true },
    })
    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error cancelling scheduled task:", error)
    res.status(500).json({ success: false, message: "Failed to cancel scheduled task" })
  }
}

// #endregion

// #region Fail Task

export const failScheduledTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error_message } = req.body
    const task = await prisma.scheduledTask.update({
      where: { id },
      data: { status: "FAILED", error_message, completed_at: new Date() },
      include: { user: true, desk: true },
    })
    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error failing scheduled task:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to mark scheduled task as failed" })
  }
}

// #endregion
