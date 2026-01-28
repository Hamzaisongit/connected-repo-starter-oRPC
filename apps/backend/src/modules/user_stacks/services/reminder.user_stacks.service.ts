import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { userStackReminderTaskDef } from "@backend/modules/events/events.schema";
import { tbus } from "@backend/modules/events/tbus";
import { logger } from "@backend/utils/logger.utils";

export const reminderUserStackService = async () => {
    logger.info("Starting supplement reminder cron job...");

	const stacksDueForReminder = await db.userStacks.join("user")
		.whereOneOf(
			{ "user.emailNotificationPreference": true },
			{ "user.pushNotificationPreference": true }
		)
		.where({ 
			isActive: true
		})
		.whereSql`
			"reminder_days" @> ARRAY[
				TRIM(TO_CHAR((NOW() AT TIME ZONE "user"."timezone"), 'Day'))
			]::varchar[]
		`
		.whereSql`
		(( DATE(NOW() AT TIME ZONE "user"."timezone") + "user_stacks"."reminder_time"::time) AT TIME ZONE "user"."timezone") 
		BETWEEN NOW() AND (NOW() + INTERVAL '1 minute')
		`
		.whereNotExists((q) => q.intakeLogs
			.where({
				scheduledFor: {
					gte: new Date().toUTCString(),
					lte: new Date(Date.now() + 60 * 1000).toUTCString(),
				}
			})
		)
		.select('userId','reminderTime','user.email','user.name','user.pushNotificationPreference','user.emailNotificationPreference',{
			// This 'sql' block creates the array of supplement objects with needed columns
			supplements: sql<Array<{ name: string, dosage: number, unit: string, instructions: string[] }>>`
				json_agg(
					json_build_object(
						'name', "user_stacks"."name",
						'dosage', "user_stacks"."dosage",
						'unit', "user_stacks"."unit",
                        'instructions', "user_stacks"."instructions"
				))
			`})
		// @ts-ignore
		.group('userId','reminderTime', "email", "emailNotificationPreference", "user.name", "pushNotificationPreference")

    let tasksSent = 0;

	for (const stack of stacksDueForReminder) {
		try {
			if (!stack.supplements || stack.supplements.length === 0) continue;

			// Convert reminderTime ("hhmmss") to "HH:MM am/pm" 12 hour format
            const [hh="08", mm="00"] = stack.reminderTime.split(":");
            let hour = parseInt(hh, 10);
            const minute = mm.padStart(2, "0");
            const ampm = hour >= 12 ? "pm" : "am";
            hour = hour % 12 || 12;
            stack.reminderTime = `${hour}:${minute} ${ampm}`;

			await tbus.send(userStackReminderTaskDef.from(stack))

			tasksSent++;
		} catch (err) {
			logger.error({ err }, "Error processing stack for supplement reminder");
		}
	}

    logger.info(
        {
            usersProcessed: Object.keys(stacksDueForReminder).length,
            tasksSent,
        },
        "Processed supplement stack reminders"
    );
}