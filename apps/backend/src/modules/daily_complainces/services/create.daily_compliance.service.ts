import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { daysPlanUserStacksService } from "@backend/modules/user_stacks/services/days_plan.user_stacks.services";
import { dayJsTz } from "@backend/utils/dayjs.utils";
import { dailyComplianceSelectAllZod } from "@connected-repo/zod-schemas/daily_compliance.zod";
import dayjs from "dayjs";
import z from "zod";

// Configurable batch size
const BATCH_SIZE = 10;

export const processedCronJobsOutput = z.record(
  z.uuid(), 
  z.array(
    z.record(
      z.iso.date(),
      dailyComplianceSelectAllZod
    )
  )
);
type ProcessedCronJobsOutput = z.infer<typeof processedCronJobsOutput>;

export const createAllUsersDailyComplianceService = async () => {
  // 1. Fetch users who are "behind" on compliance
  const users = await db.users.select("id", "timezone", "createdAt", {
    latest: (t) => t.dailyCompliances.order({ date: "DESC" }).takeOptional(),
    userStats: (t) => t.userStats.select("shieldsBalance").take(),
  })
  .where(sql`("created_at" AT TIME ZONE "timezone")::date < (now() AT TIME ZONE "timezone")::date`)
  .where({
    OR: [
      // Doesn't have any compliance logs
      { "latest.date": null },
      // Or latest compliance is before yesterday
      {
        "latest.date": { lt: sql`date(now() AT TIME ZONE "timezone" - interval '1 day')` }
      }
    ]
  });

  const processed: ProcessedCronJobsOutput = {};

  // Process users in batches
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (user) => {
      const userTz = user.timezone || 'UTC';
      const yesterday = dayjs().tz(userTz).subtract(1, 'day').format('YYYY-MM-DD');
      
      let dateForNewLog = user.latest 
        ? dayjs(user.latest.date).add(1, 'day') 
        : dayjs(user.createdAt).tz(userTz).startOf('day');

      processed[user.id] = [];

      let shieldsBalance = user.userStats.shieldsBalance;
      // 2. Catch up loop: Process every missing day until yesterday
      while (dateForNewLog.isBefore(dayjs(yesterday).add(1, 'day'))) {
        const dateStr = dateForNewLog.format('YYYY-MM-DD');
        const result = await createComplianceForDate(
          dateStr,
          shieldsBalance,
          user.id,
          userTz
        );
        shieldsBalance = typeof result === 'object' ? result.shieldsClosingBalance : shieldsBalance;
        processed[user.id]!.push({ [dateStr]: result });
        
        dateForNewLog = dateForNewLog.add(1, 'day');
      }
    }));
  }
  
  return processed;
};

async function createComplianceForDate(
  planDate: string,
  shieldsBalance: number,
  userId: string, 
  userTz: string
) {
  return db.$transaction(async () => {
    // 1. Get requirements and logs in parallel
    const daysPlan = await daysPlanUserStacksService({
        planDate,
        userTz,
        userId
      });

    // 2. Simple logic: If not in logs, it's missed (or shield it)
    let shieldsUsed = 0;
    for (const sub of daysPlan.supplements) {
      if (!sub.todayIntakeLog) {
        const [hour, minute] = sub.reminderTime.split(":");
        const scheduledFor = dayJsTz(userTz, planDate).hour(parseInt(hour || "0")).minute(parseInt(minute || "0")).toDate();

        if (shieldsBalance > shieldsUsed) {
          shieldsUsed++;
          daysPlan.takenCount++;
        };

        await db.userIntakeLogs.create({
          userId,
          actualAt: () => sql`NOW()`,
          scheduledFor,
          status: shieldsBalance > shieldsUsed ? "Shield used" : "Missed",
          supplementId: sub.id,
          logTimezone: userTz,
        })
      }
    }

     const intakePercentage = daysPlan.totalCount > 0 ? ((daysPlan.takenCount / daysPlan.totalCount) * 100).toFixed(2) : '100.00';

     return await db.dailyCompliances.create({
       userId,
       date: planDate,
       intakeCount: daysPlan.takenCount,
       intakePercentage,
       shieldsUsed,
       shieldsClosingBalance: shieldsBalance - shieldsUsed,
       shieldsOpeningBalance: shieldsBalance,
       totalSupplements: daysPlan.totalCount,
     });
  });
}