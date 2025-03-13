import cron from "node-cron"
import { findDueReminders, markReminderAsSent } from "../data/store.js"
import { sendNotification } from "./notificationService.js"

// Check for reminders every minute
export const startReminderCron = () => {
  console.log("Starting reminder cron job")

  cron.schedule("* * * * *", async () => {
    try {
      // Find due reminders
      const dueReminders = findDueReminders()

      for (const { event, reminder, user } of dueReminders) {
        // Send notification
        await sendNotification(user, event.name, reminder.time, event.date)

        // Mark reminder as sent
        markReminderAsSent(event.id, reminder.id)
      }
    } catch (error) {
      console.error("Error processing reminders:", error)
    }
  })
}

