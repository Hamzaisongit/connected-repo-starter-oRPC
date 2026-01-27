//events and task definitions
import { defineEvent, defineTask, Type } from "pg-tbus";

export const userCreatedEventDef = defineEvent({
	event_name: "user.created",
	schema: Type.Object({
		userId: Type.String({ format: "uuid" }),
		email: Type.String(),
		name: Type.String()
	}),
});

export const userStackReminderTaskDef = defineTask({
	task_name: "send_user_stack_reminder",
	schema: Type.Object({
		userId: Type.String({ format: "uuid" }),
		email: Type.String({ format: 'email' }),
		name: Type.String(),
		pushNotificationPreference: Type.Boolean(),
		emailNotificationPreference: Type.Boolean(),
		supplements: Type.Array(Type.Object({
			name: Type.String(),
			dosage: Type.Number(),
			unit: Type.String(),
			instructions: Type.Array(Type.String()),
		})),
		reminderTime: Type.String(),
	}),
});
