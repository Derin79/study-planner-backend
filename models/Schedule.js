const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    day: {
      type: String,
      required: true,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },

    hour: { type: Number, required: true }, // 0 - 23

    status: {
      type: String,
      enum: ["free", "busy"],
      default: "free",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Schedule", scheduleSchema);
