import { sql } from "@backend/db/base_table";
import { Db } from "@backend/db/db";

export const updateUserStreakService = async (
  intakePercentage: string,
  orm: Db,
  shieldsUsedToday: number,
  streakPaused: boolean,
  userId: string,
) => {
  const action = streakPaused
    ? "Paused"
    : intakePercentage === "100.00"
      ? "Increment"
      : "Reset";
  
  return orm.userStats
    .find(userId)
    .updateOrThrow({
      currentStreak: () => sql`CASE
        WHEN ${action} = 'Increment' THEN "current_streak" + 1
        WHEN ${action} = 'Reset' THEN 0
        ELSE "current_streak"
      END`,
      longestStreak: () => sql`CASE
        WHEN ${action} = 'Increment' AND ("current_streak" + 1) > "longest_streak" THEN "current_streak" + 1
        ELSE "longest_streak"
      END`,
      currentStreakShieldsUsed: () => sql`CASE
        WHEN ${action} != 'Reset' THEN "current_streak_shields_used" + ${shieldsUsedToday}
        WHEN ${action} = 'Reset' THEN 0
        ELSE "current_streak_shields_used"
      END`,
      longestStreakShieldsUsed: () => sql`CASE
        WHEN ${action} != 'Reset' AND ("current_streak" + 1) > "longest_streak" THEN "current_streak_shields_used" + ${shieldsUsedToday}
        ELSE "longest_streak_shields_used"
      END`,
    });
};