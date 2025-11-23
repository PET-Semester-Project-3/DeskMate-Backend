import { Request, Response } from "express"
import { prisma } from "../db/prisma"

export const getAllUserDesks = async (req: Request, res: Response) => {
  try {
    const relations = await prisma.userDesk.findMany({
      include: { user: true, desk: true },
    })
    res.json({ success: true, data: relations })
  } catch (error) {
    console.error("Error fetching user-desk relations:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user-desk relations" })
  }
}

export const getUserDeskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const rel = await prisma.userDesk.findUnique({
      where: { id },
      include: { user: true, desk: true },
    })
    if (!rel)
      return res.status(404).json({ success: false, message: "UserDesk not found" })
    res.json({ success: true, data: rel })
  } catch (error) {
    console.error("Error fetching user-desk relation:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user-desk relation" })
  }
}

export const createUserDesk = async (req: Request, res: Response) => {
  try {
    const { userId, deskId } = req.body
    if (!userId || !deskId)
      return res
        .status(400)
        .json({ success: false, message: "userId and deskId required" })

    const [user, desk] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.desk.findUnique({ where: { id: deskId } }),
    ])
    if (!user || !desk)
      return res.status(404).json({ success: false, message: "User or Desk not found" })

    const exists = await prisma.userDesk.findFirst({
      where: { user_id: userId, desk_id: deskId },
    })
    if (exists)
      return res.status(409).json({ success: false, message: "Relation already exists" })

    const rel = await prisma.userDesk.create({
      data: { user_id: userId, desk_id: deskId },
      include: { user: true, desk: true },
    })
    res.status(201).json({ success: true, data: rel })
  } catch (error) {
    console.error("Error creating user-desk relation:", error)
    res.status(500).json({ success: false, message: "Failed to create relation" })
  }
}

export const updateUserDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { userId, deskId } = req.body

    const existing = await prisma.userDesk.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "UserDesk not found" })

    const data: any = {}
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" })
      data.user_id = userId
    }
    if (deskId) {
      const desk = await prisma.desk.findUnique({ where: { id: deskId } })
      if (!desk)
        return res.status(404).json({ success: false, message: "Desk not found" })
      data.desk_id = deskId
    }

    const updated = await prisma.userDesk.update({
      where: { id },
      data,
      include: { user: true, desk: true },
    })
    res.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating user-desk relation:", error)
    res.status(500).json({ success: false, message: "Failed to update relation" })
  }
}

export const deleteUserDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await prisma.userDesk.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "UserDesk not found" })
    await prisma.userDesk.delete({ where: { id } })
    res.json({ success: true, message: "Relation deleted" })
  } catch (error) {
    console.error("Error deleting user-desk relation:", error)
    res.status(500).json({ success: false, message: "Failed to delete relation" })
  }
}
