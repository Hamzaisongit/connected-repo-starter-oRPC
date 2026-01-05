import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { alpha, Divider, Grid, LinearProgress, MenuItem, Select, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";
// Import your mock context
import { useMockData } from "@frontend/contexts/MockDataContext";

// --- 1. VISUALIZATION COMPONENTS ---

const CustomBarChart = ({ data, color }: { data: number[]; color: string }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, gap: 0.5, pt: 2, width: '100%' }}>
            {data.map((value, index) => (
                <Tooltip key={index} title={`${value}%`} placement="top">
                    <Box
                        sx={{
                            flex: 1,
                            bgcolor: alpha(color, 0.1),
                            borderRadius: 1,
                            position: 'relative',
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': { bgcolor: alpha(color, 0.2) }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: `${Math.max(value, 5)}%`,
                                bgcolor: value > 0 ? color : alpha(color, 0.3),
                                borderRadius: 1,
                                transition: 'height 0.5s ease-out'
                            }}
                        />
                    </Box>
                </Tooltip>
            ))}
        </Box>
    );
};

const SimpleDonutChart = ({
    data,
    size = 140
}: {
    data: { value: number; color: string; label: string }[];
    size?: number;
}) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    if (total === 0) {
        return (
            <Box sx={{ width: size, height: size, borderRadius: '50%', border: '4px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">No Data</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ position: 'relative', width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
                {data.map((item, index) => {
                    if (item.value === 0) return null;
                    const strokeDashoffset = circumference - ((item.value / total) * circumference);
                    const angle = currentAngle;
                    currentAngle += (item.value / total) * 360;

                    return (
                        <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="16"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                transformOrigin: 'center',
                                transform: `rotate(${angle * (Math.PI / 180) * (100 / 360)}deg)`,
                                transition: 'all 1s ease-out'
                            }}
                        />
                    );
                })}
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700}>
                    {total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    LOGS
                </Typography>
            </Box>
        </Box>
    );
};

// --- 2. SUPPLEMENT PERFORMANCE LIST ---

const SupplementPerformanceList = ({ data }: { data: any[] }) => {
    return (
        <Stack spacing={2} sx={{ mt: 1 }}>
            {data.map((supp) => (
                <Box key={supp.supplementId}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{supp.name}</Typography>
                        <Typography variant="caption" fontWeight={700} color={supp.complianceRate >= 80 ? 'success.main' : supp.complianceRate >= 50 ? 'warning.main' : 'error.main'}>
                            {supp.complianceRate}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={supp.complianceRate} 
                        sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: supp.complianceRate >= 80 ? 'success.main' : supp.complianceRate >= 50 ? 'warning.main' : 'error.main',
                                borderRadius: 4
                            }
                        }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {supp.count} logs recorded
                    </Typography>
                </Box>
            ))}
            {data.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No supplement data recorded for this period.
                </Typography>
            )}
        </Stack>
    );
};

// --- 3. REUSABLE PERIOD CARD (Week/Month) ---

const PeriodInsightsCard = ({ 
    title, 
    subTitle, 
    avgCompliance, 
    historyData, 
    breakdownData, 
    supplementData,
    chartColor 
}: { 
    title: string, 
    subTitle: string, 
    avgCompliance: number, 
    historyData: number[], 
    breakdownData: any[], 
    supplementData: any[],
    chartColor: string
}) => {
    const [viewMode, setViewMode] = useState<'split' | 'supplements'>('split');

    return (
        <Card sx={{ p: 3, borderRadius: 4, width: '100%', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }}>
            {/* Header + History Chart */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">{subTitle}</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha(chartColor, 0.1), borderRadius: 2, color: chartColor, fontWeight: 700, fontSize: '0.75rem' }}>
                    Avg: {avgCompliance}%
                </Box>
            </Box>
            
            <CustomBarChart data={historyData} color={chartColor} />
            
            <Divider sx={{ my: 3 }} />

            {/* Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700}>Detailed Analysis</Typography>
                <Select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as any)}
                    variant="standard"
                    disableUnderline
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: 'primary.main',
                        '& .MuiSelect-select': { py: 0.5, pr: '24px !important' } 
                    }}
                >
                    <MenuItem value="split">Adherence Split</MenuItem>
                    <MenuItem value="supplements">By Supplement</MenuItem>
                </Select>
            </Box>

            {/* Dynamic Content Body */}
            <Box sx={{ minHeight: 180 }}>
                {viewMode === 'split' ? (
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <SimpleDonutChart data={breakdownData} />
                        </Grid>
                        <Grid item xs={7}>
                            <Stack spacing={1.5}>
                                {breakdownData.map((item, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha(item.color, 0.1), display: 'flex', color: item.color }}>
                                                {item.icon}
                                            </Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                {item.label}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight={700}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                ) : (
                    <SupplementPerformanceList data={supplementData} />
                )}
            </Box>
        </Card>
    );
};

// --- 4. TOP SUMMARY STATS ---

const StatItem = ({ label, value, subLabel, color }: { label: string, value: string | number, subLabel?: string, color?: string }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: color || 'text.primary', my: 0.5 }}>
            {value}
        </Typography>
        {subLabel && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {subLabel}
            </Typography>
        )}
    </Box>
);

// --- MAIN PAGE COMPONENT ---

const InsightsPage = () => {
    const theme = useTheme();
    // Using Mock Data Hook as requested
    const { insights, dailyComplianceForToday } = useMockData();

    if (!insights) return <LoadingSpinner text="Loading insights..." />;

    const weeklyHistory = insights.weeklyCompliance.map((dc: any) => Number(dc.adherencePercentage) || 0);
    const monthlyHistory = insights.monthlyCompliance.map((dc: any) => Number(dc.adherencePercentage) || 0);

    const getBreakdownData = (breakdown: any) => [
        { label: 'On Time', value: breakdown.takenOnTime, color: '#10b981', icon: <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} /> },
        { label: 'Late', value: breakdown.takenLate, color: '#f59e0b', icon: <AccessTimeIcon fontSize="small" sx={{ color: '#f59e0b' }} /> },
        { label: 'Missed', value: breakdown.missed, color: '#ef4444', icon: <CancelIcon fontSize="small" sx={{ color: '#ef4444' }} /> },
        { label: 'Skipped', value: breakdown.skipped, color: '#6b7280', icon: <SkipNextIcon fontSize="small" sx={{ color: '#6b7280' }} /> },
    ];

    return (
        <Box sx={{ minHeight: "100vh", py: 3 }}>
            <Container maxWidth="md" disableGutters sx={{ px: 2 }}>
                <Stack spacing={3} sx={{ width: '100%' }}>

                    {/* Header */}
                    <Box>
                        <Typography variant="h5" fontWeight={800}>Health Insights</Typography>
                        <Typography variant="body2" color="text.secondary">Your performance overview</Typography>
                    </Box>

                    {/* Streak Shield Banner */}
                    <Box sx={{
                        width: "100%", borderRadius: 3, display: "flex", alignItems: "center",
                        bgcolor: alpha(theme.palette.success.light, 0.15),
                        py: 2, px: 3, mb: 1, gap: 2, border: "1px solid",
                        borderColor: alpha(theme.palette.success.main, 0.2)
                    }}>
                        <CheckCircleIcon fontSize="medium" sx={{ color: "success.main", mr: 1 }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Streak Shields: {dailyComplianceForToday?.dailyShieldOpeningBalance || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Used today: {dailyComplianceForToday?.dailyShieldUsed ? 1 : 0}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Summary Stats */}
                    <Card sx={{ p: 3, borderRadius: 4, width: '100%', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }}>
                        <Grid container justifyContent={'space-around'} alignItems='center'>
                            <Grid item xs={6} sm={3}>
                                <StatItem label="Weekly Score" value={`${insights.weeklyComplianceRate}%`} subLabel="Consistency" color="#3b82f6" />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <StatItem label="Streak" value={insights.userStats?.currentStreak ?? 0} subLabel={`Best: ${insights.userStats?.longestStreak ?? 0}`} color="#f59e0b" />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Weekly Insights Card */}
                    <PeriodInsightsCard 
                        title="Weekly Trend"
                        subTitle="Last 7 Days"
                        avgCompliance={insights.weeklyAvgCompliance}
                        historyData={weeklyHistory}
                        breakdownData={getBreakdownData(insights.weeklyAdherenceBreakdown)}
                        supplementData={Object.values(insights.weeklySupplementCompliance)}
                        chartColor="#3b82f6" // Blue
                    />

                    {/* Monthly Insights Card */}
                    <PeriodInsightsCard 
                        title="Monthly Overview"
                        subTitle="Last 30 Days"
                        avgCompliance={insights.monthlyAvgCompliance}
                        historyData={monthlyHistory}
                        breakdownData={getBreakdownData(insights.monthlyAdherenceBreakdown)}
                        supplementData={Object.values(insights.monthlySupplementCompliance)}
                        chartColor="#8b5cf6" // Violet
                    />

                </Stack>
            </Container>
        </Box>
    );
};

export default InsightsPage;