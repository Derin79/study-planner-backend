const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    deadline: { type: Date, required: true },
    subject: { type: String, required: true },

    // ✅ ONLY STORE REAL DATE + HOUR
    assignedSlots: [
      {
        day: { type: String },
        fullDate: { type: String },

        hour: { type: Number },
        minute: { type: Number, default: 0 }, // ✅ ADD THIS
      },
    ],

    isScheduled: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "completed", "missed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
