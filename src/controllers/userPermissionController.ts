import { Request, Response } from "express"
import { prisma } from "../db/prisma"

export const getAllUserPermissions = async (req: Request, res: Response) => {
  try {
    const relations = await prisma.userPermission.findMany({
      include: { user: true, permission: true },
    })

    res.json({ success: true, data: relations })
  } catch (error) {
    console.error("Error fetching user-permission relations:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user-permission relations" })
  }
}
