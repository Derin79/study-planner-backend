const TaskRecord = require("../models/TaskRecord");
const Task = require("../models/Task");
const User = require("../models/User");

// ✅ Add this at the top
const { updateStreak } = require("../utils/updateStreak");

// Start Timer
exports.startTimer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ Security: only allow pending tasks
    if (task.status !== "pending") {
      return res.status(400).json({
        message: "You cannot start this task.",
      });
    }

    const record = await TaskRecord.create({
      userId,
      taskId,
      start: new Date(),
    });

    res.status(201).json({ message: "Timer started", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const userId = req.user._id;

    const records = await TaskRecord.find({ userId }).populate("taskId");

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Weekly Progress
exports.getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const today = new Date();
    const weekStart = new Date(today);

    weekStart.setDate(today.getDate() - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const tasks = await TaskRecord.find({
      userId,
      start: { $gte: weekStart },
    });

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const weekData = weekDays.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);

      const dayTasks = tasks.filter(
        (t) => new Date(t.start).toDateString() === dayDate.toDateString(),
      );

      const totalStudyMinutes = dayTasks.reduce(
        (sum, t) => sum + (t.actualDuration || 0),
        0,
      );

      const completedTasks = dayTasks.filter((t) => t.completed).length;

      return { day, totalStudyMinutes, completedTasks };
    });

    res.status(200).json(weekData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stop Timer
exports.stopTimer = async (req, res) => {
  try {
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(400).json({ message: "Record ID is required" });
    }

    const record = await TaskRecord.findById(recordId);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (record.end) {
      return res.status(400).json({ message: "Timer already stopped" });
    }

    record.end = new Date();

    const durationMinutes = Math.round((record.end - record.start) / 60000);
    record.actualDuration = durationMinutes < 1 ? 1 : durationMinutes;

    await record.save();

    // ✅ Update streak after timer stops
    await updateStreak(record.userId);

    res.status(200).json({
      message: "Timer stopped",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Reflection
exports.submitReflection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recordId, completed, reflection, difficulty } = req.body;

    const record = await TaskRecord.findById(recordId);
    if (!record) return res.status(404).json({ message: "Record not found" });

    record.completed = completed || false;
    record.reflection = reflection || "";
    record.difficulty = difficulty || "medium";
    await record.save();

    // Update task status
    if (completed) {
      await Task.findByIdAndUpdate(record.taskId, { status: "completed" });
    } else {
      await Task.findByIdAndUpdate(record.taskId, { status: "missed" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.badges = user.badges || [];
    user.points = user.points || 0;
    user.xp = user.xp || 0;
    user.level = user.level || 1;

    let earnedXP = 0;
    let punishmentPoints = 0;
    let punishmentMessage = null;

    // ============================
    // ✅ LEVEL TRACKING
    // ============================
    const oldLevel = user.level || 1;

    // ============================
    // ✅ REWARD SYSTEM
    // ============================
    if (completed) {
      if (difficulty === "easy") earnedXP = 10;
      if (difficulty === "medium") earnedXP = 20;
      if (difficulty === "hard") earnedXP = 30;

      user.xp += earnedXP;
      user.points += 10;
    }

    // ============================
    // ❌ PUNISHMENT SYSTEM
    // ============================
    if (!completed) {
      punishmentPoints = 5;
      user.points -= punishmentPoints;

      if (user.points < 0) user.points = 0;

      punishmentMessage =
        "⚠️ Task missed! You lost 5 points. Stay disciplined!";
    }

    // ============================
    // ✅ NEW LEVEL CALCULATION
    // ============================
    const newLevel = Math.floor(user.xp / 100) + 1;
    user.level = newLevel;

    let leveledUp = false;
    if (newLevel > oldLevel) leveledUp = true;

    // ============================
    // ✅ BADGE LOGIC
    // ============================
    let newBadge = null;

    if (leveledUp) {
      newBadge = `Level ${newLevel} Champion Badge 🏅`;

      if (!user.badges.includes(newBadge)) {
        user.badges.push(newBadge);
      }
    }

    // ============================
    // 🚨 DAILY MISSED LIMIT PUNISHMENT
    // ============================
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const missedToday = await TaskRecord.countDocuments({
      userId,
      completed: false,
      start: { $gte: todayStart },
    });

    if (missedToday >= 3) {
      user.points -= 10;
      if (user.points < 0) user.points = 0;

      punishmentMessage =
        "🚨 Discipline Warning! You missed 3+ tasks today. -10 extra points!";
    }

    await user.save();

    // ============================
    // ✅ STREAK UPDATE
    // ============================
    const streakRes = await updateStreak(userId);

    res.status(200).json({
      message: "Reflection saved successfully",
      earnedXP,
      punishmentPoints,
      punishmentMessage,
      xp: user.xp,
      points: user.points,
      level: leveledUp ? newLevel : null,
      newBadge,
      freezeUsed: streakRes.freezeUsed,
      streak: streakRes.user.streak,
      freezeCount: streakRes.user.freezeCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
