const User = require("../models/User");

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

exports.updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = getToday();
  const yesterday = getYesterday();

  let freezeUsed = false;

  // already active today
  if (user.lastActiveDate === today) {
    return { user, freezeUsed };
  }

  // if last active was yesterday -> streak increases
  if (user.lastActiveDate === yesterday) {
    user.streak = (user.streak || 0) + 1;
    user.lastActiveDate = today;
    await user.save();
    return { user, freezeUsed };
  }

  // missed more than 1 day
  if (user.lastActiveDate && user.lastActiveDate !== yesterday) {
    if ((user.freezeCount || 0) > 0) {
      user.freezeCount -= 1;
      freezeUsed = true;

      // streak stays the same
      user.lastActiveDate = today;
      await user.save();
      return { user, freezeUsed };
    }

    // no freeze -> reset streak
    user.streak = 1;
    user.lastActiveDate = today;
    await user.save();
    return { user, freezeUsed };
  }

  // first time ever
  user.streak = 1;
  user.lastActiveDate = today;
  await user.save();

  return { user, freezeUsed };
};
