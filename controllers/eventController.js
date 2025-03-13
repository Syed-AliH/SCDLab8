import {
    createEvent,
    findEventById,
    findEventsByUser,
    updateEvent,
    deleteEvent,
    findCategoryById,
  } from "../data/store.js"
  
  // Create a new event
  export const createNewEvent = async (req, res, next) => {
    try {
      const { name, description, date, categoryId, reminders } = req.body
  
      if (!name || !date) {
        return res.status(400).json({ message: "Name and date are required" })
      }
  
      if (categoryId) {
        const category = findCategoryById(categoryId)
        if (!category || category.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid category" })
        }
      }
  
      const event = createEvent({
        name,
        description,
        date: new Date(date),
        categoryId,
        userId: req.user.id,
        reminders:
          reminders?.map((r) => ({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            time: new Date(r),
            sent: false,
          })) || [],
      })
  
      if (event.categoryId) {
        const category = findCategoryById(event.categoryId)
        event.category = category ? { id: category.id, name: category.name, color: category.color } : null
      }
  
      res.status(201).json(event)
    } catch (error) {
      next(error)
    }
  }
  
  export const getEvents = async (req, res, next) => {
    try {
      const { sort, category, startDate, endDate } = req.query
  
      let userEvents = findEventsByUser(req.user.id, {
        category,
        startDate,
        endDate,
      })
  
      userEvents = userEvents.map((event) => {
        const result = { ...event }
        if (event.categoryId) {
          const category = findCategoryById(event.categoryId)
          result.category = category ? { id: category.id, name: category.name, color: category.color } : null
        }
        return result
      })
  
      if (sort === "category") {
        userEvents.sort((a, b) => {
          const catA = a.category?.name || ""
          const catB = b.category?.name || ""
          const catCompare = catA.localeCompare(catB)
  
          if (catCompare !== 0) return catCompare
          return new Date(a.date) - new Date(b.date)
        })
      } else if (sort === "name") {
        userEvents.sort((a, b) => a.name.localeCompare(b.name))
      } else {
        userEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
      }
  
      res.json(userEvents)
    } catch (error) {
      next(error)
    }
  }
  
  export const getEvent = async (req, res, next) => {
    try {
      const event = findEventById(req.params.id)
  
      if (!event || event.userId !== req.user.id) {
        return res.status(404).json({ message: "Event not found" })
      }
  
      const result = { ...event }
      if (event.categoryId) {
        const category = findCategoryById(event.categoryId)
        result.category = category ? { id: category.id, name: category.name, color: category.color } : null
      }
  
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
  
  // Update an event
  export const updateEventById = async (req, res, next) => {
    try {
      const { name, description, date, categoryId, reminders } = req.body
  
      // Find event
      const event = findEventById(req.params.id)
  
      if (!event || event.userId !== req.user.id) {
        return res.status(404).json({ message: "Event not found" })
      }
  
      if (categoryId) {
        const category = findCategoryById(categoryId)
        if (!category || category.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid category" })
        }
      }
  
      const updates = {}
      if (name) updates.name = name
      if (description !== undefined) updates.description = description
      if (date) updates.date = new Date(date)
      if (categoryId !== undefined) updates.categoryId = categoryId
  
      if (reminders) {
        updates.reminders = reminders.map((r) => ({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          time: new Date(r),
          sent: false,
        }))
      }
  
      const updatedEvent = updateEvent(req.params.id, updates)
  
      if (updatedEvent.categoryId) {
        const category = findCategoryById(updatedEvent.categoryId)
        updatedEvent.category = category ? { id: category.id, name: category.name, color: category.color } : null
      }
  
      res.json(updatedEvent)
    } catch (error) {
      next(error)
    }
  }
  
  export const deleteEventById = async (req, res, next) => {
    try {
      // Find event
      const event = findEventById(req.params.id)
  
      if (!event || event.userId !== req.user.id) {
        return res.status(404).json({ message: "Event not found" })
      }
  
      // Delete event
      const deleted = deleteEvent(req.params.id)
  
      if (deleted) {
        res.json({ message: "Event deleted successfully" })
      } else {
        res.status(500).json({ message: "Failed to delete event" })
      }
    } catch (error) {
      next(error)
    }
  }
  
  