import { Request, Response } from "express"
import { prisma } from "../db/prisma"
import * as simulatorService from "../services/simulatorService"
import { syncAllDesks } from "../services/deskSyncService"
import { DESK_HEIGHT_LIMITS } from "../config/simulator"
import {
  SimulatorError,
  SimulatorTimeoutError,
  SimulatorConnectionError,
  HeightOutOfRangeError,
} from "../errors/DeskErrors"

// #region GetAll

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

// #endregion

// #region Get

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

// #endregion

// #region Create

/**
 * Create a new desk
 * POST /api/desks
 * Body: { id: string, controllerId: string, name: string, manufacturer: string, is_locked?: boolean, last_data?: any }
 */
export const createDesk = async (req: Request, res: Response) => {
  try {
    const { id, controllerId, name, is_locked, last_data } = req.body
    if (!id || !name)
      return res
        .status(400)
        .json({
          success: false,
          message: "id and name required",
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

// #endregion

// #region Update

/**
 * Update desk
 * PUT /api/desks/:id
 * Body: { controllerId?: string, name?: string, manufacturer?: string, is_locked?: boolean, last_data?: any }
 *
 * If last_data contains position_mm, it will call the simulator to update the desk position.
 */
export const updateDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { controllerId, name, is_locked, last_data, is_online } = req.body

    const existing = await prisma.desk.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Desk not found" })

    // If last_data contains position_mm, call simulator first
    if (last_data && typeof last_data === "object" && "position_mm" in last_data) {
      try {
        await simulatorService.setDeskPosition(id, last_data.position_mm)
      } catch (simError) {
        console.error("Failed to update simulator position:", simError)
        return res.status(500).json({
          success: false,
          message: "Failed to update desk position in simulator"
        })
      }
    }

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
    if (is_locked !== undefined) data.is_locked = is_locked
    if (last_data !== undefined) {
      data.last_data = last_data
      data.last_data_at = new Date()
    }
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

// #endregion

// #region Delete

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

// #endregion

// #region Get Desk Users

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

// #endregion

// #region Add To User

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

// #endregion

// #region Remove From User

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

// #endregion

// #region Get Schedule

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

// #endregion

// #region Lock / Unlock

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

// #endregion

// #region Sync

/**
 * Sync desks from simulator
 * POST /api/desks/sync
 */
export const syncDesks = async (req: Request, res: Response) => {
  try {
    const synced = await syncAllDesks()
    res.json({ success: true, synced })
  } catch (error) {
    console.error("Error syncing desks:", error)
    res.status(500).json({ success: false, message: "Failed to sync desks from simulator" })
  }
}

// #endregion

// #region Set Height

/**
 * Set desk height via simulator
 * PUT /api/desks/:id/height
 * Body: { height: number } (in cm)
 *
 * Response codes:
 * - 200: Success
 * - 400: Invalid height value or out of range
 * - 404: Desk not found
 * - 503: Simulator unavailable (timeout or connection error)
 * - 500: Database or unknown error
 */
export const setDeskHeight = async (req: Request, res: Response) => {
  const { id } = req.params
  const { height } = req.body

  // Input validation
  if (height === undefined || typeof height !== "number") {
    return res.status(400).json({
      success: false,
      code: "INVALID_HEIGHT",
      message: "height (number in cm) is required",
    })
  }

  // Range validation
  if (height < DESK_HEIGHT_LIMITS.MIN_CM || height > DESK_HEIGHT_LIMITS.MAX_CM) {
    return res.status(400).json({
      success: false,
      code: "HEIGHT_OUT_OF_RANGE",
      message: `Height must be between ${DESK_HEIGHT_LIMITS.MIN_CM}cm and ${DESK_HEIGHT_LIMITS.MAX_CM}cm`,
      details: {
        min: DESK_HEIGHT_LIMITS.MIN_CM,
        max: DESK_HEIGHT_LIMITS.MAX_CM,
        attempted: height,
      },
    })
  }

  try {
    const existing = await prisma.desk.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({
        success: false,
        code: "DESK_NOT_FOUND",
        message: "Desk not found",
      })
    }

    // Convert cm to mm and call simulator
    const position_mm = height * 10

    let result: { position_mm: number }
    try {
      result = await simulatorService.setDeskPosition(id, position_mm)
    } catch (simError) {
      // Handle simulator-specific errors
      if (simError instanceof SimulatorTimeoutError || simError instanceof SimulatorConnectionError) {
        console.warn(`Simulator unavailable for desk ${id}, updating database only:`, simError)

        // Update DB with requested height even though simulator is unavailable
        const updatedLastData = {
          ...(existing.last_data as Record<string, unknown> || {}),
          position_mm: position_mm,
          height: height,
        }

        await prisma.desk.update({
          where: { id },
          data: {
            last_data: updatedLastData,
            last_data_at: new Date(),
          },
        })

        return res.json({
          success: true,
          code: "HEIGHT_SET_SIMULATOR_OFFLINE",
          position_mm: position_mm,
          height: height,
          warning: "Desk height updated in database. Physical desk may not have moved (simulator offline).",
        })
      }

      if (simError instanceof HeightOutOfRangeError) {
        return res.status(400).json({
          success: false,
          code: "HEIGHT_OUT_OF_RANGE",
          message: simError.message,
          details: {
            min: simError.minHeight / 10,
            max: simError.maxHeight / 10,
            attempted: simError.attemptedHeight / 10,
          },
        })
      }

      if (simError instanceof SimulatorError) {
        console.error(`Simulator error for desk ${id}:`, simError)
        return res.status(503).json({
          success: false,
          code: simError.code,
          message: "Failed to adjust desk height. Please try again.",
          retryable: true,
        })
      }

      // Unknown simulator error
      throw simError
    }

    // Update DB with new position
    try {
      const updatedLastData = {
        ...(existing.last_data as Record<string, unknown> || {}),
        position_mm: result.position_mm,
        height: result.position_mm / 10,
      }

      const desk = await prisma.desk.update({
        where: { id },
        data: {
          last_data: updatedLastData,
          last_data_at: new Date(),
        },
      })

      res.json({
        success: true,
        code: "HEIGHT_SET",
        position_mm: result.position_mm,
        height: result.position_mm / 10,
        data: desk,
      })
    } catch (dbError) {
      // Simulator succeeded but DB failed - still return success since desk moved
      console.error(`Database update failed for desk ${id} after successful simulator call:`, dbError)
      res.json({
        success: true,
        code: "HEIGHT_SET_DB_SYNC_WARNING",
        position_mm: result.position_mm,
        height: result.position_mm / 10,
        warning: "Desk height was set but database sync may be delayed",
      })
    }
  } catch (error) {
    console.error("Error setting desk height:", error)
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred while setting desk height",
    })
  }
}

// #endregion