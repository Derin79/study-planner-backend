const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    busyDays: {
      type: [String],
      default: [],
    },

    preferredStudyTime: {
      type: String,
      default: "evening",
    },

    dailyGoalHours: {
      type: Number,
      default: 2,
    },

    maxSessionMinutes: {
      type: Number,
      default: 60,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.UserPreferences ||
  mongoose.model("UserPreferences", preferencesSchema);
