// I am just logging the detais of event that will act as sendNotficiation
export const sendNotification = async (user, eventName, reminderTime, eventTime) => {
    console.log(`
      ===== REMINDER NOTIFICATION =====
      To: ${user.username} (${user.email})
      Event: ${eventName}
      Event Time: ${new Date(eventTime).toLocaleString()}
      Reminder Sent: ${new Date(reminderTime).toLocaleString()}
      ================================
    `)
    return true
  }
  
  