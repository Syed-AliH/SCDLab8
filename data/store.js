// In-memory data store using arrays

// Generate a unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }
  
  // Data stores
  export const users = []
  export const events = []
  export const categories = []
  
  // Helper functions for users
  export const findUserById = (id) => {
    return users.find((user) => user.id === id)
  }
  
  export const findUserByEmail = (email) => {
    return users.find((user) => user.email === email)
  }
  
  export const findUserByUsername = (username) => {
    return users.find((user) => user.username === username)
  }
  
  export const createUser = (userData) => {
    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    users.push(newUser)
    return newUser
  }
  
  // Helper functions for events
  export const findEventById = (id) => {
    return events.find((event) => event.id === id)
  }
  
  export const findEventsByUser = (userId, filters = {}) => {
    let filteredEvents = events.filter((event) => event.userId === userId)
  
    // Apply category filter
    if (filters.category) {
      filteredEvents = filteredEvents.filter((event) => event.categoryId === filters.category)
    }
  
    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.date)
        if (filters.startDate && eventDate < new Date(filters.startDate)) {
          return false
        }
        if (filters.endDate && eventDate > new Date(filters.endDate)) {
          return false
        }
        return true
      })
    }
  
    return filteredEvents
  }
  
  export const createEvent = (eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    events.push(newEvent)
    return newEvent
  }
  
  export const updateEvent = (id, updates) => {
    const index = events.findIndex((event) => event.id === id)
    if (index === -1) return null
  
    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: new Date(),
    }
  
    return events[index]
  }
  
  export const deleteEvent = (id) => {
    const index = events.findIndex((event) => event.id === id)
    if (index === -1) return false
  
    events.splice(index, 1)
    return true
  }
  
  // Helper functions for categories
  export const findCategoryById = (id) => {
    return categories.find((category) => category.id === id)
  }
  
  export const findCategoriesByUser = (userId) => {
    return categories.filter((category) => category.userId === userId)
  }
  
  export const createCategory = (categoryData) => {
    const newCategory = {
      id: generateId(),
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    categories.push(newCategory)
    return newCategory
  }
  
  export const updateCategory = (id, updates) => {
    const index = categories.findIndex((category) => category.id === id)
    if (index === -1) return null
  
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date(),
    }
  
    return categories[index]
  }
  
  export const deleteCategory = (id) => {
    const index = categories.findIndex((category) => category.id === id)
    if (index === -1) return false
  
    // Check if any events are using this category
    const eventsWithCategory = events.filter((event) => event.categoryId === id).length
    if (eventsWithCategory > 0) {
      return { deleted: false, eventsCount: eventsWithCategory }
    }
  
    categories.splice(index, 1)
    return { deleted: true }
  }
  
  // Helper functions for reminders
  export const addReminderToEvent = (eventId, reminderTime) => {
    const event = findEventById(eventId)
    if (!event) return null
  
    if (!event.reminders) {
      event.reminders = []
    }
  
    const newReminder = {
      id: generateId(),
      time: new Date(reminderTime),
      sent: false,
    }
  
    event.reminders.push(newReminder)
    event.updatedAt = new Date()
  
    return event
  }
  
  export const deleteReminderFromEvent = (eventId, reminderId) => {
    const event = findEventById(eventId)
    if (!event || !event.reminders) return false
  
    const reminderIndex = event.reminders.findIndex((r) => r.id === reminderId)
    if (reminderIndex === -1) return false
  
    event.reminders.splice(reminderIndex, 1)
    event.updatedAt = new Date()
  
    return true
  }
  
  export const findUpcomingReminders = (userId) => {
    const now = new Date()
    const userEvents = findEventsByUser(userId)
  
    const reminders = []
  
    userEvents.forEach((event) => {
      if (event.reminders && event.reminders.length > 0) {
        event.reminders.forEach((reminder) => {
          const reminderTime = new Date(reminder.time)
          if (reminderTime >= now && !reminder.sent) {
            reminders.push({
              id: reminder.id,
              eventId: event.id,
              eventName: event.name,
              eventDate: event.date,
              category: findCategoryById(event.categoryId),
              reminderTime: reminder.time,
            })
          }
        })
      }
    })
  
    // Sort by reminder time
    reminders.sort((a, b) => a.reminderTime - b.reminderTime)
  
    return reminders
  }
  
  export const findDueReminders = () => {
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000)
  
    const dueReminders = []
  
    events.forEach((event) => {
      if (event.reminders && event.reminders.length > 0) {
        event.reminders.forEach((reminder) => {
          const reminderTime = new Date(reminder.time)
          if (reminderTime >= now && reminderTime <= fiveMinutesFromNow && !reminder.sent) {
            dueReminders.push({
              event,
              reminder,
              user: findUserById(event.userId),
            })
          }
        })
      }
    })
  
    return dueReminders
  }
  
  export const markReminderAsSent = (eventId, reminderId) => {
    const event = findEventById(eventId)
    if (!event || !event.reminders) return false
  
    const reminder = event.reminders.find((r) => r.id === reminderId)
    if (!reminder) return false
  
    reminder.sent = true
    event.updatedAt = new Date()
  
    return true
  }
  
  // Clear all data (for testing)
  export const clearData = () => {
    users.length = 0
    events.length = 0
    categories.length = 0
  }
  
  