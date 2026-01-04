/**
 * Returns the UTC millisecond timestamps for the start and end of the user's "today" day, given their timezone offset (in minutes).
 * @param timezoneOffsetMinutes The user's timezone offset in minutes (positive if behind UTC, negative if ahead).
 * @returns { startUtcMs: number; endUtcMs: number }
 */
export const getUserTimeframe = (timezoneOffsetMinutes: number): {
	userDayOfWeek: number;
	userDay: number;
	userMonth: number;
	userYear: number;
	UTCTimeWhenUserTodayStarts: number;
	UTCTimeWhenUserTodayEnds: number;
} => {
	// Date.now() gives current UTC time in ms
	const nowUtcMs = Date.now();

	// Make a date in the user's local time by applying the offset
	// offset: e.g. UTC-7h = 420; UTC+2h = -120
	const millisecondsPassedInUserLocalTime = nowUtcMs - timezoneOffsetMinutes * 60 * 1000;

	const userLocalDate = new Date(millisecondsPassedInUserLocalTime);
	userLocalDate.setUTCHours(0, 0, 0, 0); // start of user's "today" in Milliseconds time

	const userDay = userLocalDate.getUTCDate();
	const userMonth = userLocalDate.getUTCMonth() + 1;
	const userYear = userLocalDate.getUTCFullYear();
	const userDayOfWeek = userLocalDate.getUTCDay(); // 0 (Sunday) to 6 (Saturday), in user's local time

	const UTCTimeWhenUserTodayStarts = userLocalDate.getTime() + timezoneOffsetMinutes * 60 * 1000;
	const UTCTimeWhenUserTodayEnds = UTCTimeWhenUserTodayStarts + 24 * 60 * 60 * 1000 - 1;

	return {
		userDayOfWeek,
		userDay,
		userMonth,
		userYear,
		UTCTimeWhenUserTodayStarts,
		UTCTimeWhenUserTodayEnds
	};
};

/**
 * Returns the UTC millisecond timestamps for the start and end of a specific day in the user's timezone.
 * @param dateMs The UTC timestamp for the day to calculate.
 * @param timezoneOffsetMinutes The user's timezone offset in minutes (positive if behind UTC, negative if ahead).
 * @returns { startUtcMs: number; endUtcMs: number }
 */
export const getUserTimeframeForDate = (dateMs: number, timezoneOffsetMinutes: number): {
	userDayOfWeek: number;
	userDay: number;
	userMonth: number;
	userYear: number;
	UTCTimeWhenUserTodayStarts: number;
	UTCTimeWhenUserTodayEnds: number;
} => {
	// Make a date in the user's local time by applying the offset
	// offset: e.g. UTC-7h = 420; UTC+2h = -120
	const millisecondsPassedInUserLocalTime = dateMs - timezoneOffsetMinutes * 60 * 1000;

	const userLocalDate = new Date(millisecondsPassedInUserLocalTime);
	userLocalDate.setHours(0, 0, 0, 0); // start of user's "today" in Milliseconds time

	const userDay = userLocalDate.getUTCDate();
	const userMonth = userLocalDate.getUTCMonth() + 1; // Months are 0-indexed
	const userYear = userLocalDate.getUTCFullYear();
	const userDayOfWeek = userLocalDate.getUTCDay(); // 0 (Sunday) to 6 (Saturday), in user's local time

	const UTCTimeWhenUserTodayStarts = userLocalDate.getTime() + timezoneOffsetMinutes * 60 * 1000;
	const UTCTimeWhenUserTodayEnds = UTCTimeWhenUserTodayStarts + 24 * 60 * 60 * 1000 - 1;

	return {
		userDayOfWeek,
		userDay,
		userMonth,
		userYear,
		UTCTimeWhenUserTodayStarts,
		UTCTimeWhenUserTodayEnds
	};
};