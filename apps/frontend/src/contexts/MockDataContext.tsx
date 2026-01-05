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
    const nowMs = Date.now();

    // Generate Schedule Items
    limitedSupplements.forEach(supp => {
        // Randomly assign 1 or 2 times
        const timesCount = Math.random() > 0.7 ? 2 : 1;
        const times: string[] = [];
        
        if (timesCount === 1) {
            // Pick a random morning time between 07:00 and 10:00
            const hour = 7 + Math.floor(Math.random() * 4);
            times.push(`${hour.toString().padStart(2, '0')}:00`);
        } else {
            // Morning + Evening
            const h1 = 7 + Math.floor(Math.random() * 3); // 7-9 AM
            const h2 = 18 + Math.floor(Math.random() * 4); // 6-9 PM
            times.push(`${h1.toString().padStart(2, '0')}:00`);
            times.push(`${h2.toString().padStart(2, '0')}:00`);
        }

        times.forEach(timeStr => {
            const parts = timeStr.split(':');
            const h = Number(parts[0] ?? 0);
            const m = Number(parts[1] ?? 0);
            
            const scheduledTime = startMs + (h * 3600000) + (m * 60000);

            // 2. STATUS LOGIC: 50% Pending, 40% Taken, 10% Skipped
            const rand = Math.random();
            let status: "pending" | "taken" | "skipped" = "pending";
            let log: any ;

            if (rand > 0.5) { 
                if (rand > 0.9) status = "skipped"; 
                else status = "taken"; 

                log = {
                    id: `log-${Math.random()}`,
                    status: status === 'taken' ? "Taken on-time" : "Skipped",
                    actualAt: new Date().toISOString()
                };
            }

            // FIX: Calculate isOverdue
            const isOverdue = scheduledTime < nowMs && status === "pending";

            scheduleItems.push({
                supplement: {
                    ...supp,
                    imageUrl: supp.imageUrl ?? null
                },
                scheduledTime,
                status,
                adherenceLog: log,
                isOverdue: isOverdue // FIX: Added required property
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
        date: new Date().toISOString().split('T')[0] || new Date().toISOString(),
        totalScheduled,
        takenOnTime: taken,
        takenLate: 0,
        missed: 0, // No missed items
        skipped,
        completionPercentage
    };

    return { scheduleItems, progress, limitedSupplements };
};

// --- Helper: Diverse Insights Volume ---
const reduceInsightsData = (original: Insights): Insights => {
    // Generate a random multiplier between 0.5 and 0.9
    const getMultiplier = () => 0.5 + (Math.random() * 0.4);

    const lowerBreakdown = (bd: any) => ({
        takenOnTime: Math.floor(bd.takenOnTime * getMultiplier()),
        takenLate: Math.floor(bd.takenLate * getMultiplier() * 0.5), 
        missed: Math.floor(bd.missed * getMultiplier() * 0.4), 
        skipped: Math.floor(bd.skipped * getMultiplier() * 0.3), 
    });

    return {
        ...original,
        weeklyAdherenceBreakdown: lowerBreakdown(original.weeklyAdherenceBreakdown),
        monthlyAdherenceBreakdown: lowerBreakdown(original.monthlyAdherenceBreakdown),
        
        weeklyCompliance: original.weeklyCompliance.map(d => ({
            ...d,
            adherencePercentage: Math.floor(40 + Math.random() * 60)
        })),
        monthlyCompliance: original.monthlyCompliance.map(d => ({
            ...d,
            adherencePercentage: Math.floor(50 + Math.random() * 45)
        }))
    };
};


export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialData = useMemo(() => generateRandomizedData(mockSupplements), []);

    const [supplements, setSupplements] = useState<MockSupplement[]>(initialData.limitedSupplements);
    const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>(initialData.scheduleItems);
    const [dailyProgress, setDailyProgress] = useState<DailyProgress>(initialData.progress);
    const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
    
    const [insights] = useState<Insights>(() => reduceInsightsData(getMockInsights()));

    const addSupplement = useCallback((supplement: Omit<MockSupplement, "id" | "createdAt">) => {
        const newSupplement: MockSupplement = {
            ...supplement,
            id: `supp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            imageUrl: supplement.imageUrl ?? null
        };
        setSupplements((prev) => [...prev, newSupplement]);
        const newData = generateRandomizedData([...supplements, newSupplement]);
        setDailySchedule(newData.scheduleItems);
        setDailyProgress(newData.progress);
    }, [supplements]);

    const updateSupplement = useCallback((id: string, supplement: Partial<MockSupplement>) => {
        setSupplements((prev) => {
            const updatedSupps = prev.map((s) => (s.id === id ? { ...s, ...supplement } : s));
            const newData = generateRandomizedData(updatedSupps);
            setTimeout(() => {
                setDailySchedule(newData.scheduleItems);
                setDailyProgress(newData.progress);
            }, 0);
            return updatedSupps;
        });
    }, []);

    const deleteSupplement = useCallback((id: string) => {
        setSupplements((prev) => {
            const filtered = prev.filter((s) => s.id !== id);
            const newData = generateRandomizedData(filtered);
            setTimeout(() => {
                setDailySchedule(newData.scheduleItems);
                setDailyProgress(newData.progress);
            }, 0);
            return filtered;
        });
    }, []);

    const toggleSupplementActive = useCallback((id: string, isActive: boolean) => {
        setSupplements((prev) => {
            const updated = prev.map((s) => (s.id === id ? { ...s, isActive } : s));
            const newData = generateRandomizedData(updated);
            setTimeout(() => {
                setDailySchedule(newData.scheduleItems);
                setDailyProgress(newData.progress);
            }, 0);
            return updated;
        });
    }, []);

    const markAdherence = useCallback((supplementId: string, scheduledFor: number, status: "Taken on-time" | "Taken late" | "Missed" | "Skipped") => {
        setDailySchedule((prev) =>
            prev.map((item) => {
                if (item.supplement.id === supplementId && item.scheduledTime === scheduledFor) {
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
            const isSkipped = status === "Skipped" || status === "Missed";
            
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
        // Handled via refreshDailySchedule
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