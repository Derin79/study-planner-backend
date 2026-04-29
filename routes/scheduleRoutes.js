const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  saveSchedule,
  getSchedule,
} = require("../controllers/scheduleController");

// Save schedule
router.post("/", protect, saveSchedule);

// Get schedule
router.get("/", protect, getSchedule);

module.exports = router;
