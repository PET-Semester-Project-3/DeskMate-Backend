import { Router } from "express"
import {
  getAllDeskMates,
  getDeskMateById,
  createDeskMate,
  updateDeskMate,
  deleteDeskMate,
  updateDeskMateStreak
} from "../controllers/deskMateController"

const router = Router()

// GET /api/desks
router.get("/", getAllDeskMates)

// GET /api/desks/:id
router.get("/:id", getDeskMateById)

// POST /api/desks
router.post("/", createDeskMate)

// PUT /api/desks/:id
router.put("/:id", updateDeskMate)

// DELETE /api/desks/:id
router.delete("/:id", deleteDeskMate)

// PUT /api/desks/:id/streak
router.put("/:id/streak", updateDeskMateStreak)

export default router
