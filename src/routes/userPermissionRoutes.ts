import { Router } from "express"
import { getAllUserPermissions } from "../controllers/userPermissionController"

const router = Router()

// GET /api/userPermissions
router.get("/", getAllUserPermissions)

export default router
