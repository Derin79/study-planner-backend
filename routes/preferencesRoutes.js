const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  savePreferences,
  getPreferences,
} = require("../controllers/preferencesController");

router.post("/", protect, savePreferences);
router.get("/", protect, getPreferences);

module.exports = router;
