import { Router } from "express"
import {
  getAllControllers,
  getControllerById,
  createController,
  updateController,
  deleteController,
  getControllerDesks,
} from "../controllers/controllerController"

const router = Router()

router.get("/", getAllControllers)
router.get("/:id", getControllerById)
router.post("/", createController)
router.put("/:id", updateController)
router.delete("/:id", deleteController)

router.get("/:id/desks", getControllerDesks)

export default router
