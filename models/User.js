const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    avatar: { type: String, default: "default" },

    streak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },

    freezeCount: { type: Number, default: 0 },
    lastFreezeDate: { type: String, default: null },

    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastShownLevelPopup: {
      type: Number,
      default: 1,
    },

    lastCompletedDate: { type: String, default: "" },

    extraTime: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
