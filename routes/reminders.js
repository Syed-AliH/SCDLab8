import express from "express"
import { addReminder, deleteReminder, getUpcomingReminders } from "../controllers/reminderController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

router.use(authenticate)

router.get("/upcoming", getUpcomingReminders)
router.post("/events/:eventId", addReminder)
router.delete("/events/:eventId/:reminderId", deleteReminder)

export default router

