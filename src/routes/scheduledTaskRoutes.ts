import { Router } from "express"
import {
  getAllScheduledTasks,
  getScheduledTaskById,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  startScheduledTask,
  completeScheduledTask,
  cancelScheduledTask,
  failScheduledTask,
} from "../controllers/scheduledTaskController"

const router = Router()

// Collection
router.get("/", getAllScheduledTasks)
router.post("/", createScheduledTask)

// Single resource
router.get("/:id", getScheduledTaskById)
router.put("/:id", updateScheduledTask)
router.delete("/:id", deleteScheduledTask)

// Lifecycle actions
router.post("/:id/start", startScheduledTask)
router.post("/:id/complete", completeScheduledTask)
router.post("/:id/cancel", cancelScheduledTask)
router.post("/:id/fail", failScheduledTask)

export default router
