import { Request, Response } from "express"
import { prisma } from "../db/prisma"
import bcrypt from "bcryptjs"

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    })
    res.json({ success: true, data: users })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ success: false, message: "Failed to fetch users" })
  }
}

/**
 * Get user by ID (all user scalars + all related records)
 * GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        // join table records (all fields) + nested related models (all fields)
        userDesks: {
          include: {
            desk: {
              include: {
                controller: true,
                // avoid recursive includes back to userDesks/scheduledTasks
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
        },
        scheduledTasks: {
          include: {
            desk: {
              include: {
                controller: true,
              },
            },
            // avoid including `user` here to prevent recursion
          },
        },
      },
    })

    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    // strip sensitive field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user as any
    res.json({ success: true, data: safeUser })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ success: false, message: "Failed to fetch user" })
  }
}

/**
 * Create a new user
 * POST /api/users
 * Body: { email: string, password: string }
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser)
      return res.status(409).json({ success: false, message: "User exists" })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password_hash: hashedPassword },
      select: { id: true, email: true, created_at: true, updated_at: true },
    })

    res.status(201).json({ success: true, data: user })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ success: false, message: "Failed to create user" })
  }
}

/**
 * Create a new user and optionally assign permissions in a single transaction
 * POST /api/users/with-permissions
 * Body: { email: string, permissionIds?: string[] }
 */
export const createUserWithPermissions = async (req: Request, res: Response) => {
  try {
    const { email, permissionIds } = req.body
    if (!email) return res.status(400).json({ success: false, message: "Email required" })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser)
      return res.status(409).json({ success: false, message: "User exists" })

    // If permissionIds provided, validate they all exist first (so we can return 404 when some are missing)
    if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
      const perms = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
        select: { id: true },
      })
      const foundIds = perms.map((p) => p.id)
      if (foundIds.length !== permissionIds.length)
        return res
          .status(404)
          .json({ success: false, message: "One or more permissions not found" })
    }

    // create user with empty password (users can set/change it later)
    // password_hash is non-nullable in schema, so store empty string
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password_hash: "" },
        select: { id: true, email: true, created_at: true, updated_at: true },
      })

      if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
        const toCreate = permissionIds.map((pid) => ({
          user_id: user.id,
          permission_id: pid,
        }))
        if (toCreate.length > 0) {
          await tx.userPermission.createMany({ data: toCreate })
        }
      }

      return user
    })

    res.status(201).json({ success: true, data: created })
  } catch (error) {
    console.error("Error creating user with permissions:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to create user with permissions" })
  }
}

/**
 * Update user
 * PUT /api/users/:id
 * Body: { email?: string, password?: string }
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { email, password } = req.body

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser)
      return res.status(404).json({ success: false, message: "User not found" })

    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists)
        return res.status(409).json({ success: false, message: "Email already in use" })
    }

    const updateData: any = {}
    if (email) updateData.email = email
    if (password) updateData.password_hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, created_at: true, updated_at: true },
    })

    res.json({ success: true, data: user })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ success: false, message: "Failed to update user" })
  }
}

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser)
      return res.status(404).json({ success: false, message: "User not found" })

    await prisma.user.delete({ where: { id } })
    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ success: false, message: "Failed to delete user" })
  }
}

/**
 * Get user's desks
 * GET /api/users/:id/desks
 */
export const getUserDesks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const desks = await prisma.userDesk.findMany({
      where: { user_id: id },
      include: {
        desk: {
          include: { controller: true },
        },
      },
    })
    res.json({ success: true, data: desks })
  } catch (error) {
    console.error("Error fetching user desks:", error)
    res.status(500).json({ success: false, message: "Failed to fetch user desks" })
  }
}

/**
 * Add user to desk
 * POST /api/users/:id/desks
 * Body: { deskId: string }
 */
export const addUserToDesk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { deskId } = req.body
    if (!deskId)
      return res.status(400).json({ success: false, message: "deskId required" })

    const user = await prisma.user.findUnique({ where: { id } })
    const desk = await prisma.desk.findUnique({ where: { id: deskId } })
    if (!user || !desk)
      return res.status(404).json({ success: false, message: "User or Desk not found" })

    const existing = await prisma.userDesk.findFirst({
      where: { user_id: id, desk_id: deskId },
    })
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "User already assigned to desk" })

    const ud = await prisma.userDesk.create({ data: { user_id: id, desk_id: deskId } })
    res.status(201).json({ success: true, data: ud })
  } catch (error) {
    console.error("Error adding user to desk:", error)
    res.status(500).json({ success: false, message: "Failed to add user to desk" })
  }
}

/**
 * Remove user from desk
 * DELETE /api/users/:id/desks/:deskId
 */
export const removeUserFromDesk = async (req: Request, res: Response) => {
  try {
    const { id, deskId } = req.params
    const deleted = await prisma.userDesk.deleteMany({
      where: { user_id: id, desk_id: deskId },
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
 * Get user permissions
 * GET /api/users/:id/permissions
 */
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const perms = await prisma.userPermission.findMany({
      where: { user_id: id },
      include: { permission: true },
    })
    res.json({ success: true, data: perms })
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    res.status(500).json({ success: false, message: "Failed to fetch user permissions" })
  }
}

/**
 * Add permission to user
 * POST /api/users/:id/permissions
 * Body: { permissionId: string }
 */
export const addPermissionToUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { permissionId } = req.body
    if (!permissionId)
      return res.status(400).json({ success: false, message: "permissionId required" })

    const user = await prisma.user.findUnique({ where: { id } })
    const permission = await prisma.permission.findUnique({ where: { id: permissionId } })
    if (!user || !permission)
      return res
        .status(404)
        .json({ success: false, message: "User or Permission not found" })

    const exists = await prisma.userPermission.findFirst({
      where: { user_id: id, permission_id: permissionId },
    })
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Permission already assigned" })

    const up = await prisma.userPermission.create({
      data: { user_id: id, permission_id: permissionId },
    })
    res.status(201).json({ success: true, data: up })
  } catch (error) {
    console.error("Error adding permission to user:", error)
    res.status(500).json({ success: false, message: "Failed to add permission to user" })
  }
}

/**
 * Remove permission from user
 * DELETE /api/users/:id/permissions/:permissionId
 */
export const removePermissionFromUser = async (req: Request, res: Response) => {
  try {
    const { id, permissionId } = req.params
    const deleted = await prisma.userPermission.deleteMany({
      where: { user_id: id, permission_id: permissionId },
    })
    if (deleted.count === 0)
      return res.status(404).json({ success: false, message: "Relation not found" })
    res.json({ success: true, message: "Permission removed from user" })
  } catch (error) {
    console.error("Error removing permission from user:", error)
    res
      .status(500)
      .json({ success: false, message: "Failed to remove permission from user" })
  }
}

/**
 * Get user's scheduled tasks
 * GET /api/users/:id/scheduled-tasks
 */
export const getUserScheduledTasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const tasks = await prisma.scheduledTask.findMany({
      where: { user_id: id },
      include: {
        desk: { include: { controller: true } },
        // avoid including user to prevent recursion
      },
    })
    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error)
    res.status(500).json({ success: false, message: "Failed to fetch scheduled tasks" })
  }
}

/**
 * Change password
 * POST /api/users/:id/password
 * Body: { currentPassword: string, newPassword: string }
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "current and new passwords required" })

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    const match = await bcrypt.compare(currentPassword, user.password_hash)
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Current password incorrect" })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id }, data: { password_hash: hashed } })

    res.json({ success: true, message: "Password changed" })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ success: false, message: "Failed to change password" })
  }
}

/**
 * Login user
 * POST /api/users/login
 * Body: { email: string, password: string }
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" })

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" })

    // strip sensitive field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user as any

    res.json({ success: true, data: safeUser })
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ success: false, message: "Failed to login" })
  }
}
