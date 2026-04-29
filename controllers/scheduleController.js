const Schedule = require("../models/Schedule");

// Save schedule (bulk)
exports.saveSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { schedule } = req.body;

    // delete old schedule
    await Schedule.deleteMany({ userId });

    // insert new schedule
    const newSchedule = schedule.map((item) => ({
      userId,
      day: item.day,
      hour: item.hour,
      status: item.status,
    }));

    await Schedule.insertMany(newSchedule);

    res.status(201).json({ message: "Schedule saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get schedule
exports.getSchedule = async (req, res) => {
  try {
    const userId = req.user._id;

    const schedule = await Schedule.find({ userId });

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
