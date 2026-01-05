import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Dialog, DialogActions, DialogContent } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { AccessTime } from "@connected-repo/ui-mui/icons/AccessTimeIcon";
import { Cancel } from "@connected-repo/ui-mui/icons/CancelIcon";
import { CheckCircle } from "@connected-repo/ui-mui/icons/CheckCircleIcon";
import { LocalFireDepartment } from "@connected-repo/ui-mui/icons/LocalFireDepartmentIcon";
import { Warning } from "@connected-repo/ui-mui/icons/WarningIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid";
import { alpha, Divider, IconButton, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useState } from "react";

const HomePage = () => {
    const queryClient = useQueryClient();
    const theme = useTheme();
    
    const userTimezoneOffset = useMemo(() => new Date().getTimezoneOffset(), []);

    const [selectedSupplement, setSelectedSupplement] = useState<{
        id: string;
        name: string;
        dosage: string;
        instructions: string[];
        scheduledTime: number;
    } | null>(null);

    const { data: schedule, isLoading: scheduleLoading, error: scheduleError } = useQuery(
        orpc.supplements.getDailySchedule.queryOptions({
            input: { userTimezoneOffset }
        }),
    );

    const { data: dailyProgress, isLoading: progressLoading, error: progressError } = useQuery(
        orpc.supplements.getDailyProgress.queryOptions({
            input: { userTimezoneOffset }
        }),
    );

    const { data: userStats, isLoading: streakLoading, error: streakError } = useQuery(
        orpc.userStats.getUserStats.queryOptions(),
    );

    const recordMutation = useMutation({
        ...orpc.supplements.recordAdherence.mutationOptions(),
        
        onMutate: async (newItem) => {
            const scheduleKey = orpc.supplements.getDailySchedule.queryOptions({ input: { userTimezoneOffset } }).queryKey;
            const progressKey = orpc.supplements.getDailyProgress.queryOptions({ input: { userTimezoneOffset } }).queryKey;
            
            await queryClient.cancelQueries({ queryKey: scheduleKey });
            await queryClient.cancelQueries({ queryKey: progressKey });

            const previousSchedule = queryClient.getQueryData(scheduleKey);
            const previousProgress = queryClient.getQueryData(progressKey);

            queryClient.setQueryData(scheduleKey, (old: any[] | undefined) => {
                if (!old) return [];
                return old.map(item => {
                    if (item.supplement.id === newItem.supplementId && item.scheduledTime === newItem.scheduledFor) {
                        return {
                            ...item,
                            status: newItem.status === "Taken on-time" ? "taken" : "skipped",
                            adherenceLog: { status: newItem.status, actualAt: Date.now() }
                        };
                    }
                    return item;
                });
            });

            queryClient.setQueryData(progressKey, (old: any | undefined) => {
                if (!old) return old;
                const isTaken = newItem.status === "Taken on-time";
                const isSkipped = newItem.status === "Skipped";
                const newStats = { ...old };
                if (isTaken) newStats.takenOnTime = (newStats.takenOnTime || 0) + 1;
                if (isSkipped) newStats.skipped = (newStats.skipped || 0) + 1;
                const completed = (newStats.takenOnTime || 0) + (newStats.takenLate || 0);
                newStats.completionPercentage = newStats.totalScheduled > 0 
                    ? Math.round((completed / newStats.totalScheduled) * 100) 
                    : 0;
                return newStats;
            });

            setSelectedSupplement(null);
            return { previousSchedule, previousProgress, scheduleKey, progressKey };
        },

        onError: (err, newItem, context) => {
            if (context?.previousSchedule) queryClient.setQueryData(context.scheduleKey, context.previousSchedule);
            if (context?.previousProgress) queryClient.setQueryData(context.progressKey, context.previousProgress);
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['supplements'] });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
        },
    });

    const handleCloseDialog = () => setSelectedSupplement(null);

    const handleTaken = () => {
        if (!selectedSupplement) return;
        recordMutation.mutate({
            supplementId: selectedSupplement.id,
            scheduledFor: selectedSupplement.scheduledTime,
            status: "Taken on-time",
            reason: null,
            userTimezoneOffset: userTimezoneOffset
        });
    };

    const handleSkip = () => {
        if (!selectedSupplement) return;
        recordMutation.mutate({
            supplementId: selectedSupplement.id,
            scheduledFor: selectedSupplement.scheduledTime,
            status: "Skipped",
            reason: null,
            userTimezoneOffset: userTimezoneOffset
        });
    };

    const handleSupplementClick = (supplementId: string, scheduledTime: number) => {
        if (!schedule) return;
        const supplement = schedule.find(
            (item) => item.supplement.id === supplementId && item.scheduledTime === scheduledTime,
        );
        if (supplement) {
            setSelectedSupplement({
                id: supplement.supplement.id,
                name: supplement.supplement.name,
                dosage: `${supplement.supplement.dosage} ${supplement.supplement.unit}`,
                instructions: supplement.supplement.instructions,
                scheduledTime: supplement.scheduledTime,
            });
        }
    };

    if (scheduleLoading || progressLoading || streakLoading) return <LoadingSpinner text="Loading..." />;
    if (scheduleError) return <Container maxWidth="lg" sx={{ py: 4 }}><ErrorAlert message={`Error: ${scheduleError.message}`} /></Container>;
    if (progressError) return <ErrorAlert message={progressError.message} />;
    if (streakError) return <ErrorAlert message={streakError.message} />;

    const completed = dailyProgress?.takenOnTime ? dailyProgress.takenOnTime + (dailyProgress.takenLate || 0) : 0;
    const totalScheduled = dailyProgress?.totalScheduled || 0;
    const remaining = totalScheduled - completed - (dailyProgress?.missed || 0) - (dailyProgress?.skipped || 0);

    const getStatusColor = (status: string): "success" | "error" | "default" | "info" => {
        switch (status) {
            case "taken": return "success";
            case "missed": return "error";
            case "skipped": return "default";
            case "pending": return "info";
            default: return "default";
        }
    };

    const formatTimeParts = (timestamp: number) => {
        const date = new Date(timestamp);
        return {
            time: format(date, "h:mm"),
            ampm: format(date, "a"),
            isOverdue: date < new Date()
        };
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3, px: 2, bgcolor: theme.palette.background.default }}>
            <Stack spacing={3}>

                {/* --- UNIFIED DASHBOARD CARD --- */}
                {dailyProgress && userStats && (
                    <Card sx={{ 
                        p: 0, 
                        bgcolor: 'background.paper',
                        borderRadius: 4, // consistent with your theme
                        boxShadow: 2, // Soft shadow, not glowing
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }}>
                        {/* HEADER: Title & Streak */}
                        <Box sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                {/* <Typography variant="h6" fontWeight={800} color="text.primary">
                                    Today's Progress
                                </Typography> */}
                                <Typography fontSize={25} color="text.primary" fontWeight={700}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </Typography>
                            </Box>
                        </Box>

                        {/* MIDDLE: Chart & Big Numbers */}
                        <Box sx={{ px: 3, pb: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                            
                            {/* 1. The Circular Chart */}
                            <Box sx={{ position: "relative", display: "inline-flex" }}>
                                {/* Background Track */}
                                <CircularProgress 
                                    variant="determinate" 
                                    value={100} 
                                    size={100} 
                                    thickness={5} 
                                    sx={{ color: theme.palette.grey[100], position: 'absolute' }} 
                                />
                                {/* Active Progress */}
                                <CircularProgress 
                                    variant="determinate" 
                                    value={dailyProgress.completionPercentage} 
                                    size={100} 
                                    thickness={5} 
                                    sx={{ 
                                        color: theme.palette.primary.main, 
                                        // Round caps for a polished look
                                        [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' } 
                                    }} 
                                />
                                {/* Center Text */}
                                <Box sx={{ 
                                    position: "absolute", 
                                    top: 0, left: 0, bottom: 0, right: 0, 
                                    display: "flex", 
                                    flexDirection: 'column',
                                    alignItems: "center", 
                                    justifyContent: "center" 
                                }}>
                                    <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1}>
                                        {Math.round(dailyProgress.completionPercentage)}%
                                    </Typography>
                                </Box>
                            </Box>

                            {/* 2. The Text Context */}
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Daily Goal
                                </Typography>
                                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                    <Typography variant="h4" fontWeight={800} color="text.primary">
                                        {completed}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" fontWeight={500}>
                                        / {totalScheduled}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Doses logged so far
                                </Typography>
                            </Box>
                        </Box>

                        {/* FOOTER: Clean Breakdown Grid */}
                        <Divider />
                        <Box sx={{ 
                            display: 'flex', 
                            bgcolor: alpha(theme.palette.background.default, 0.5) // Slightly off-white footer
                        }}>
                            {[
                                { label: 'Taken', val: dailyProgress.takenOnTime, color: theme.palette.success.main },
                                // { label: 'Late', val: dailyProgress.takenLate, color: theme.palette.warning.main },
                                // { label: 'Missed', val: dailyProgress.missed, color: theme.palette.error.main },
                                { label: 'Skipped', val: dailyProgress.skipped, color: theme.palette.text.disabled }
                            ].map((stat, i) => (
                                <Box key={i} sx={{ 
                                    flex: 1, 
                                    py: 2,
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    borderRight: i !== 3 ? '1px solid' : 'none',
                                    borderColor: 'divider'
                                }}>
                                    {/* Colored Dot */}
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stat.color, mb: 1 }} />
                                    
                                    <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                                        {stat.val}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                )}

                {/* --- SCHEDULE LIST --- */}
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem' }}>
                        <AccessTime color="primary" fontSize="small" /> Schedule
                    </Typography>

                    {schedule && schedule.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: 'background.paper', border: "1px dashed", borderColor: 'divider' }}>
                            <Typography variant="body2" color="text.secondary">No supplements today.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {schedule?.map((item) => {
                                const { time, ampm, isOverdue } = formatTimeParts(item.scheduledTime);
                                const isPending = item.status === 'pending';

                                return (
                                    <Card
                                        key={`${item.supplement.id}-${item.scheduledTime}`}
                                        onClick={() => isPending && handleSupplementClick(item.supplement.id, item.scheduledTime)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            border: "1px solid",
                                            borderColor: isPending ? 'divider' : 'transparent',
                                            bgcolor: 'background.paper',
                                            boxShadow: isPending ? "0 2px 8px rgba(0,0,0,0.04)" : "0 2px 8px rgba(0,0,0,0.1)",
                                            cursor: isPending ? "pointer" : "default",
                                            transition: "transform 0.2s ease",
                                            opacity: !isPending && item.status !== 'taken' ? 0.7 : 1,
                                            "&:active": isPending ? { transform: 'scale(0.98)' } : {}
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            
                                            {/* TIME COLUMN */}
                                            <Box sx={{ minWidth: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 0.5 }}>
                                                <Typography variant="body1" fontWeight={800} lineHeight={1} color={isOverdue && isPending ? 'error.main' : 'text.primary'}>
                                                    {time}
                                                </Typography>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                                    {ampm}
                                                </Typography>
                                                {isOverdue && isPending && (
                                                    <Box sx={{ mt: 0.5, px: 0.8, py: 0.2, bgcolor: 'error.lighter', color: 'error.main', borderRadius: 1, fontSize: '0.6rem', fontWeight: 700 }}>
                                                        LATE
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* VERTICAL DIVIDER BAR */}
                                            <Box sx={{ 
                                                width: 4, 
                                                height: 40, 
                                                borderRadius: 2, 
                                                bgcolor: item.status === 'taken' ? 'success.main' : 
                                                         item.status === 'skipped' ? 'text.disabled' : 
                                                         item.status === 'missed' ? 'error.main' : 'primary.light',
                                                opacity: isPending ? 0.3 : 1
                                            }} />

                                            {/* CONTENT */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.95rem' }}>
                                                    {item.supplement.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ 
                                                    fontSize: '0.8rem', 
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: 1.3,
                                                    mt: 0.5
                                                }}>
                                                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', mr: 0.5 }}>
                                                        {item.supplement.dosage} {item.supplement.unit}
                                                    </Box>
                                                    {item.supplement.instructions?.[0]}
                                                </Typography>
                                            </Box>

                                            {/* ACTION / STATUS ICON */}
                                            <Box sx={{ flexShrink: 0, ml: 1 }}>
                                                {isPending ? (
                                                    <IconButton size="small" sx={{ color: 'text.disabled' }}>
                                                        <CircleOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                                                    </IconButton>
                                                ) : (
                                                    <Chip 
                                                        label={item.status} 
                                                        size="small"
                                                        color={getStatusColor(item.status)}
                                                        icon={item.status === 'taken' ? <CheckCircleIcon /> : undefined}
                                                        sx={{ fontWeight: 700, textTransform: 'capitalize', height: 28, fontSize: '0.75rem' }}
                                                    />
                                                )}
                                            </Box>

                                        </Stack>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </Box>

                {/* --- MODAL (Unchanged) --- */}
                {selectedSupplement && (
                    <Dialog open={!!selectedSupplement} onClose={handleCloseDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, m: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pt: 1 }}>
                            <IconButton onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
                        </Box>
                        <DialogContent sx={{ pt: 0, pb: 3, textAlign: 'center' }}>
                            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.lighter', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                <MedicationLiquidIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h5" fontWeight={800}>{selectedSupplement.name}</Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                                {selectedSupplement.dosage}
                            </Typography>
                            
                            {selectedSupplement.instructions.length > 0 && (
                                <Box sx={{ textAlign: 'left', bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>Instructions</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedSupplement.instructions[0]}</Typography>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                             <Button onClick={handleTaken} fullWidth variant="contained" size="large" sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}>
                                Mark as Taken
                            </Button>
                            <Button onClick={handleSkip} fullWidth variant="text" color="inherit" sx={{ borderRadius: 3 }}>
                                Skip this dose
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Stack>
        </Container>
    );
};

export default HomePage;