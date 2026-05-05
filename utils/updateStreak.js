const User = require("../models/User");

function getDateString(date) {
  return date.toISOString().split("T")[0];
}

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

exports.updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = getDateString(new Date());

  let freezeUsed = false;

  // First time ever
  if (!user.lastActiveDate) {
    user.streak = 1;
    user.lastActiveDate = today;
    await user.save();
    return { user, freezeUsed };
  }

  // If already active today, no change
  if (user.lastActiveDate === today) {
    return { user, freezeUsed };
  }

  const gapDays = daysBetween(user.lastActiveDate, today);

  // If user studied yesterday (gap = 1)
  if (gapDays === 1) {
    user.streak = (user.streak || 0) + 1;
    user.lastActiveDate = today;
    await user.save();
    return { user, freezeUsed };
  }

  // If gapDays is 2 or more (missed days)
  if (gapDays >= 2) {
    const missedDays = gapDays - 1;

    // If freezeCount can cover missed days
    if ((user.freezeCount || 0) >= missedDays) {
      user.freezeCount -= missedDays;
      freezeUsed = true;

      // streak stays same
      user.lastActiveDate = today;
      await user.save();
      return { user, freezeUsed };
    }

    // Freeze not enough -> streak resets fully
    user.streak = 1;
    user.lastActiveDate = today;

    // freezeCount becomes 0 because it can't save the streak fully
    user.freezeCount = 0;

    await user.save();
    return { user, freezeUsed };
  }

  // fallback
  user.streak = 1;
  user.lastActiveDate = today;
  await user.save();

  return { user, freezeUsed };
};
