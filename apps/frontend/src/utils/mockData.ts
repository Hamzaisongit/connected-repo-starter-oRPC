import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";

export interface MockUser {
	id: string;
	email: string;
	name: string;
	image: string;
}

export interface MockSupplement {
	id: string;
	name: string;
	dosage: number;
	unit: string;
	instructions: string[];
	days: (typeof DAYS_OF_WEEK_ENUM[number])[] | undefined;
	timesOfDay: string[];
	isActive: boolean;
	imageUrl: string | null | undefined;
	createdAt: string | undefined;
}

export interface ScheduleItem {
	supplement: {
		id: string;
		name: string;
		dosage: number;
		unit: string;
		instructions: string[];
		imageUrl: string | null;
	};
	scheduledTime: number;
	adherenceLog: {
		id: string;
		status: string;
		actualAt: string;
	} | null;
	status: "pending" | "taken" | "missed" | "skipped";
	isOverdue: boolean;
}

export interface DailyProgress {
	date: string;
	totalScheduled: number;
	takenOnTime: number;
	takenLate: number;
	missed: number;
	skipped: number;
	completionPercentage: number;
}

export interface UserStats {
	currentStreak: number;
	longestStreak: number;
}

export interface WeeklyCompliance {
	date: string;
	adherencePercentage: number;
}

export interface MonthlyCompliance {
	date: string;
	adherencePercentage: number;
}

export interface AdherenceBreakdown {
	takenOnTime: number;
	takenLate: number;
	missed: number;
	skipped: number;
}

export interface SupplementCompliance {
	supplementId: string;
	name: string;
	complianceRate: number;
	adherenceBreakdown: Record<string, number>;
	count: number;
}

export interface Insights {
	userStats: UserStats | null;
	weeklyCompliance: WeeklyCompliance[];
	monthlyCompliance: MonthlyCompliance[];
	weeklyAvgCompliance: number;
	monthlyAvgCompliance: number;
	totalSupplements: number;
	weeklyComplianceRate: number;
	monthlyComplianceRate: number;
	weeklyAdherenceBreakdown: AdherenceBreakdown;
	monthlyAdherenceBreakdown: AdherenceBreakdown;
	weeklySupplementCompliance: Record<string, SupplementCompliance>;
	monthlySupplementCompliance: Record<string, SupplementCompliance>;
}

export const mockUser: MockUser = {
	id: "mock-user-id-123",
	email: "alex.johnson@example.com",
	name: "Alex Johnson",
	image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
};

export const mockSupplements: MockSupplement[] = [
	{
		id: "1",
		name: "Vitamin D3",
		dosage: 1000,
		unit: "IU",
		instructions: ["Take with food for better absorption"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["09:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-01T00:00:00.000Z",
	},
	{
		id: "2",
		name: "Omega-3 Fish Oil",
		dosage: 1000,
		unit: "mg",
		instructions: ["Take with meals", "Keep refrigerated after opening"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["08:00", "20:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-02T00:00:00.000Z",
	},
	{
		id: "3",
		name: "Multivitamin",
		dosage: 1,
		unit: "tablet",
		instructions: ["Take with breakfast", "Drink plenty of water"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["07:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-03T00:00:00.000Z",
	},
	{
		id: "4",
		name: "Magnesium Glycinate",
		dosage: 400,
		unit: "mg",
		instructions: ["Take before bed", "Helps with relaxation and sleep"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["21:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-04T00:00:00.000Z",
	},
	{
		id: "5",
		name: "Probiotics",
		dosage: 1,
		unit: "capsule",
		instructions: ["Take on empty stomach", "Ideally first thing in morning"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["08:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-05T00:00:00.000Z",
	},
	{
		id: "6",
		name: "Vitamin C",
		dosage: 500,
		unit: "mg",
		instructions: ["Take with meals", "Supports immune system"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["12:00", "18:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-06T00:00:00.000Z",
	},
	{
		id: "7",
		name: "Zinc",
		dosage: 30,
		unit: "mg",
		instructions: ["Take with food", "May cause nausea on empty stomach"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["14:00"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-07T00:00:00.000Z",
	},
	{
		id: "8",
		name: "B-Complex",
		dosage: 1,
		unit: "tablet",
		instructions: ["Take with breakfast", "Helps with energy metabolism"],
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		timesOfDay: ["07:30"],
		isActive: true,
		imageUrl: null,
		createdAt: "2024-01-08T00:00:00.000Z",
	},
	{
		id: "9",
		name: "Calcium",
		dosage: 500,
		unit: "mg",
		instructions: ["Take separately from Iron supplements", "Absorbs better with Vitamin D"],
		days: ["Monday", "Wednesday", "Friday"],
		timesOfDay: ["10:00", "22:00"],
		isActive: false,
		imageUrl: null,
		createdAt: "2024-01-09T00:00:00.000Z",
	},
	{
		id: "10",
		name: "Iron",
		dosage: 18,
		unit: "mg",
		instructions: ["Take with Vitamin C for better absorption", "Do not take with Calcium"],
		days: ["Tuesday", "Thursday", "Saturday"],
		timesOfDay: ["09:00"],
		isActive: false,
		imageUrl: null,
		createdAt: "2024-01-10T00:00:00.000Z",
	},
];

export const mockUserStats: UserStats = {
	currentStreak: 12,
	longestStreak: 18,
};

const generateMockDailySchedule = (date: Date): ScheduleItem[] => {
	const now = new Date();
	const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).getTime();
	const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

	const schedule: ScheduleItem[] = [];

	mockSupplements.forEach((supplement) => {
		if (!supplement.isActive) return;

		supplement.timesOfDay.forEach((timeStr) => {
			const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
			const scheduledTime = todayStart + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);

			const isToday = date.toDateString() === now.toDateString();
			let status: "pending" | "taken" | "missed" | "skipped" = "pending";
			let adherenceLog: { id: string; status: string; actualAt: string } | null = null;

			if (isToday) {
				if (timeStr === "07:00") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 7 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "07:30") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 7.5 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "08:00") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 8 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "09:00") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 9 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "12:00") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 12 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "14:00") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 14 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "18:00") {
					status = "taken";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Taken on-time",
						actualAt: new Date(todayStart + 18 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "20:00") {
					status = "skipped";
					adherenceLog = {
						id: `log-${supplement.id}-${timeStr}`,
						status: "Skipped",
						actualAt: new Date(todayStart + 20 * 60 * 60 * 1000).toISOString(),
					};
				} else if (timeStr === "21:00") {
					status = "pending";
				}
			}

			const isOverdue = scheduledTime < now.getTime() && status === "pending";

			schedule.push({
				supplement: {
					id: supplement.id,
					name: supplement.name,
					dosage: supplement.dosage,
					unit: supplement.unit,
					instructions: supplement.instructions,
					imageUrl: supplement.imageUrl,
				},
				scheduledTime,
				adherenceLog,
				status,
				isOverdue,
			});
		});
	});

	schedule.sort((a, b) => a.scheduledTime - b.scheduledTime);

	return schedule;
};

const generateMockDailyProgress = (date: Date): DailyProgress => {
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();

	if (isToday) {
		return {
			date: date.toISOString().split("T")[0] || "",
			totalScheduled: 9,
			takenOnTime: 7,
			takenLate: 0,
			missed: 0,
			skipped: 1,
			completionPercentage: 78,
		};
	}

	const dayIndex = date.getDay();
	const complianceRates = [85, 92, 78, 100, 88, 75, 90, 95, 82, 87, 91, 79, 96, 83, 89, 94, 81, 86, 93, 80, 97, 84, 90, 88, 92, 77, 85, 89, 95, 82];
	const rate = complianceRates[dayIndex % complianceRates.length];

	return {
		date: date.toISOString().split("T")[0] || "",
		totalScheduled: 10,
		takenOnTime: Math.floor((rate || 0) * 0.1),
		takenLate: Math.floor((rate || 0) * 0.02),
		missed: Math.floor((100 - (rate || 0)) * 0.03),
		skipped: Math.floor((100 - (rate || 0)) * 0.05),
		completionPercentage: rate || 0,
	};
};

export const mockDailyComplianceForToday = {
	id: "daily-compliance-today",
	userId: "mock-user-id-123",
	date: new Date(),
	adherencePercentage: 78,
	takenOnTime: 7,
	takenLate: 0,
	missed: 0,
	skipped: 1,
	totalScheduled: 9,
	dailyShieldOpeningBalance: 3,
	dailyShieldUsed: false,
};

const generateWeeklyCompliance = (): WeeklyCompliance[] => {
	const today = new Date();
	const weeklyData: WeeklyCompliance[] = [];
	const rates = [85, 92, 78, 100, 88, 75, 90];

	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		weeklyData.push({
			date: date.toISOString().split("T")[0] || "",
			adherencePercentage: rates[i] || 0,
		});
	}

	return weeklyData;
};

const generateMonthlyCompliance = (): MonthlyCompliance[] => {
	const today = new Date();
	const monthlyData: MonthlyCompliance[] = [];
	const rates = [85, 92, 78, 100, 88, 75, 90, 95, 82, 87, 91, 79, 96, 83, 89, 94, 81, 86, 93, 80, 97, 84, 90, 88, 92, 77, 85, 89, 95, 82, 80, 97, 84, 90, 88, 92, 77, 85, 89, 95, 82, 80, 97, 84, 90, 88, 92, 77, 85, 89, 95, 82];

	for (let i = 29; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		monthlyData.push({
			date: date.toISOString().split("T")[0] || "",
			adherencePercentage: rates[i] || 0,
		});
	}

	return monthlyData;
};

export const mockInsights: Insights = {
	userStats: mockUserStats,
	weeklyCompliance: generateWeeklyCompliance(),
	monthlyCompliance: generateMonthlyCompliance(),
	weeklyAvgCompliance: 87,
	monthlyAvgCompliance: 82,
	totalSupplements: 8,
	weeklyComplianceRate: 87,
	monthlyComplianceRate: 82,
	weeklyAdherenceBreakdown: {
		takenOnTime: 38,
		takenLate: 4,
		missed: 2,
		skipped: 2,
	},
	monthlyAdherenceBreakdown: {
		takenOnTime: 165,
		takenLate: 18,
		missed: 9,
		skipped: 12,
	},
	weeklySupplementCompliance: {
		"1": { supplementId: "1", name: "Vitamin D3", complianceRate: 100, adherenceBreakdown: { "Taken on-time": 7, "Taken late": 0 }, count: 7 },
		"2": { supplementId: "2", name: "Omega-3 Fish Oil", complianceRate: 95, adherenceBreakdown: { "Taken on-time": 13, "Taken late": 1 }, count: 14 },
		"3": { supplementId: "3", name: "Multivitamin", complianceRate: 92, adherenceBreakdown: { "Taken on-time": 7, "Taken late": 0 }, count: 7 },
		"4": { supplementId: "4", name: "Magnesium Glycinate", complianceRate: 88, adherenceBreakdown: { "Taken on-time": 6, "Taken late": 1 }, count: 7 },
		"5": { supplementId: "5", name: "Probiotics", complianceRate: 85, adherenceBreakdown: { "Taken on-time": 6, "Taken late": 0 }, count: 6 },
		"6": { supplementId: "6", name: "Vitamin C", complianceRate: 90, adherenceBreakdown: { "Taken on-time": 13, "Taken late": 1 }, count: 14 },
		"7": { supplementId: "7", name: "Zinc", complianceRate: 95, adherenceBreakdown: { "Taken on-time": 7, "Taken late": 0 }, count: 7 },
		"8": { supplementId: "8", name: "B-Complex", complianceRate: 88, adherenceBreakdown: { "Taken on-time": 6, "Taken late": 1 }, count: 7 },
	},
	monthlySupplementCompliance: {
		"1": { supplementId: "1", name: "Vitamin D3", complianceRate: 98, adherenceBreakdown: { "Taken on-time": 30, "Taken late": 0 }, count: 30 },
		"2": { supplementId: "2", name: "Omega-3 Fish Oil", complianceRate: 95, adherenceBreakdown: { "Taken on-time": 57, "Taken late": 3 }, count: 60 },
		"3": { supplementId: "3", name: "Multivitamin", complianceRate: 92, adherenceBreakdown: { "Taken on-time": 27, "Taken late": 3 }, count: 30 },
		"4": { supplementId: "4", name: "Magnesium Glycinate", complianceRate: 88, adherenceBreakdown: { "Taken on-time": 26, "Taken late": 4 }, count: 30 },
		"5": { supplementId: "5", name: "Probiotics", complianceRate: 85, adherenceBreakdown: { "Taken on-time": 25, "Taken late": 5 }, count: 30 },
		"6": { supplementId: "6", name: "Vitamin C", complianceRate: 90, adherenceBreakdown: { "Taken on-time": 54, "Taken late": 6 }, count: 60 },
		"7": { supplementId: "7", name: "Zinc", complianceRate: 95, adherenceBreakdown: { "Taken on-time": 29, "Taken late": 1 }, count: 30 },
		"8": { supplementId: "8", name: "B-Complex", complianceRate: 88, adherenceBreakdown: { "Taken on-time": 26, "Taken late": 4 }, count: 30 },
	},
};

export const getMockDailySchedule = (date: Date = new Date()): ScheduleItem[] => {
	return generateMockDailySchedule(date);
};

export const getMockDailyProgress = (date: Date = new Date()): DailyProgress => {
	return generateMockDailyProgress(date);
};

export const getMockInsights = (): Insights => {
	return mockInsights;
};
