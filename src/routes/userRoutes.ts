import { Router } from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserDesks,
  addUserToDesk,
  removeUserFromDesk,
  getUserPermissions,
  addPermissionToUser,
  removePermissionFromUser,
  getUserScheduledTasks,
  changePassword,
} from "../controllers/userController"

const router = Router()

// GET /api/users - Get all users
router.get("/", getAllUsers)

// GET /api/users/:id - Get user by ID

// POST /api/users - Create new user
router.post("/", createUser)

// PUT /api/users/:id - Update user
router.put("/:id", updateUser)

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser)

// User desks
router.get("/:id/desks", getUserDesks)
router.post("/:id/desks", addUserToDesk)
router.delete("/:id/desks/:deskId", removeUserFromDesk)

// User permissions
router.get("/:id/permissions", getUserPermissions)
router.post("/:id/permissions", addPermissionToUser)
router.delete("/:id/permissions/:permissionId", removePermissionFromUser)

// Scheduled tasks
router.get("/:id/scheduled-tasks", getUserScheduledTasks)

// Password
router.post("/:id/password", changePassword)

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById)

export default router
