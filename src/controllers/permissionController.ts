import { Request, Response } from "express"
import { prisma } from "../db/prisma"

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const perms = await prisma.permission.findMany()
    res.json({ success: true, data: perms })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    res.status(500).json({ success: false, message: "Failed to fetch permissions" })
  }
}

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const perm = await prisma.permission.findUnique({ where: { id } })
    if (!perm)
      return res.status(404).json({ success: false, message: "Permission not found" })
    res.json({ success: true, data: perm })
  } catch (error) {
    console.error("Error fetching permission:", error)
    res.status(500).json({ success: false, message: "Failed to fetch permission" })
  }
}

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { label, route } = req.body
    if (!label) return res.status(400).json({ success: false, message: "label required" })
    if (!route) return res.status(400).json({ success: false, message: "route required" })
    const perm = await prisma.permission.create({ data: { label, route } })
    res.status(201).json({ success: true, data: perm })
  } catch (error) {
    console.error("Error creating permission:", error)
    res.status(500).json({ success: false, message: "Failed to create permission" })
  }
}

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { label, route } = req.body
    const existing = await prisma.permission.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Permission not found" })
    const perm = await prisma.permission.update({ where: { id }, data: { label, route } })
    res.json({ success: true, data: perm })
  } catch (error) {
    console.error("Error updating permission:", error)
    res.status(500).json({ success: false, message: "Failed to update permission" })
  }
}

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await prisma.permission.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Permission not found" })
    await prisma.permission.delete({ where: { id } })
    res.json({ success: true, message: "Permission deleted" })
  } catch (error) {
    console.error("Error deleting permission:", error)
    res.status(500).json({ success: false, message: "Failed to delete permission" })
  }
}

/* Assignment helpers */
export const assignPermissionToUser = async (req: Request, res: Response) => {
  try {
    const { id: permissionId } = req.params
    const { userId } = req.body
    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" })

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
      return res.status(409).json({ success: false, message: "Already assigned" })

    const up = await prisma.userPermission.create({
      data: { user_id: userId, permission_id: permissionId },
    })
    res.status(201).json({ success: true, data: up })
  } catch (error) {
    console.error("Error assigning permission:", error)
    res.status(500).json({ success: false, message: "Failed to assign permission" })
  }
}

export const removePermissionFromUser = async (req: Request, res: Response) => {
  try {
    const { id: permissionId } = req.params
    const { userId } = req.body
    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" })

    const deleted = await prisma.userPermission.deleteMany({
      where: { user_id: userId, permission_id: permissionId },
    })
    if (deleted.count === 0)
      return res.status(404).json({ success: false, message: "Relation not found" })

    res.json({ success: true, message: "Permission removed from user" })
  } catch (error) {
    console.error("Error removing permission:", error)
    res.status(500).json({ success: false, message: "Failed to remove permission" })
  }
}
