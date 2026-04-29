const UserPreferences = require("../models/UserPreferences");

exports.savePreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const { busyDays, preferredStudyTime, dailyGoalHours, maxSessionMinutes } =
      req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      {
        busyDays,
        preferredStudyTime,
        dailyGoalHours,
        maxSessionMinutes,
      },
      { new: true, upsert: true },
    );

    res.status(200).json({
      message: "Preferences saved successfully",
      preferences,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const preferences = await UserPreferences.findOne({ userId });

    res.status(200).json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
