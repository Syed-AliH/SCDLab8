import express from "express"
import {
  createNewEvent,
  getEvents,
  getEvent,
  updateEventById,
  deleteEventById,
} from "../controllers/eventController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

router.post("/", createNewEvent)
router.get("/", getEvents)
router.get("/:id", getEvent)
router.put("/:id", updateEventById)
router.delete("/:id", deleteEventById)

export default router

