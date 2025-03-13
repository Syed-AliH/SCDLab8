import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reminders: [
      {
        time: {
          type: Date,
          required: true,
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

eventSchema.index({ date: 1, user: 1 })
eventSchema.index({ category: 1, user: 1 })

const Event = mongoose.model("Event", eventSchema)

export default Event

