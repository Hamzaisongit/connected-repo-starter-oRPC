import {
    type DailyProgress,
    getMockInsights,
    type Insights,
    type MockSupplement,
    type MockUser,
    mockSupplements,
    mockUser,
    mockUserStats,
    type ScheduleItem,
    type UserStats,
} from "@frontend/utils/mockData";
import type React from "react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react"

interface MockDataContextValue {
    user: MockUser;
    supplements: MockSupplement[];
    dailySchedule: ScheduleItem[];
    dailyProgress: DailyProgress;
    userStats: UserStats;
    insights: Insights;
    dailyComplianceForToday?: any;
    addSupplement: (supplement: Omit<MockSupplement, "id" | "createdAt">) => void;
    updateSupplement: (id: string, supplement: Partial<MockSupplement>) => void;
    deleteSupplement: (id: string) => void;
    toggleSupplementActive: (id: string, isActive: boolean) => void;
    markAdherence: (supplementId: string, scheduledFor: number, status: "Taken on-time" | "Taken late" | "Missed" | "Skipped") => void;
    refreshDailySchedule: () => void;
    refreshDailyProgress: () => void;
}

const MockDataContext = createContext<MockDataContextValue | null>(null);

// --- Helper: Generate Toned-Down Random Data ---
const generateRandomizedData = (supplements: MockSupplement[]) => {
    // 1. LIMIT: Only take the first 4 supplements
    const limitedSupplements = supplements.slice(0, 4); 
    const scheduleItems: ScheduleItem[] = [];
    
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const startMs = todayStart.getTime();

    // Generate Schedule Items
    limitedSupplements.forEach(supp => {
        // Simple schedule: 1 time per supplement for cleaner UI
        const times = ["09:00"]; 

        times.forEach(timeStr => {
            const [h, m] = timeStr.split(':').map(Number);
            const scheduledTime = startMs + (h * 3600000) + (m * 60000);

            // 2. STATUS LOGIC: No "Missed". Mostly Pending.
            const rand = Math.random();
            let status: "pending" | "taken" | "skipped" = "pending";
            let log: any ;

            if (rand > 0.6) { // 40% chance it's already interacted with
                if (rand > 0.9) status = "skipped"; // 10% Skipped
                else status = "taken"; // 30% Taken

                log = {
                    id: `log-${Math.random()}`,
                    status: status === 'taken' ? "Taken on-time" : "Skipped",
                    actualAt: new Date().toISOString()
                };
            }

            scheduleItems.push({
                supplement: supp,
                scheduledTime,
                status,
                adherenceLog: log
            });
        });
    });

    scheduleItems.sort((a,b) => a.scheduledTime - b.scheduledTime);

    // Calculate Progress
    const totalScheduled = scheduleItems.length;
    const taken = scheduleItems.filter(i => i.status === 'taken').length;
    const skipped = scheduleItems.filter(i => i.status === 'skipped').length;
    
    const completionPercentage = totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0;

    const progress: DailyProgress = {
        date: new Date().toISOString().split('T')[0],
        totalScheduled,
        takenOnTime: taken,
        takenLate: 0,
        missed: 0, // No missed items
        skipped,
        completionPercentage
    };

    return { scheduleItems, progress, limitedSupplements };
};

// --- Helper: Reduce Insights Volume ---
const reduceInsightsData = (original: Insights): Insights => {
    // Helper to lower the count in breakdown objects
    const lowerBreakdown = (bd: any) => ({
        takenOnTime: Math.floor(bd.takenOnTime * 0.4), // Reduce to 40% of original
        takenLate: Math.floor(bd.takenLate * 0.2),
        missed: Math.floor(bd.missed * 0.3),
        skipped: Math.floor(bd.skipped * 0.2),
    });

    return {
        ...original,
        // Keep percentages realistic, just reduce raw counts if they are used elsewhere
        weeklyAdherenceBreakdown: lowerBreakdown(original.weeklyAdherenceBreakdown),
        monthlyAdherenceBreakdown: lowerBreakdown(original.monthlyAdherenceBreakdown),
        
        // Simulating "Less Logs" in history arrays by making them slightly more sparse or lower values
        weeklyCompliance: original.weeklyCompliance.map(d => ({
            ...d,
            // Vary the percentage slightly to look natural but keep data
            adherencePercentage: d.adherencePercentage
        })),
        monthlyCompliance: original.monthlyCompliance.map(d => ({
            ...d,
            adherencePercentage: d.adherencePercentage
        }))
    };
};


export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state with randomized, limited data
    const initialData = useMemo(() => generateRandomizedData(mockSupplements), []);

    const [supplements, setSupplements] = useState<MockSupplement[]>(initialData.limitedSupplements);
    const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>(initialData.scheduleItems);
    const [dailyProgress, setDailyProgress] = useState<DailyProgress>(initialData.progress);
    const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
    
    // 3. INSIGHTS: Apply reduction
    const [insights] = useState<Insights>(() => reduceInsightsData(getMockInsights()));

    const addSupplement = useCallback((supplement: Omit<MockSupplement, "id" | "createdAt">) => {
        const newSupplement: MockSupplement = {
            ...supplement,
            id: `supp-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setSupplements((prev) => [...prev, newSupplement]);
        const newData = generateRandomizedData([...supplements, newSupplement]);
        setDailySchedule(newData.scheduleItems);
        setDailyProgress(newData.progress);
    }, [supplements]);

    const updateSupplement = useCallback((id: string, supplement: Partial<MockSupplement>) => {
        const updatedSupps = supplements.map((s) => (s.id === id ? { ...s, ...supplement } : s));
        setSupplements(updatedSupps);
        const newData = generateRandomizedData(updatedSupps);
        setDailySchedule(newData.scheduleItems);
        setDailyProgress(newData.progress);
    }, [supplements]);

    const deleteSupplement = useCallback((id: string) => {
        const filtered = supplements.filter((s) => s.id !== id);
        setSupplements(filtered);
        const newData = generateRandomizedData(filtered);
        setDailySchedule(newData.scheduleItems);
        setDailyProgress(newData.progress);
    }, [supplements]);

    const toggleSupplementActive = useCallback((id: string, isActive: boolean) => {
        const updated = supplements.map((s) => (s.id === id ? { ...s, isActive } : s));
        setSupplements(updated);
        const newData = generateRandomizedData(updated);
        setDailySchedule(newData.scheduleItems);
        setDailyProgress(newData.progress);
    }, [supplements]);

    const markAdherence = useCallback((supplementId: string, scheduledFor: number, status: "Taken on-time" | "Taken late" | "Missed" | "Skipped") => {
        setDailySchedule((prev) =>
            prev.map((item) => {
                if (item.supplement.id === supplementId && item.scheduledTime === scheduledFor) {
                    // Map "Missed" to "Skipped" in UI just in case, or keep strict types
                    const newStatus: "taken" | "skipped" | "pending" =
                        status === "Taken on-time" || status === "Taken late" ? "taken" : "skipped";
                    
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
            const isSkipped = status === "Skipped" || status === "Missed"; // Treat missed as skipped for counts
            
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
        const newData = generateRandomizedData(supplements);
        setDailySchedule(newData.scheduleItems);
    }, [supplements]);

    const refreshDailyProgress = useCallback(() => {
        // handled in refreshDailySchedule
    }, []);

    const value: MockDataContextValue = {
        user: mockUser,
        supplements,
        dailySchedule,
        dailyProgress,
        userStats,
        insights,
        dailyComplianceForToday: { 
            dailyShieldOpeningBalance: 3, 
            dailyShieldUsed: false 
        }, 
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