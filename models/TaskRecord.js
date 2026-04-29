const mongoose = require("mongoose");

const taskRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    start: { type: Date, required: true },
    end: { type: Date },

    actualDuration: { type: Number, default: 0 }, // minutes

    completed: { type: Boolean, default: false },
    reflection: { type: String, default: "" },
    difficulty: { type: String, default: "medium" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.TaskRecord || mongoose.model("TaskRecord", taskRecordSchema);
