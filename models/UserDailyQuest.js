const mongoose = require("mongoose");

const userDailyQuestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    quests: [
      {
        questId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DailyQuest",
          required: true,
        },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.UserDailyQuest ||
  mongoose.model("UserDailyQuest", userDailyQuestSchema);
