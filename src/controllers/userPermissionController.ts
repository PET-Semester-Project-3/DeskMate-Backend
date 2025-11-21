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

export const getUserPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const rel = await prisma.userPermission.findUnique({
      where: { id },
      include: { user: true, permission: true },
    })
    if (!rel)
      return res.status(404).json({ success: false, message: "UserPermission not found" })
    res.json({ success: true, data: rel })
  } catch (error) {
    console.error("Error fetching user-permission relation:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user-permission relation" })
  }
}

export const createUserPermission = async (req: Request, res: Response) => {
  try {
    const { userId, permissionId } = req.body
    if (!userId || !permissionId)
      return res
        .status(400)
        .json({ success: false, message: "userId and permissionId required" })

    const [user, permission] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.permission.findUnique({ where: { id: permissionId } }),
    ])
    if (!user || !permission)
      return res
        .status(404)
        .json({ success: false, message: "User or Permission not found" })

    const exists = await prisma.userPermission.findFirst({
      where: { user_id: userId, permission_id: permissionId },
    })
    if (exists)
      return res.status(409).json({ success: false, message: "Relation already exists" })

    const rel = await prisma.userPermission.create({
      data: { user_id: userId, permission_id: permissionId },
      include: { user: true, permission: true },
    })
    res.status(201).json({ success: true, data: rel })
  } catch (error) {
    console.error("Error creating user-permission relation:", error)
    res.status(500).json({ success: false, message: "Failed to create relation" })
  }
}

export const updateUserPermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { userId, permissionId } = req.body

    const existing = await prisma.userPermission.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "UserPermission not found" })

    const data: any = {}
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" })
      data.user_id = userId
    }
    if (permissionId) {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
      })
      if (!permission)
        return res.status(404).json({ success: false, message: "Permission not found" })
      data.permission_id = permissionId
    }

    const updated = await prisma.userPermission.update({
      where: { id },
      data,
      include: { user: true, permission: true },
    })
    res.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating user-permission relation:", error)
    res.status(500).json({ success: false, message: "Failed to update relation" })
  }
}

export const deleteUserPermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await prisma.userPermission.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "UserPermission not found" })
    await prisma.userPermission.delete({ where: { id } })
    res.json({ success: true, message: "Relation deleted" })
  } catch (error) {
    console.error("Error deleting user-permission relation:", error)
    res.status(500).json({ success: false, message: "Failed to delete relation" })
  }
}
