const Task = require("../models/Task");
const { generatePlanLogic } = require("./plannerController");

// ============================
// ✅ Create Task
// ============================
exports.createTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, duration, deadline, subject } = req.body;

    if (!title || !duration || !deadline || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const task = await Task.create({
      userId,
      title,
      duration,
      deadline,
      subject,
      assignedSlots: [],
      isScheduled: false,
      status: "pending",
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// ✅ Get Tasks + Auto Mark Missed
// ============================
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // mark overdue pending tasks as missed
    const tasks = await Task.find({
      userId,
      status: "pending",
    });

    for (const task of tasks) {
      if (!task.assignedSlots?.length) continue;

      const slot = task.assignedSlots[0];

      const startTime = new Date(
        `${slot.fullDate}T${String(slot.hour).padStart(2, "0")}:${String(
          slot.minute || 0,
        ).padStart(2, "0")}:00`,
      );

      // add task duration
      const endTime = new Date(startTime.getTime() + task.duration * 60000);

      // becomes missed ONLY after duration passes
      if (now > endTime) {
        task.status = "missed";
        task.isScheduled = false;
        task.assignedSlots = [];

        await task.save();
      }
    }

    // const tasks = await Task.find({ userId }).sort({ deadline: 1 });

    const updatedTasks = await Task.find({ userId }).sort({ deadline: 1 });

    res.status(200).json(updatedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// ✅ Redo Missed Task (REAL FIX)
// ============================
exports.redoTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId } = req.params;

    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "missed") {
      return res.status(400).json({
        message: "Only missed tasks can be redone",
      });
    }

    // ✅ Give a new deadline (24hrs from now)
    const newDeadline = new Date();
    newDeadline.setHours(newDeadline.getHours() + 24);

    task.status = "pending";
    task.deadline = newDeadline;
    task.assignedSlots = [];
    task.isScheduled = false;

    await task.save();

    // auto reschedule immediately
    const planMessage = await generatePlanLogic(userId);

    return res.status(200).json({
      message: `Task redone successfully ✅ New deadline set. ${planMessage}`,
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
