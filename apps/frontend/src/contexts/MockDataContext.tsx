import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
	MockSupplement,
	MockUser,
	ScheduleItem,
	DailyProgress,
	UserStats,
	Insights,
	getMockDailySchedule,
	getMockDailyProgress,
	getMockInsights,
	mockUser,
	mockSupplements,
	mockUserStats,
	mockDailyComplianceForToday,
} from "@frontend/utils/mockData";

interface MockDataContextValue {
	user: MockUser;
	supplements: MockSupplement[];
	dailySchedule: ScheduleItem[];
	dailyProgress: DailyProgress;
	userStats: UserStats;
	insights: Insights;
	addSupplement: (supplement: Omit<MockSupplement, "id" | "createdAt">) => void;
	updateSupplement: (id: string, supplement: Partial<MockSupplement>) => void;
	deleteSupplement: (id: string) => void;
	toggleSupplementActive: (id: string, isActive: boolean) => void;
	markAdherence: (supplementId: string, scheduledFor: number, status: "Taken on-time" | "Taken late" | "Missed" | "Skipped") => void;
	refreshDailySchedule: () => void;
	refreshDailyProgress: () => void;
}

const MockDataContext = createContext<MockDataContextValue | null>(null);

export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [supplements, setSupplements] = useState<MockSupplement[]>(mockSupplements);
	const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>(getMockDailySchedule());
	const [dailyProgress, setDailyProgress] = useState<DailyProgress>(getMockDailyProgress());
	const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
	const [insights] = useState<Insights>(getMockInsights());

	const addSupplement = useCallback((supplement: Omit<MockSupplement, "id" | "createdAt">) => {
		const newSupplement: MockSupplement = {
			...supplement,
			id: `supp-${Date.now()}`,
			createdAt: new Date().toISOString(),
		};
		setSupplements((prev) => [...prev, newSupplement]);
		refreshDailySchedule();
		refreshDailyProgress();
	}, []);

	const updateSupplement = useCallback((id: string, supplement: Partial<MockSupplement>) => {
		setSupplements((prev) => prev.map((s) => (s.id === id ? { ...s, ...supplement } : s)));
		refreshDailySchedule();
		refreshDailyProgress();
	}, []);

	const deleteSupplement = useCallback((id: string) => {
		setSupplements((prev) => prev.filter((s) => s.id !== id));
		refreshDailySchedule();
		refreshDailyProgress();
	}, []);

	const toggleSupplementActive = useCallback((id: string, isActive: boolean) => {
		setSupplements((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
		refreshDailySchedule();
		refreshDailyProgress();
	}, []);

	const markAdherence = useCallback((supplementId: string, scheduledFor: number, status: "Taken on-time" | "Taken late" | "Missed" | "Skipped") => {
		setDailySchedule((prev) =>
			prev.map((item) => {
				if (item.supplement.id === supplementId && item.scheduledTime === scheduledFor) {
					const newStatus: "taken" | "missed" | "skipped" | "pending" =
						status === "Taken on-time" || status === "Taken late" ? "taken" : status === "Missed" ? "missed" : "skipped";
					return {
						...item,
						status: newStatus,
						adherenceLog: {
							id: `log-${supplementId}-${scheduledFor}`,
							status,
							actualAt: new Date().toISOString(),
						},
					};
				}
				return item;
			}),
		);

		setDailyProgress((prev) => {
			const isTaken = status === "Taken on-time" || status === "Taken late";
			const isSkipped = status === "Skipped";
			const newStats = { ...prev };
			if (isTaken) newStats.takenOnTime = (newStats.takenOnTime || 0) + 1;
			if (isSkipped) newStats.skipped = (newStats.skipped || 0) + 1;
			const completed = (newStats.takenOnTime || 0) + (newStats.takenLate || 0);
			newStats.completionPercentage = newStats.totalScheduled > 0
				? Math.round((completed / newStats.totalScheduled) * 100)
				: 0;
			return newStats;
		});

		setUserStats((prev) => ({
			...prev,
			currentStreak: status === "Taken on-time" || status === "Taken late" ? prev.currentStreak + 1 : prev.currentStreak,
		}));
	}, []);

	const refreshDailySchedule = useCallback(() => {
		setDailySchedule(getMockDailySchedule());
	}, []);

	const refreshDailyProgress = useCallback(() => {
		setDailyProgress(getMockDailyProgress());
	}, []);

	const value: MockDataContextValue = {
		user: mockUser,
		supplements,
		dailySchedule,
		dailyProgress,
		userStats,
		insights,
		addSupplement,
		updateSupplement,
		deleteSupplement,
		toggleSupplementActive,
		markAdherence,
		refreshDailySchedule,
		refreshDailyProgress,
	};

	return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
};

export const useMockData = (): MockDataContextValue => {
	const context = useContext(MockDataContext);
	if (!context) {
		throw new Error("useMockData must be used within MockDataProvider");
	}
	return context;
};
