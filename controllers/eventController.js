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
  
      // Validate required fields
      if (!name || !date) {
        return res.status(400).json({ message: "Name and date are required" })
      }
  
      // Validate category if provided
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
  
      // If we need to populate category info
      if (event.categoryId) {
        const category = findCategoryById(event.categoryId)
        event.category = category ? { id: category.id, name: category.name, color: category.color } : null
      }
  
      res.status(201).json(event)
    } catch (error) {
      next(error)
    }
  }
  
  // Get all events for a user
  export const getEvents = async (req, res, next) => {
    try {
      const { sort, category, startDate, endDate } = req.query
  
      // Get events with filters
      let userEvents = findEventsByUser(req.user.id, {
        category,
        startDate,
        endDate,
      })
  
      // Add category info to each event
      userEvents = userEvents.map((event) => {
        const result = { ...event }
        if (event.categoryId) {
          const category = findCategoryById(event.categoryId)
          result.category = category ? { id: category.id, name: category.name, color: category.color } : null
        }
        return result
      })
  
      // Sort events
      if (sort === "category") {
        userEvents.sort((a, b) => {
          // First by category name
          const catA = a.category?.name || ""
          const catB = b.category?.name || ""
          const catCompare = catA.localeCompare(catB)
  
          // Then by date
          if (catCompare !== 0) return catCompare
          return new Date(a.date) - new Date(b.date)
        })
      } else if (sort === "name") {
        userEvents.sort((a, b) => a.name.localeCompare(b.name))
      } else {
        // Default sort by date
        userEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
      }
  
      res.json(userEvents)
    } catch (error) {
      next(error)
    }
  }
  
  // Get a single event
  export const getEvent = async (req, res, next) => {
    try {
      const event = findEventById(req.params.id)
  
      if (!event || event.userId !== req.user.id) {
        return res.status(404).json({ message: "Event not found" })
      }
  
      // Add category info
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
  
      // Validate category if provided
      if (categoryId) {
        const category = findCategoryById(categoryId)
        if (!category || category.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid category" })
        }
      }
  
      // Prepare updates
      const updates = {}
      if (name) updates.name = name
      if (description !== undefined) updates.description = description
      if (date) updates.date = new Date(date)
      if (categoryId !== undefined) updates.categoryId = categoryId
  
      // Update reminders if provided
      if (reminders) {
        updates.reminders = reminders.map((r) => ({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          time: new Date(r),
          sent: false,
        }))
      }
  
      // Update event
      const updatedEvent = updateEvent(req.params.id, updates)
  
      // Add category info
      if (updatedEvent.categoryId) {
        const category = findCategoryById(updatedEvent.categoryId)
        updatedEvent.category = category ? { id: category.id, name: category.name, color: category.color } : null
      }
  
      res.json(updatedEvent)
    } catch (error) {
      next(error)
    }
  }
  
  // Delete an event
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
  
  