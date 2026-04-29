const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

// existing routes
router.post("/", protect, taskController.createTask);
router.get("/", protect, taskController.getTasks);

// ✅ NEW REDO ROUTE
router.patch("/redo/:taskId", protect, taskController.redoTask);

module.exports = router;
