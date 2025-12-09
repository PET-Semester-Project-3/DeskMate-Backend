import { Router } from "express"
import {
  picoHearbeat,
  picoOccupied,
  picoConnect
} from "../controllers/picoController"

const router = Router()

router.post("/pico-heartbeat", picoHearbeat)
router.post("/pico-occupied", picoOccupied)
router.post("/pico-connect", picoConnect)


export default router
