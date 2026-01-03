import { faker } from "@faker-js/faker";
import { USER_ADHERENCE_STATUS_ENUM } from "./enums.zod.js";
import type { UserAdherenceLogCreateInput } from "./user_adherence_log.zod.js";

export const createUserAdherenceLogFixture = (input?: Partial<UserAdherenceLogCreateInput>) => ({
	supplementId: faker.string.uuid(),
	status: faker.helpers.arrayElement(USER_ADHERENCE_STATUS_ENUM),
	scheduledFor: faker.date.recent().getTime(),
	actualAt: faker.date.recent().getTime(),
	timeZoneOffset: faker.number.int({ min: -720, max: 720 }),
	reason: faker.datatype.boolean() ? faker.lorem.sentence() : null,
	...input
})