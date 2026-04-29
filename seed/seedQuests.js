const mongoose = require("mongoose");
require("dotenv").config();

const DailyQuest = require("../models/DailyQuest");

const seedQuests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Optional: clear old quests first
    await DailyQuest.deleteMany();
    console.log("Old quests cleared");

    await DailyQuest.insertMany([
      {
        title: "Study 30 mins",
        description: "Complete at least 30 minutes of study today",
        rewardXP: 20,
        rewardPoints: 10,
      },
      {
        title: "Complete 1 Task",
        description: "Finish one scheduled task today",
        rewardXP: 30,
        rewardPoints: 15,
      },
      {
        title: "Write a Reflection",
        description: "Submit a reflection after studying",
        rewardXP: 15,
        rewardPoints: 10,
      },
      {
        title: "Streak Booster",
        description: "Study again tomorrow to keep your streak alive",
        rewardXP: 25,
        rewardPoints: 5,
      },
      {
        title: "Study 1 Hour",
        description: "Study for at least 1 hour today",
        rewardXP: 40,
        rewardPoints: 20,
      },
      {
        title: "Complete 2 Tasks",
        description: "Finish two tasks today",
        rewardXP: 50,
        rewardPoints: 25,
      },
      {
        title: "No Missed Tasks",
        description: "Make sure you don’t miss any task today",
        rewardXP: 20,
        rewardPoints: 10,
      },
      {
        title: "Early Bird",
        description: "Start studying before 10AM",
        rewardXP: 25,
        rewardPoints: 10,
      },
      {
        title: "Night Owl",
        description: "Study after 9PM",
        rewardXP: 25,
        rewardPoints: 10,
      },
      {
        title: "Focus Mode",
        description: "Complete a full session without stopping the timer early",
        rewardXP: 35,
        rewardPoints: 15,
      },
    ]);

    console.log("✅ Quests seeded successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedQuests();
