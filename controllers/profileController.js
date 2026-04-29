const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    res.status(200).json({
      xp: user.xp,
      points: user.points,
      streak: user.streak,
      level: user.level,
      badges: user.badges,
      freezeCount: user.freezeCount, // ✅ ADD THIS
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
