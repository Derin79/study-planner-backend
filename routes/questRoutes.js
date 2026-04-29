const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const questController = require("../controllers/questController");

router.get("/", protect, questController.getTodayQuests);
router.post("/complete", protect, questController.completeQuest);

module.exports = router;
