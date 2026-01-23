import { faker } from "@faker-js/faker";
import { USER_INTAKE_STATUS_ENUM } from "./enums.zod.js";
import type { UserIntakeLogCreateInput } from "./user_adherence_log.zod.js";

export const createUserIntakeLogFixture = (input?: Partial<UserIntakeLogCreateInput>) => ({
	supplementId: faker.string.uuid(),
	status: faker.helpers.arrayElement(USER_INTAKE_STATUS_ENUM),
	scheduledFor: faker.date.recent().getTime(),
	actualAt: faker.date.recent().getTime(),
	logTimezone: faker.date.timeZone(),
	reason: faker.datatype.boolean() ? faker.lorem.sentence() : null,
	...input
})