import { findEventById, addReminderToEvent, deleteReminderFromEvent, findUpcomingReminders } from "../data/store.js"

export const addReminder = async (req, res, next) => {
  try {
    const { time } = req.body

    if (!time) {
      return res.status(400).json({ message: "Reminder time is required" })
    }

    const event = findEventById(req.params.eventId)

    if (!event || event.userId !== req.user.id) {
      return res.status(404).json({ message: "Event not found" })
    }

    const updatedEvent = addReminderToEvent(req.params.eventId, time)

    res.status(201).json(updatedEvent)
  } catch (error) {
    next(error)
  }
}

export const deleteReminder = async (req, res, next) => {
  try {
    const event = findEventById(req.params.eventId)

    if (!event || event.userId !== req.user.id) {
      return res.status(404).json({ message: "Event not found" })
    }

    const deleted = deleteReminderFromEvent(req.params.eventId, req.params.reminderId)

    if (deleted) {
      res.json({ message: "Reminder deleted successfully" })
    } else {
      res.status(404).json({ message: "Reminder not found" })
    }
  } catch (error) {
    next(error)
  }
}

export const getUpcomingReminders = async (req, res, next) => {
  try {
    const reminders = findUpcomingReminders(req.user.id)
    res.json(reminders)
  } catch (error) {
    next(error)
  }
}

