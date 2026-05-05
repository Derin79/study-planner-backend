const Task = require("../models/Task");
const UserPreferences = require("../models/UserPreferences");

function getStudyHours(preferredStudyTime) {
  if (preferredStudyTime === "morning") return [6, 7, 8, 9, 10, 11];
  if (preferredStudyTime === "afternoon") return [12, 13, 14, 15, 16, 17];
  if (preferredStudyTime === "evening") return [18, 19, 20, 21, 22, 23];
  if (preferredStudyTime === "night") return [0, 1, 2, 3, 4, 5];

  return [18, 19, 20, 21, 22];
}

// NEXT 14 DAYS
function getNext14DaysSlots() {
  const today = new Date();
  let slots = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      date.getDay()
    ];

    slots.push({
      date,
      dayName,
      fullDate: date.toISOString().split("T")[0],
    });
  }

  return slots;
}

// ==========================================
// ✅ FIXED SMART PLANNER
// ==========================================
const generatePlanLogic = async (userId) => {
  const preferences = await UserPreferences.findOne({ userId });

  if (!preferences) throw new Error("Please complete onboarding first.");

  const { busyDays, preferredStudyTime, dailyGoalHours, maxSessionMinutes } =
    preferences;

  const studyHours = getStudyHours(preferredStudyTime);

  const shuffledStudyHours = [...studyHours].sort(() => Math.random() - 0.5);

  const now = new Date();

  // SORT BY DEADLINE (IMPORTANT)
  const tasks = await Task.find({ userId, status: "pending" }).sort({
    deadline: 1,
  });

  if (!tasks.length) return "No pending tasks found.";

  let availableSlots = [];
  let unscheduledTasks = [];

  const next14Days = getNext14DaysSlots();

  // ==========================================
  // ✅ BUILD VALID FUTURE SLOTS ONLY
  // ==========================================
  for (let dayObj of next14Days) {
    const { dayName, fullDate } = dayObj;

    if (busyDays.includes(dayName)) continue;

    let dailyMinutesUsed = 0;
    const maxDailyMinutes = dailyGoalHours * 60;

    for (let hour of shuffledStudyHours) {
      const slotDateTime = new Date(`${fullDate}T${hour}:00:00`);

      // ❌ SKIP PAST TIME (CRITICAL FIX)
      if (slotDateTime <= now) continue;

      // ❌ RESPECT DAILY LIMIT
      if (dailyMinutesUsed >= maxDailyMinutes) break;

      availableSlots.push({
        day: dayName,
        fullDate,
        hour,
        slotDateTime,
        occupied: false,
      });

      dailyMinutesUsed += maxSessionMinutes;
    }
  }

  if (!availableSlots.length) {
    return "No available study slots. Adjust your preferences.";
  }

  // CLEAR OLD SCHEDULE
  await Task.updateMany(
    { userId, status: "pending" },
    { $set: { assignedSlots: [], isScheduled: false } },
  );

  // ==========================================
  // ✅ SMART ASSIGNMENT
  // ==========================================
  for (let task of tasks) {
    let remainingMinutes = task.duration;
    let assignedSlots = [];

    for (let slot of availableSlots) {
      if (remainingMinutes <= 0) break;

      // ❌ skip used slots
      if (slot.occupied) continue;

      // ❌ DON'T GO AFTER DEADLINE
      if (slot.slotDateTime > new Date(task.deadline)) break;

      assignedSlots.push({
        day: slot.day,
        fullDate: slot.fullDate,
        hour: slot.hour,
      });

      slot.occupied = true;

      // ✅ SMART SPLIT
      remainingMinutes -= Math.min(maxSessionMinutes, remainingMinutes);
    }

    if (remainingMinutes > 0) {
      task.assignedSlots = [];
      task.isScheduled = false;
      await task.save();

      unscheduledTasks.push(task.title);
      continue;
    }

    task.assignedSlots = assignedSlots;
    task.isScheduled = true;
    await task.save();
  }

  if (unscheduledTasks.length > 0) {
    return `Some tasks couldn't be scheduled before deadline: ${unscheduledTasks.join(
      ", ",
    )}`;
  }

  return "Weekly plan generated successfully ✅";
};

exports.generatePlanLogic = generatePlanLogic;

// ==========================================
// CONTROLLER
// ==========================================
exports.generatePlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const message = await generatePlanLogic(userId);

    return res.status(200).json({ message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
