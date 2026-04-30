const User = require("../models/User");

exports.getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      badges: user.badges || [],
      points: user.points || 0,
      streak: user.streak || 0,
      xp: user.xp || 0,
      level: user.level || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
