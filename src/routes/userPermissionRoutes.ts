import { Router } from "express"
import {
  getAllUserPermissions,
  getUserPermissionById,
  createUserPermission,
  updateUserPermission,
  deleteUserPermission,
} from "../controllers/userPermissionController"

const router = Router()

// Collection
router.get("/", getAllUserPermissions)
router.post("/", createUserPermission)

// Single resource
router.get("/:id", getUserPermissionById)
router.put("/:id", updateUserPermission)
router.delete("/:id", deleteUserPermission)

export default router
