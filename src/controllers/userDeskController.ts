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
    res.status(500).json({ success: false, message: "Failed to fetch user-desk relations" })
  }
}