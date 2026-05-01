// const taskRoutes = require("./routes/taskRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
const taskRoutes = require("./routes/taskRoutes");
const timerRoutes = require("./routes/timerRoutes");
const questRoutes = require("./routes/questRoutes");
const plannerRoutes = require("./routes/plannerRoutes");

const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Handle preflight requests
app.options("*", cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timer", timerRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/planner", plannerRoutes);

app.get("/", (req, res) => {
  res.send("Gamified Study Planner API Running...");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB Connection Error:", err.message));
