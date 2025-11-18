import { Router } from "express"
import { getAllUserDesks } from "../controllers/userDeskController"

const router = Router()

// GET /api/user-desks
router.get("/", getAllUserDesks)

export default router