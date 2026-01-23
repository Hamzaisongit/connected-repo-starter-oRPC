import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";

/**
 * Helper function to check if daily compliance has been updated for a given date
 * Returns true if the daily compliance record exists and has been modified
 * Date calculations are performed at the database level for timezone awareness.
 */
export async function isDailyComplianceCreated(
  userId: string, 
  logTimezone: string,
  scheduledDate: number
) {

  const dailyComplianceExists = await db.dailyCompliances
    .where({ userId })
    .where(sql`(to_timestamp(${scheduledDate} / 1000.0) AT TIME ZONE ${logTimezone})::date = "date"`)
    .exists();

  return dailyComplianceExists;
}