const Task = require("../models/Task");
const UserPreferences = require("../models/UserPreferences");

function getStudyHours(preferredStudyTime) {
  if (preferredStudyTime === "morning") return [6, 7, 8, 9, 10];
  if (preferredStudyTime === "afternoon") return [12, 13, 14, 15, 16];
  return [18, 19, 20, 21, 22];
}

// NEXT 14 DAYS SLOTS
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
      fullDate: date.toISOString().split("T")[0], // YYYY-MM-DD
    });
  }

  return slots;
}

// ==========================================
// ✅ REUSABLE PLANNER LOGIC FUNCTION
// ==========================================
const generatePlanLogic = async (userId) => {
  const preferences = await UserPreferences.findOne({ userId });

  if (!preferences) throw new Error("Please complete onboarding first.");

  const { busyDays, preferredStudyTime, dailyGoalHours, maxSessionMinutes } =
    preferences;

  const studyHours = getStudyHours(preferredStudyTime);

  // only schedule pending tasks
  const tasks = await Task.find({ userId, status: "pending" }).sort({
    deadline: 1,
  });

  if (!tasks.length) return "No pending tasks found.";

  let availableSlots = [];
  let unscheduledTasks = [];

  const next14Days = getNext14DaysSlots();

  // Build slots
  for (let dayObj of next14Days) {
    const { dayName, fullDate } = dayObj;

    if (busyDays.includes(dayName)) continue;

    let dailySlotsAllowed = dailyGoalHours;

    for (let hour of studyHours) {
      if (dailySlotsAllowed <= 0) break;

      const slotDateTime = new Date(fullDate + "T" + hour + ":00:00");

      // only future slots
      if (slotDateTime >= new Date()) {
        availableSlots.push({
          day: dayName, // ✅ FIX: STORE DAY
          fullDate,
          hour,
          slotDateTime,
        });

        dailySlotsAllowed -= 1;
      }
    }
  }

  if (!availableSlots.length) {
    return "No available study slots. Reduce busy days or increase daily goal hours.";
  }

  // Clear old scheduled slots for pending tasks
  await Task.updateMany(
    { userId, status: "pending" },
    { $set: { assignedSlots: [], isScheduled: false } },
  );

  let slotIndex = 0;

  for (let task of tasks) {
    let remainingMinutes = task.duration;
    let assignedSlots = [];

    while (remainingMinutes > 0 && slotIndex < availableSlots.length) {
      const slot = availableSlots[slotIndex];

      // STOP if slot is after task deadline
      if (slot.slotDateTime > new Date(task.deadline)) break;

      assignedSlots.push({
        day: slot.day, // ✅ FIX: SAVE DAY
        fullDate: slot.fullDate,
        hour: slot.hour,
      });

      remainingMinutes -= maxSessionMinutes;
      slotIndex++;
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
    return `Plan generated but these tasks could not be scheduled before deadline: ${unscheduledTasks.join(
      ", ",
    )}`;
  }

  return "Weekly plan generated successfully ✅";
};

exports.generatePlanLogic = generatePlanLogic;

// ==========================================
// ✅ MAIN ROUTE CONTROLLER FUNCTION
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
