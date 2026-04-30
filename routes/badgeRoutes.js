const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getBadges } = require("../controllers/badgeController");

router.get("/", protect, getBadges);

module.exports = router;
