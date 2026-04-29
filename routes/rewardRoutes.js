const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const rewardController = require("../controllers/rewardController");

router.get("/", protect, rewardController.getRewards);
router.post("/buy-freeze", protect, rewardController.buyFreeze);

module.exports = router;
