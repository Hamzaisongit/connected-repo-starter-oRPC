import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { dayJsTz } from "@backend/utils/dayjs.utils";
import { UserIntakeStatus } from "@connected-repo/zod-schemas/enums.zod";

export const daysPlanUserStacksService = async ({
  planDate,
  userId,
  userTz,
}: {
  planDate: string;
  userId: string;
  userTz: string;
}) => {
  // Get all user stacks
		const todaysSupplements = await db.userStacks
			.select("*", {
				todayIntakeLog: (q) => q.intakeLogs
					.select("actualAt", "id", "logTimezone","scheduledFor", "status")
					.where(sql`("scheduled_for" AT TIME ZONE ${userTz})::date = ${planDate}`)
					.takeOptional()
			})
			.where({ 
        userId: userId, 
        OR:[
          { NOT: {"todayIntakeLog.scheduledFor": null } },
          { isActive: true }
        ] })
      // Filter stacks where today's day name exists in the reminder_days array
      .where(sql`trim(to_char(${planDate} AT TIME ZONE ${userTz}, 'Day')) = ANY("reminder_days")`);

		

		// Determine status for each supplement
		const supplementsWithStatus = todaysSupplements.map(supplement => {

			let status: UserIntakeStatus | "pending" | "overdue";
			const currentTime = dayJsTz(userTz).format("HH:mm"); // HH:MM format in user tz

			if (supplement.todayIntakeLog) {
				status = supplement.todayIntakeLog.status
			} else if (currentTime > supplement.reminderTime) {
				status = "overdue";
			} else {
				status = "pending";
			}

			return {
				...supplement,
				status,
			};
		});

		// Calculate stats
		const totalCount = supplementsWithStatus.length;
		const takenCount = supplementsWithStatus.filter(s => s.todayIntakeLog).length;
		const overdueCount = supplementsWithStatus.filter(s => s.status === "overdue" || s.status === "Missed").length;
		const compliancePercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

		return {
			supplements: supplementsWithStatus,
			totalCount,
			takenCount,
			overdueCount,
			compliancePercentage,
		};
};