import { Request, Response } from "express"
import { prisma } from "../db/prisma"

// #region GetAll

/**
 * Get all DeskMate
 * GET /api/deskmates
 */
export const getAllDeskMates = async (req: Request, res: Response) => {
  try {
    const deskmates = await prisma.deskMate.findMany({
      include: { user: true },
    })

    res.json({ success: true, data: deskmates })
  } catch (error) {
    console.error("Error fetching deskmate relations:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch deskmate" })
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
    const deskmate = await prisma.deskMate.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!deskmate)
      return res.status(404).json({ success: false, message: "deskmate not found" })
    res.json({ success: true, data: deskmate })
  } catch (error) {
    console.error("Error fetching deskmate relation:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch deskmate" })
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
    const { user_id, name } = req.body
    if (!user_id || !name)
      return res
        .status(400)
        .json({ success: false, message: "user_id and name required" })

    const user = await prisma.user.findUnique({ where: { id: user_id } })
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" })

    const exists = await prisma.deskMate.findFirst({
      where: { user_id: user_id },
    })
    if (exists)
      return res.status(409).json({ success: false, message: "DeskMate already exists" })

    const deskmate = await prisma.deskMate.create({
      data: { user_id: user_id, name: name },
      include: { user: true },
    })
    res.status(201).json({ success: true, data: deskmate })
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
    const { user_id, name, streak, achievements } = req.body

    const existing = await prisma.deskMate.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "DeskMate not found" })

    const data: any = {}
    if (user_id) {
      const user = await prisma.user.findUnique({ where: { id: user_id } })
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" })
      data.user_id = user_id
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
    data.streak = ++existing.streak;
    data.last_streak = new Date(Date.now());
    
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

// #region Get By User

/**
 * Get a specific DeskMate from User ID
 * GET /api/deskmate/user/:id
 */
export const getDeskMateByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deskmate = await prisma.deskMate.findUnique({
      where: { user_id: id },
      include: { user: true },
    })
    if (!deskmate)
      return res.status(404).json({ success: false, message: "deskmate not found" })
    res.json({ success: true, data: deskmate })
  } catch (error) {
    console.error("Error fetching deskmate relation:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch deskmate" })
  }
}

// #endregion