import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import eventRoutes from "./routes/event.js"
import categoryRoutes from "./routes/categories.js"
import reminderRoutes from "./routes/reminders.js"
import { startReminderCron } from "./services/reminderService.js"
import { errorHandler } from "./middleware/errorHandler.js"

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/reminders", reminderRoutes)

// Error handling middleware
app.use(errorHandler)

// Start the reminder cron job
startReminderCron()

export default app

