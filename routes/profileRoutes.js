const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      points: user.points || 0,
      streak: user.streak || 0,
      xp: user.xp || 0,
      streakFreeze: user.streakFreeze || 0,
      freezeCount: user.freezeCount || 0, // ✅ ADDED
      lastActiveDate: user.lastActiveDate || null,
      level: user.level || 1,
      badges: user.badges || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
