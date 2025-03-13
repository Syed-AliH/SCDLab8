import cron from "node-cron"
import { findDueReminders, markReminderAsSent } from "../data/store.js"
import { sendNotification } from "./notificationService.js"

export const startReminderCron = () => {
  console.log("Starting reminder cron job")
  cron.schedule("* * * * *", async () => {
    try {
      const dueReminders = findDueReminders()

      for (const { event, reminder, user } of dueReminders) {
        await sendNotification(user, event.name, reminder.time, event.date)
        markReminderAsSent(event.id, reminder.id)
      }
    } catch (error) {
      console.error("Error processing reminders:", error)
    }
  })
}

