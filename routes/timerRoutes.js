const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  startTimer,
  stopTimer,
  submitReflection,
  getRecords,
  getWeeklyProgress,
} = require("../controllers/timerController");

router.post("/start", protect, startTimer);
router.post("/stop", protect, stopTimer);
router.post("/reflection", protect, submitReflection);
router.get("/records", protect, getRecords);
router.get("/weekly-progress", protect, getWeeklyProgress);

module.exports = router;
