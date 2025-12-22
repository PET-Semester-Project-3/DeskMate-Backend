import { Router } from "express"
import {
  getAllDesks,
  getDeskById,
  createDesk,
  updateDesk,
  deleteDesk,
  getDeskUsers,
  addUserToDesk,
  removeUserFromDesk,
  getDeskScheduledTasks,
  lockDesk,
  unlockDesk,
  syncDesks,
  setDeskHeight,
} from "../controllers/deskController"

const router = Router()

// GET /api/desks
router.get("/", getAllDesks)

// GET /api/desks/:id
router.get("/:id", getDeskById)

// POST /api/desks
router.post("/", createDesk)

// PUT /api/desks/:id
router.put("/:id", updateDesk)

// DELETE /api/desks/:id
router.delete("/:id", deleteDesk)

// Desk users
router.get("/:id/users", getDeskUsers)
router.post("/:id/users", addUserToDesk)
router.delete("/:id/users/:userId", removeUserFromDesk)

// Scheduled tasks
router.get("/:id/scheduled-tasks", getDeskScheduledTasks)

// Lock / Unlock
router.post("/:id/lock", lockDesk)
router.post("/:id/unlock", unlockDesk)

// Height control (calls simulator)
router.put("/:id/height", setDeskHeight)

// Sync from simulator
router.post("/sync", syncDesks)

export default router
