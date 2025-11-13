import { Router } from "express"
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToUser,
  removePermissionFromUser,
} from "../controllers/permissionController"

const router = Router()

router.get("/", getAllPermissions)
router.get("/:id", getPermissionById)
router.post("/", createPermission)
router.put("/:id", updatePermission)
router.delete("/:id", deletePermission)

router.post("/:id/assign", assignPermissionToUser)
router.post("/:id/unassign", removePermissionFromUser)

export default router
