import { Router } from "express"
import { getAllUserPermissions } from "../controllers/userPermissionController"

const router = Router()

// GET /api/user-permissions
router.get("/", getAllUserPermissions)

export default router
