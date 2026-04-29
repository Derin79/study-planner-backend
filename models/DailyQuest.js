const mongoose = require("mongoose");

const dailyQuestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    rewardXP: { type: Number, default: 10 },
    rewardPoints: { type: Number, default: 5 },

    type: {
      type: String,
      enum: [
        "study_minutes",
        "hard_session",
        "reflection",
        "no_missed_tasks",
        "tomorrow_only",
      ],
      default: "study_minutes",
    },

    requiredMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.DailyQuest || mongoose.model("DailyQuest", dailyQuestSchema);
