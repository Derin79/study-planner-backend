const User = require("../models/User");

// GET rewards info
exports.getRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      points: user.points || 0,
      streak: user.streak || 0,
      xp: user.xp || 0,
      level: user.level || 1,
      freezeCount: user.freezeCount || 0,
      badges: user.badges || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// BUY Freeze (cost 50 points)
exports.buyFreeze = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const freezeCost = 50;

    if ((user.points || 0) < freezeCost) {
      return res
        .status(400)
        .json({ message: "Not enough points to buy Freeze ❌" });
    }

    user.points -= freezeCost;
    user.freezeCount = (user.freezeCount || 0) + 1;

    await user.save();

    res.json({
      message: "Freeze purchased successfully ❄️",
      freezeCount: user.freezeCount,
      points: user.points,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
