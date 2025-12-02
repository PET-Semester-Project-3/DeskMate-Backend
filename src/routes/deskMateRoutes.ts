import { Router } from "express"
import {
  getAllDeskMates,
  getDeskMateById,
  createDeskMate,
  updateDeskMate,
  deleteDeskMate,
  updateDeskMateStreak,
  getDeskMateByUserId
} from "../controllers/deskMateController"

const router = Router()

// GET /api/deskmates
router.get("/", getAllDeskMates)

// GET /api/deskmates/:id
router.get("/:id", getDeskMateById)

// POST /api/deskmates
router.post("/", createDeskMate)

// PUT /api/deskmates/:id
router.put("/:id", updateDeskMate)

// DELETE /api/deskmates/:id
router.delete("/:id", deleteDeskMate)

// PUT /api/deskmates/:id/streak
router.put("/:id/streak", updateDeskMateStreak)

// Get /api/deskmates/:id
router.put("/:id", getDeskMateByUserId)

export default router
