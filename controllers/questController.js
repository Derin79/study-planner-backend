const DailyQuest = require("../models/DailyQuest");
const UserDailyQuest = require("../models/UserDailyQuest");
const TaskRecord = require("../models/TaskRecord");
const Task = require("../models/Task");
const User = require("../models/User");

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// =======================
// GET TODAY QUESTS
// =======================
exports.getTodayQuests = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayDate();

    let userQuests = await UserDailyQuest.findOne({
      userId,
      date: today,
    }).populate("quests.questId");

    if (userQuests) return res.json(userQuests);

    const allQuests = await DailyQuest.find();

    if (!allQuests.length) {
      return res.status(400).json({ message: "No quests in database" });
    }

    const selected = allQuests.sort(() => 0.5 - Math.random()).slice(0, 3);

    const newQuest = await UserDailyQuest.create({
      userId,
      date: today,
      quests: selected.map((q) => ({
        questId: q._id,
        completed: false,
      })),
    });

    const populated = await UserDailyQuest.findById(newQuest._id).populate(
      "quests.questId",
    );

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =======================
// COMPLETE QUEST (REAL CHECK)
// =======================
exports.completeQuest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { questId } = req.body;
    const today = getTodayDate();

    const userQuests = await UserDailyQuest.findOne({ userId, date: today });

    if (!userQuests) {
      return res.status(404).json({ message: "No quests found for today" });
    }

    const quest = userQuests.quests.find(
      (q) => q.questId.toString() === questId,
    );

    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    if (quest.completed) {
      return res.status(400).json({
        message: "Quest already completed today ✅",
      });
    }

    const questTemplate = await DailyQuest.findById(questId);

    if (!questTemplate) {
      return res.status(404).json({ message: "Quest template not found" });
    }

    // =======================
    // QUEST VALIDATION RULES
    // =======================

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get today's completed study records
    const records = await TaskRecord.find({
      userId,
      start: { $gte: todayStart },
      completed: true,
    });

    const totalMinutes = records.reduce(
      (sum, r) => sum + (r.actualDuration || 0),
      0,
    );

    // ❌ Tomorrow-only quest cannot be completed today
    if (questTemplate.type === "tomorrow_only") {
      return res.status(400).json({
        message: "This quest can only be completed tomorrow ⏳",
      });
    }

    // Study minutes quest
    if (questTemplate.type === "study_minutes") {
      if (totalMinutes < (questTemplate.requiredMinutes || 0)) {
        return res.status(400).json({
          message: `You must study at least ${questTemplate.requiredMinutes} minutes today to complete this quest.`,
        });
      }
    }

    // Hard session quest
    if (questTemplate.type === "hard_session") {
      const hardSession = records.some((r) => r.difficulty === "hard");
      if (!hardSession) {
        return res.status(400).json({
          message: "You must complete a HARD study session today.",
        });
      }
    }

    // Reflection quest
    if (questTemplate.type === "reflection") {
      const reflectionDone = records.some(
        (r) => r.reflection && r.reflection.trim() !== "",
      );

      if (!reflectionDone) {
        return res.status(400).json({
          message: "You must submit a reflection today to complete this quest.",
        });
      }
    }

    // No missed tasks quest
    if (questTemplate.type === "no_missed_tasks") {
      const missedTasks = await Task.find({ userId, status: "missed" });

      if (missedTasks.length > 0) {
        return res.status(400).json({
          message: "You still have missed tasks today. Complete them first!",
        });
      }
    }

    // ========================
    // GIVE REWARD
    // ========================
    const user = await User.findById(userId);

    user.xp = (user.xp || 0) + (questTemplate.rewardXP || 0);
    user.points = (user.points || 0) + (questTemplate.rewardPoints || 0);
    user.level = Math.floor(user.xp / 100) + 1;

    await user.save();

    quest.completed = true;
    await userQuests.save();

    return res.json({
      message: "Quest completed 🎉",
      rewardXP: questTemplate.rewardXP,
      rewardPoints: questTemplate.rewardPoints,
      xp: user.xp,
      points: user.points,
      level: user.level,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
