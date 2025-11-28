import { Request, Response } from "express"
import { prisma } from "../db/prisma"

// #region GetAll

/**
 * Get all DeskMate
 * GET /api/deskmates
 */
export const getAllDeskMates = async (req: Request, res: Response) => {
  try {
    const relations = await prisma.deskMate.findMany({
      include: { user: true },
    })

    res.json({ success: true, data: relations })
  } catch (error) {
    console.error("Error fetching deskmate relations:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch deskmate relations" })
  }
}

// #endregion

// #region Get

/**
 * Get a specific DeskMate
 * GET /api/deskmate/:id
 */
export const getDeskMateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const rel = await prisma.deskMate.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!rel)
      return res.status(404).json({ success: false, message: "deskmate not found" })
    res.json({ success: true, data: rel })
  } catch (error) {
    console.error("Error fetching deskmate relation:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch deskmate relation" })
  }
}

// #endregion

// #region Create

/**
 * Create a new DeskMate
 * POST /api/deskmate
 */
export const createDeskMate = async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body
    if (!userId || !name)
      return res
        .status(400)
        .json({ success: false, message: "userId and name required" })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" })

    const exists = await prisma.deskMate.findFirst({
      where: { user_id: userId },
    })
    if (exists)
      return res.status(409).json({ success: false, message: "DeskMate already exists" })

    const rel = await prisma.deskMate.create({
      data: { user_id: userId, name: name },
      include: { user: true },
    })
    res.status(201).json({ success: true, data: rel })
  } catch (error) {
    console.error("Error creating deskmate:", error)
    res.status(500).json({ success: false, message: "Failed to create deskmate" })
  }
}

// #endregion

// #region Update

/**
 * Update a DeskMate
 * PUT /api/deskmate/:id
 */
export const updateDeskMate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { userId, name, streak, achievements } = req.body

    const existing = await prisma.deskMate.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "DeskMate not found" })

    const data: any = {}
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" })
      data.user_id = userId
    }
    if (name) data.name = name;
    if (streak) data.streak = streak;
    if (achievements) data.achievements = achievements;

    const updated = await prisma.deskMate.update({
      where: { id },
      data,
      include: { user: true },
    })
    res.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating deskmate:", error)
    res.status(500).json({ success: false, message: "Failed to update deskmate" })
  }
}

// #endregion

// #region Delete

/**
 * Delete a DeskMate
 * DELETE /api/deskmate/:id
 */
export const deleteDeskMate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await prisma.deskMate.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "DeskMate not found" })
    await prisma.deskMate.delete({ where: { id } })
    res.json({ success: true, message: "DeskMate deleted" })
  } catch (error) {
    console.error("Error deleting deskmate:", error)
    res.status(500).json({ success: false, message: "Failed to delete deskmate" })
  }
}

// #endregion

// #region Streak

/**
 * Update a DeskMate
 * PUT /api/deskmate/:id/streak
 */
export const updateDeskMateStreak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existing = await prisma.deskMate.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "DeskMate not found" })

    const data: any = {}
    data.streak = ++data.streak;

    const updated = await prisma.deskMate.update({
      where: { id },
      data,
      include: { user: true },
    })
    res.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating deskmate streak:", error)
    res.status(500).json({ success: false, message: "Failed to update deskmate streak" })
  }
}

// #endregion