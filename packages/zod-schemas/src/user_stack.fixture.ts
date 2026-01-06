import { faker } from "@faker-js/faker";
import { DAYS_OF_WEEK_ENUM } from "./enums.zod.js";
import type { UserStackCreateInput } from "./user_stack.zod.js";

export const createUserStackFixture = (input?: Partial<UserStackCreateInput>) => ({
	name: faker.commerce.productName(),
	instructions: faker.lorem.sentences(2).split('. ').filter(s => s.length > 0),
	isActive: faker.datatype.boolean(),
	dosage: faker.number.int({ min: 1, max: 10 }),
	unit: faker.string.alpha(3),
	reminderDays: faker.helpers.arrayElements([...DAYS_OF_WEEK_ENUM], { min: 1, max: 7 }),
 	reminderTime: `${faker.number.int({min:0,max:23}).toString().padStart(2,'0')}:${faker.number.int({min:0,max:59}).toString().padStart(2,'0')}:00`,
	imageUrl: faker.datatype.boolean() ? faker.image.url() : null,
	...input
})