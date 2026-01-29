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
				.select("actualAt", "id", "logTimezone", "scheduledFor", "status", {
					scheduledForTz: sql`("scheduled_for" AT TIME ZONE ${userTz})`
				})
				// .where(sql`("scheduled_for" AT TIME ZONE ${userTz})::date = ${planDate}::date`)
				// Better (allows index usage):
				.where(sql`
					"scheduled_for" AT TIME ZONE ${userTz} >= ${planDate}::timestamp 
					AND "scheduled_for" AT TIME ZONE ${userTz} < (${planDate}::timestamp + interval '1 day')
				`)
				.takeOptional()
		})
		.where({ 
			userId: userId, 
			OR:[
				{ NOT: { "todayIntakeLog.scheduledFor": null } }, // Has a log today even if in active stack
				{ isActive: true }
			] })
		// Filter stacks where today's day name exists in the reminder_days array
		.where(sql`to_char(${planDate}::date, 'FMDay') = ANY("reminder_days")`)
		.order({
			reminderTime: "ASC",
		});

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