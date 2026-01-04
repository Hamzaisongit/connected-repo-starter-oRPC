import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Divider, useTheme, alpha } from "@mui/material";
import type { SupplementSchedule } from "@connected-repo/zod-schemas/user_adherence_log.zod";

interface SupplementScheduleCardProps {
    schedule: SupplementSchedule;
    onClick: (schedule: SupplementSchedule) => void;
    isNext?: boolean;
}

const getStatusStyles = (status: string, isOverdue: boolean, theme: any) => {
    if (status === "taken") {
        return { 
            color: theme.palette.success.main, 
            bg: alpha(theme.palette.success.main, 0.1),
            border: alpha(theme.palette.success.main, 0.2),
            label: "Taken",
            icon: <CheckCircleIcon fontSize="small" />
        };
    }
    if (status === "skipped") {
        return { 
            color: theme.palette.text.secondary, 
            bg: alpha(theme.palette.action.disabled, 0.1),
            border: theme.palette.divider,
            label: "Skipped",
            icon: <ErrorIcon fontSize="small" />
        };
    }
    if (status === "missed") {
        return { 
            color: theme.palette.error.main, 
            bg: alpha(theme.palette.error.main, 0.1),
            border: alpha(theme.palette.error.main, 0.2),
            label: "Missed",
            icon: <ErrorIcon fontSize="small" />
        };
    }
    if (isOverdue) {
        return { 
            color: theme.palette.warning.main, 
            bg: alpha(theme.palette.warning.main, 0.1),
            border: alpha(theme.palette.warning.main, 0.5),
            label: "Overdue",
            icon: <ErrorIcon fontSize="small" />
        };
    }
    // Pending / Default
    return { 
        color: theme.palette.primary.main, 
        bg: alpha(theme.palette.primary.main, 0.08),
        border: alpha(theme.palette.primary.main, 0.3),
        label: "Pending",
        icon: <RadioButtonUncheckedIcon fontSize="small" />
    };
};

export const SupplementScheduleCard = ({
    schedule,
    onClick,
    isNext = false,
}: SupplementScheduleCardProps) => {
    const theme = useTheme();
    const { supplement, scheduledTime, status, isOverdue } = schedule;
    const canInteract = status === "pending" || status === "missed";
    
    const styles = getStatusStyles(status, isOverdue, theme);
    
    // Split time into HH:MM and AM/PM for vertical stacking
    const date = new Date(scheduledTime);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const [time, period] = timeString.split(' ');

    return (
        <Card
            onClick={canInteract ? () => onClick(schedule) : undefined}
            sx={{
                p: 0, // Reset padding for custom layout
                borderRadius: 4,
                border: "1px solid",
                borderColor: isNext ? "primary.main" : "divider",
                boxShadow: isNext ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}` : "none",
                transition: "all 0.2s ease-in-out",
                cursor: canInteract ? "pointer" : "default",
                position: 'relative',
                bgcolor: 'background.paper',
                "&:hover": canInteract ? {
                    borderColor: styles.color,
                    transform: "translateY(-2px)",
                    boxShadow: 3
                } : {},
            }}
        >
            {/* "Up Next" Floating Label */}
            {isNext && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        px: 1.5,
                        py: 0.25,
                        borderBottomLeftRadius: 8,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase'
                    }}
                >
                    Up Next
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'stretch', height: 80 }}>
                {/* 1. Time Column (Left) */}
                <Box sx={{ 
                    width: 80, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: isNext ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    borderRight: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6" fontWeight={700} lineHeight={1} color="text.primary">
                        {time}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mt: 0.5 }}>
                        {period}
                    </Typography>
                </Box>

                {/* 2. Content Column (Middle) */}
                <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                            {supplement.name}
                        </Typography>
                        {isOverdue && status === 'pending' && (
                            <Chip 
                                label="Late" 
                                size="small" 
                                color="warning" 
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
                            />
                        )}
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {supplement.dosage} {supplement.unit}
                        {supplement.instructions?.length > 0 && (
                             <span style={{ opacity: 0.5 }}>• {supplement.instructions[0]}</span>
                        )}
                    </Typography>
                </Box>

                {/* 3. Action Column (Right) */}
                <Box sx={{ pr: 2, display: 'flex', alignItems: 'center' }}>
                    {canInteract ? (
                        <Box
                            sx={{
                                height: 36,
                                pl: 1.5,
                                pr: 1,
                                borderRadius: 10,
                                bgcolor: styles.bg,
                                color: styles.color,
                                border: '1px solid',
                                borderColor: styles.border,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                transition: 'all 0.2s',
                            }}
                        >
                            <Typography variant="caption" fontWeight={700}>
                                {status === 'missed' ? 'Log' : 'Take'}
                            </Typography>
                            <ChevronRightIcon fontSize="small" />
                        </Box>
                    ) : (
                        // If already taken/skipped, just show the icon status
                        <Stack alignItems="center" spacing={0.5}>
                            <Box sx={{ color: styles.color }}>{styles.icon}</Box>
                            <Typography variant="caption" fontWeight={600} color={styles.color}>
                                {styles.label}
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </Box>
        </Card>
    );
};