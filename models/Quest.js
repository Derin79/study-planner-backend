const mongoose = require("mongoose");

const dailyQuestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },

    quests: [
      {
        title: String,
        rewardXP: Number,
        rewardPoints: Number,
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.DailyQuest || mongoose.model("DailyQuest", dailyQuestSchema);
