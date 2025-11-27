import { Request, Response } from "express"
import { prisma } from "../db/prisma"

/**
 * Get all desks
 * GET /api/desks
 */
export const getAllDesks = async (req: Request, res: Response) => {
  try {
    const desks = await prisma.desk.findMany({
      include: { controller: true },
    })
    
    res.json({ success: true, data: desks })
  } catch (error) {
    console.error("Error fetching desks:", error)
    res.status(500).json({ success: false, message: "Failed to fetch desks" })
  }
}

/**
 * Get desk by ID (includes controller, users via userDesks, scheduled tasks)
 * GET /api/desks/:id
 */
export const getDeskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const desk = await prisma.desk.findUnique({
      where: { id },
      include: {
        controller: true,
        userDesks: { include: { user: true } },
        scheduledTasks: { include: { user: true } },
      },
    })
    if (!desk) return res.status(404).json({ success: false, message: "Desk not found" })

    res.json({ success: true, data: desk })
  } catch (error) {
    console.error("Error fetching desk:", error)
    res.status(500).json({ success: false, message: "Failed to fetch desk" })
  }
}

/**
 * Create a new desk
 * POST /api/desks
 * Body: { id: string, controllerId: string, name: string, manufacturer: string, is_locked?: boolean, last_data?: any }
 */
export const createDesk = async (req: Request, res: Response) => {
  try {
    const { id, controllerId, name, manufacturer, is_locked, last_data } = req.body
    if (!id || !name || !manufacturer)
      return res
        .status(400)
        .json({
          success: false,
          message: "id, name and manufacturer required",
        })
    
    if (controllerId){
      const controller = await prisma.controller.findUnique({ where: { id: controllerId } })
      if (!controller)
        return res.status(404).json({ success: false, message: "Controller not found" })
    }

    const desk = await prisma.desk.create({
      data: {
        id,
        controller_id: controllerId,
        name,
        is_locked: !!is_locked,
        last_data: last_data ?? {},
      },
    })

    res.status(201).json({ success: true, data: desk })
  } catch (error) {
    console.error("Error creating desk:", error)
    res.status(500).json({ success: false, message: "Failed to create desk" })
  }
}

/**
 * Update desk
 * PUT /api/desks/:id
 * Body: { controllerId?: string, name?: string, manufacturer?: string, is_locked?: boolean, last_data?: any }
 */
export const updateDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { controllerId, name, manufacturer, is_locked, last_data, height, is_online } = req.body

    const existing = await prisma.desk.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Desk not found" })

    const data: any = {}
    if (controllerId) {
      const controller = await prisma.controller.findUnique({
        where: { id: controllerId },
      })
      if (!controller)
        return res.status(404).json({ success: false, message: "Controller not found" })
      data.controller_id = controllerId
    }
    if (name !== undefined) data.name = name
    if (manufacturer !== undefined) data.manufacturer = manufacturer``
    if (is_locked !== undefined) data.is_locked = is_locked
    if (last_data !== undefined) data.last_data = last_data
    if (height !== undefined) data.height = height
    if (is_online !== undefined) data.is_online = is_online

    const desk = await prisma.desk.update({
      where: { id },
      data,
    })

    res.json({ success: true, data: desk })
  } catch (error) {
    console.error("Error updating desk:", error)
    res.status(500).json({ success: false, message: "Failed to update desk" })
  }
}

/**
 * Delete desk
 * DELETE /api/desks/:id
 */
export const deleteDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await prisma.desk.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Desk not found" })

    await prisma.desk.delete({ where: { id } })
    res.json({ success: true, message: "Desk deleted successfully" })
  } catch (error) {
    console.error("Error deleting desk:", error)
    res.status(500).json({ success: false, message: "Failed to delete desk" })
  }
}

/**
 * Get desk users
 * GET /api/desks/:id/users
 */
export const getDeskUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const users = await prisma.userDesk.findMany({
      where: { desk_id: id },
      include: { user: true },
    })
    res.json({ success: true, data: users })
  } catch (error) {
    console.error("Error fetching desk users:", error)
    res.status(500).json({ success: false, message: "Failed to fetch desk users" })
  }
}

/**
 * Add user to desk
 * POST /api/desks/:id/users
 * Body: { userId: string }
 */
export const addUserToDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const desk = await prisma.desk.findUnique({ where: { id } })
    if (!user || !desk)
      return res.status(404).json({ success: false, message: "User or Desk not found" })

    const exists = await prisma.userDesk.findFirst({
      where: { user_id: userId, desk_id: id },
    })
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "User already assigned to desk" })

    const ud = await prisma.userDesk.create({ data: { user_id: userId, desk_id: id } })
    res.status(201).json({ success: true, data: ud })
  } catch (error) {
    console.error("Error adding user to desk:", error)
    res.status(500).json({ success: false, message: "Failed to add user to desk" })
  }
}

/**
 * Remove user from desk
 * DELETE /api/desks/:id/users/:userId
 */
export const removeUserFromDesk = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params
    const deleted = await prisma.userDesk.deleteMany({
      where: { desk_id: id, user_id: userId },
    })
    if (deleted.count === 0)
      return res.status(404).json({ success: false, message: "Relation not found" })
    res.json({ success: true, message: "User removed from desk" })
  } catch (error) {
    console.error("Error removing user from desk:", error)
    res.status(500).json({ success: false, message: "Failed to remove user from desk" })
  }
}

/**
 * Get desk scheduled tasks
 * GET /api/desks/:id/scheduled-tasks
 */
export const getDeskScheduledTasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const tasks = await prisma.scheduledTask.findMany({
      where: { desk_id: id },
      include: { user: true },
    })
    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error)
    res.status(500).json({ success: false, message: "Failed to fetch scheduled tasks" })
  }
}

/**
 * Lock/Unlock desk
 * POST /api/desks/:id/lock  -> locks
 * POST /api/desks/:id/unlock -> unlocks
 */
export const lockDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const desk = await prisma.desk.update({ where: { id }, data: { is_locked: true } })
    res.json({ success: true, data: desk })
  } catch (error) {
    console.error("Error locking desk:", error)
    res.status(500).json({ success: false, message: "Failed to lock desk" })
  }
}

export const unlockDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const desk = await prisma.desk.update({ where: { id }, data: { is_locked: false } })
    res.json({ success: true, data: desk })
  } catch (error) {
    console.error("Error unlocking desk:", error)
    res.status(500).json({ success: false, message: "Failed to unlock desk" })
  }
}
