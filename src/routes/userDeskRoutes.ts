import { Router } from "express"
import { getAllUserDesks } from "../controllers/userDeskController"

const router = Router()

import {
  getUserDeskById,
  createUserDesk,
  updateUserDesk,
  deleteUserDesk,
} from "../controllers/userDeskController"

// GET /api/user-desks
router.get("/", getAllUserDesks)

// Single resource
router.get("/:id", getUserDeskById)
router.post("/", createUserDesk)
router.put("/:id", updateUserDesk)
router.delete("/:id", deleteUserDesk)

export default router
