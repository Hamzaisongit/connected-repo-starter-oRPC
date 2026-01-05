import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";
import { useMockData } from "@frontend/contexts/MockDataContext";
import { zodResolver } from "@hookform/resolvers/zod";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import MedicationIcon from "@mui/icons-material/Medication";
import OpacityIcon from "@mui/icons-material/Opacity";
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import {
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    Fab,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    TextField,
    TextFieldProps,
    Tooltip,
    Zoom,
    useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const supplementSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    dosage: z.number().min(0, "Dosage must be positive"),
    unit: z.string().min(1, "Unit is required").max(50),
    instructions: z.array(z.string().min(1).max(200)).min(1, "At least one instruction required"),
    days: z.array(z.enum(DAYS_OF_WEEK_ENUM)).min(1, "At least one day required"),
    timesOfDay: z.array(z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")).min(1, "At least one time required"),
    isActive: z.boolean(),
});

type SupplementFormData = z.infer<typeof supplementSchema>;

interface SupplementWithId extends SupplementFormData {
    id: string;
    imageUrl?: string | null;
    createdAt?: string;
}

const DAYS_OF_WEEK: (typeof DAYS_OF_WEEK_ENUM[number])[] = [...DAYS_OF_WEEK_ENUM];

const StyledTextField = (props: TextFieldProps) => {
    return (
        <TextField
            {...props}
            variant="outlined"
            size="medium"
            sx={{
                ...props.sx,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '& fieldset': {
                        borderWidth: '2px',
                        borderColor: (theme) => alpha(theme.palette.text.disabled, 0.2),
                    },
                    '&:hover fieldset': {
                        borderColor: 'primary.light',
                        borderWidth: '2px',
                    },
                    '&.Mui-focused': {
                        backgroundColor: 'background.paper',
                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                        '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                        },
                    },
                    '& input': {
                        fontWeight: 600,
                    }
                },
                '& .MuiInputLabel-root': {
                    fontWeight: 500,
                }
            }}
        />
    );
};

const DayToggle = ({ day, selected, onClick }: { day: string; selected: boolean; onClick: () => void }) => {
    return (
        <Box
            onClick={onClick}
            sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "0.85rem",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                bgcolor: selected ? "primary.main" : "transparent",
                color: selected ? "primary.contrastText" : "text.secondary",
                border: "2px solid",
                borderColor: selected ? "primary.main" : "divider",
                "&:hover": {
                    bgcolor: selected ? "primary.dark" : "action.hover",
                    transform: 'scale(1.05)'
                }
            }}
        >
            {day.charAt(0)}
        </Box>
    );
};

const EmptyState = ({ message, subMessage }: { message: string; subMessage: string }) => (
    <Box sx={{
        py: 10,
        textAlign: "center",
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider'
    }}>
        <MedicationIcon sx={{ fontSize: 64, color: "primary.light", mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="primary.main" gutterBottom>
            {message}
        </Typography>
        <Typography variant="body2" color="secondary.main">
            {subMessage}
        </Typography>
    </Box>
);

const ProfilePage = () => {
    const [tabValue, setTabValue] = useState("active");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingSupplement, setEditingSupplement] = useState<SupplementWithId | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const {
        handleSubmit,
        reset,
        control,
        formState: { errors },
        watch,
        setValue,
        getValues
    } = useForm<SupplementFormData>({
        resolver: zodResolver(supplementSchema),
        defaultValues: {
            name: "",
            dosage: 1,
            unit: "tablet",
            instructions: ["Take with food"],
            days: [DAYS_OF_WEEK[1], DAYS_OF_WEEK[2], DAYS_OF_WEEK[3], DAYS_OF_WEEK[4], DAYS_OF_WEEK[5]],
            timesOfDay: ["08:00"],
            isActive: true,
        },
    });

    const currentDays = watch("days");
    const currentTimes = watch("timesOfDay");
    const currentInstructions = watch("instructions");

    const { supplements, addSupplement, updateSupplement, toggleSupplementActive } = useMockData();

    const handleOpenDrawer = (supplement: SupplementWithId | null = null) => {
        setEditingSupplement(supplement);
        if (supplement) {
            reset({
                name: supplement.name,
                dosage: supplement.dosage,
                unit: supplement.unit,
                instructions: supplement.instructions,
                days: supplement.days || [DAYS_OF_WEEK[1], DAYS_OF_WEEK[2], DAYS_OF_WEEK[3], DAYS_OF_WEEK[4], DAYS_OF_WEEK[5]],
                timesOfDay: supplement.timesOfDay || ["08:00"],
                isActive: supplement.isActive !== undefined ? supplement.isActive : true,
            });
        } else {
            reset({
                name: "",
                dosage: 1,
                unit: "tablet",
                instructions: ["Take with food"],
                days: [DAYS_OF_WEEK[1], DAYS_OF_WEEK[2], DAYS_OF_WEEK[3], DAYS_OF_WEEK[4], DAYS_OF_WEEK[5]],
                timesOfDay: ["08:00"],
                isActive: true,
            });
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setTimeout(() => {
            setEditingSupplement(null);
            reset();
        }, 300);
    };

    const onSubmit = async (data: SupplementFormData) => {
        setIsLoading(true);
        try {
            if (editingSupplement) {
                updateSupplement(editingSupplement.id, {
                    ...data,
                    imageUrl: editingSupplement.imageUrl,
                    createdAt: editingSupplement.createdAt
                });
            } else {
                addSupplement({
                    ...data,
                    imageUrl: null,
                    createdAt: new Date().toISOString()
                });
            }
            handleCloseDrawer();
        } catch (error) {
            console.error("[Profile] Error saving supplement:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (supplement: SupplementWithId) => {
        toggleSupplementActive(supplement.id, !supplement.isActive);
    };

    const toggleDay = (day: typeof DAYS_OF_WEEK[number]) => {
        const current = getValues("days");
        const newDays = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day];
        setValue("days", newDays, { shouldValidate: true });
    };

    const addTime = () => setValue("timesOfDay", [...getValues("timesOfDay"), "09:00"]);
    const removeTime = (idx: number) => setValue("timesOfDay", getValues("timesOfDay").filter((_, i) => i !== idx));

    const addInstruction = () => setValue("instructions", [...getValues("instructions"), ""]);
    const removeInstruction = (idx: number) => setValue("instructions", getValues("instructions").filter((_, i) => i !== idx));

    const activeSupplements = supplements.filter((s) => s.isActive);
    const inactiveSupplements = supplements.filter((s) => !s.isActive);

    const SupplementCard = ({ supplement, showActions = true }: { supplement: SupplementWithId; showActions?: boolean }) => (
        <Card
            sx={{
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                borderRadius: 4,
                overflow: 'visible',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 3,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                    borderColor: 'primary.light',
                },
            }}
        >
            <Box sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        <Box sx={{
                            width: 48, height: 48,
                            borderRadius: 3,
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <MedicationIcon color="inherit" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                                {supplement.name}
                            </Typography>
                            <Chip
                                size="small"
                                label={`${supplement.dosage} ${supplement.unit}`}
                                sx={{ mt: 0.5, fontWeight: 600, bgcolor: "secondary.light", color: "secondary.contrastText", borderRadius: 1 }}
                            />
                        </Box>
                    </Box>
                    {showActions && (
                        <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenDrawer(supplement)}>
                                    <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: "center" }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "primary.light" }} />
                        <Typography variant="body2" fontWeight={500} color="primary.main">
                            {(supplement.timesOfDay || []).join(", ")}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Schedule
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {DAYS_OF_WEEK.map((day) => (
                                <Box
                                    key={day}
                                    sx={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.65rem', fontWeight: 700,
                                        bgcolor: supplement.days && supplement.days.includes(day) ? 'primary.main' : 'background.default',
                                        color: supplement.days && supplement.days.includes(day) ? 'primary.contrastText' : 'text.disabled',
                                        border: '1px solid',
                                        borderColor: supplement.days && supplement.days.includes(day) ? 'primary.main' : 'divider'
                                    }}
                                >
                                    {day.charAt(0)}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Stack>
            </Box>
            {!showActions && (
                <Box sx={{
                    px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider',
                    bgcolor: "background.default",
                    borderRadius: 4
                }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color={supplement.isActive ? "success.main" : "text.secondary"}>{supplement.isActive ? "Active" : "Currently Inactive"}</Typography>
                        <Switch size="small" checked={supplement.isActive} onChange={() => handleToggleActive(supplement)} color="primary" />
                    </Stack>
                </Box>
            )}
        </Card>
    );

    const SupplementFormContent = () => (
        <Box sx={{ p: 0 }}>
            <Stack spacing={4} sx={{ p: 1 }}>
                <Box>
                    <Stack direction="row" alignItems="center" gap={2} mb={3}>
                        <Box sx={{
                            p: 1.2,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <LocalPharmacyIcon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                            The Basics
                        </Typography>
                    </Stack>

                    <Stack spacing={2.5}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <StyledTextField
                                    {...field}
                                    label="Supplement Name"
                                    placeholder="e.g. Vitamin D3"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: { xs: '1 0 100%', md: '0 0 50%' } }}>
                                <Controller
                                    name="dosage"
                                    control={control}
                                    render={({ field }) => (
                                        <StyledTextField
                                            {...field}
                                            label="Dosage"
                                            placeholder="0"
                                            type="number"
                                            fullWidth
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            InputProps={{
                                                endAdornment: <OpacityIcon fontSize="small" sx={{ color: 'action.active', opacity: 0.5 }} />
                                            }}
                                            error={!!errors.dosage}
                                            helperText={errors.dosage?.message}
                                        />
                                    )}
                                />
                            </Box>
                            <Box sx={{ flex: { xs: '1 0 100%', md: '0 0 50%' } }}>
                                <Controller
                                    name="unit"
                                    control={control}
                                    render={({ field }) => (
                                        <StyledTextField {...field} select label="Unit" fullWidth error={!!errors.unit}>
                                            {["tablet", "capsule", "mg", "mcg", "ml", "drops", "g", "IU", "billion CFU"].map((u) => (
                                                <MenuItem key={u} value={u} sx={{ fontWeight: 600 }}>{u}</MenuItem>
                                            ))}
                                        </StyledTextField>
                                    )}
                                />
                            </Box>
                        </Box>
                    </Stack>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />

                <Box>
                    <Stack direction="row" alignItems="center" gap={2} mb={3}>
                        <Box sx={{
                            p: 1.2,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: 'warning.main',
                            display: 'flex'
                        }}>
                            <CalendarTodayIcon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                            Schedule
                        </Typography>
                    </Stack>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Frequency
                        </Typography>
                        <Stack direction="row" spacing={0} justifyContent="space-between" sx={{
                            bgcolor: 'background.paper',
                            border: '2px solid',
                            borderColor: 'divider',
                            p: 1.5,
                            borderRadius: 4
                        }}>
                            {DAYS_OF_WEEK.map((day) => (
                                <DayToggle
                                    key={day}
                                    day={day}
                                    selected={currentDays.includes(day)}
                                    onClick={() => toggleDay(day)}
                                />
                            ))}
                        </Stack>
                        {errors.days && <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{errors.days.message}</Typography>}
                    </Box>

                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Reminder Times
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {currentTimes.map((time, idx) => (
                                <Box key={idx} sx={{ flex: { xs: '1 0 100%', sm: '0 0 66%' } }}>
                                    <Controller
                                        name={`timesOfDay.${idx}`}
                                        control={control}
                                        render={({ field }) => (
                                            <StyledTextField
                                                {...field}
                                                type="time"
                                                fullWidth
                                                InputProps={{
                                                    endAdornment: currentTimes.length > 1 && (
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => removeTime(idx)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            ))}
                            <Box sx={{ flex: { xs: '1 0 100%', sm: '0 0 66%' } }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    onClick={addTime}
                                    sx={{
                                        height: 56,
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                        borderRadius: 4,
                                        fontWeight: 600,
                                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04), borderWidth: 2 }
                                    }}
                                >
                                    Add Time
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />

                <Box>
                    <Stack direction="row" alignItems="center" gap={2} mb={3}>
                        <Box sx={{
                            p: 1.2,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: 'info.main',
                            display: 'flex'
                        }}>
                            <StickyNote2Icon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                            Details
                        </Typography>
                    </Stack>

                    <Stack spacing={2}>
                        {currentInstructions.map((item, idx) => (
                            <Controller
                                key={idx}
                                name={`instructions.${idx}`}
                                control={control}
                                render={({ field }) => (
                                    <StyledTextField
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        inputRef={field.ref}
                                        onBlur={field.onBlur}
                                        placeholder="e.g. Take after breakfast"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography color="text.disabled" fontWeight="bold">•</Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: currentInstructions.length > 1 && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeInstruction(idx)}
                                                    >
                                                        <DeleteIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        ))}
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={addInstruction}
                            sx={{ alignSelf: 'flex-start', color: 'text.secondary', fontWeight: 700 }}
                        >
                            Add Instruction
                        </Button>
                    </Stack>

                    <Card variant="outlined" sx={{ mt: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.background.default, 0.5), borderColor: 'divider', borderRadius: 4, borderWidth: 2 }}>
                        <Box>
                            <Typography variant="body2" fontWeight={700}>Active Tracking</Typography>
                            <Typography variant="caption" color="text.secondary">Enable daily reminders & stats</Typography>
                        </Box>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => <Switch {...field} checked={field.value} color="success" />}
                        />
                    </Card>
                </Box>

                <Stack direction="row" spacing={2} pt={4} pb={2}>
                    <Button
                        variant="text"
                        onClick={handleCloseDrawer}
                        disabled={isLoading}
                        sx={{
                            flex: 1,
                            py: 2,
                            color: 'text.secondary',
                            borderRadius: 4,
                            fontWeight: 700
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        sx={{
                            flex: 2,
                            py: 2,
                            boxShadow: theme.shadows[8],
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : editingSupplement ? "Save Changes" : "Add to Stack"}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 3, md: 6 } }}>
            <Container maxWidth="lg">
                <Stack spacing={5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} >
                                My Stack
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage your daily stack and schedule
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleOpenDrawer(null)}
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: 3,
                                px: 3,
                                boxShadow: 2,
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                display: { xs: 'none', md: 'flex' }
                            }}
                        >
                            Add Supplement
                        </Button>
                    </Stack>

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Box
                            sx={{
                                position: "relative",
                                bgcolor: "background.paper",
                                borderRadius: 20,
                                px: 0.5,
                                py: 0.5,
                                display: "inline-flex",
                                boxShadow: theme => `0 2px 8px ${theme.palette.mode === "light"
                                    ? "rgba(0,0,0,0.06)"
                                    : "rgba(0,0,0,0.25)"}`
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 4,
                                    left: 4,
                                    height: "calc(100% - 8px)",
                                    width: "calc(50% - 8px)",
                                    borderRadius: 16,
                                    bgcolor: theme => theme.palette.primary.main,
                                    transition: "transform 0.32s cubic-bezier(0.55, 0, 0.1, 1)",
                                    transform: tabValue === "active"
                                        ? "translateX(0)"
                                        : "translateX(100%)",
                                    zIndex: 0
                                }}
                            />
                            <Stack direction="row" spacing={0}>
                                {[
                                    { val: "active", label: `Active (${activeSupplements.length})` },
                                    { val: "inactive", label: `Archived (${inactiveSupplements.length})` }
                                ].map((tab, idx) => {
                                    const isActive = tabValue === tab.val;
                                    return (
                                        <Box
                                            key={tab.val}
                                            onClick={() => setTabValue(tab.val)}
                                            sx={{
                                                position: "relative",
                                                cursor: "pointer",
                                                userSelect: "none",
                                                px: { xs: 2.5, sm: 3.5 },
                                                py: 1.1,
                                                borderRadius: 16,
                                                zIndex: 1,
                                                fontWeight: isActive ? 700 : 500,
                                                color: isActive
                                                    ? "primary.contrastText"
                                                    : "text.secondary",
                                                bgcolor: "transparent",
                                                transition: "color 0.32s cubic-bezier(0.55, 0, 0.1, 1)",
                                                textAlign: "center",
                                                fontSize: "1.05rem",
                                                boxShadow: isActive ? 2 : "none",
                                                "&:hover": {
                                                    color: isActive
                                                        ? "primary.contrastText"
                                                        : "primary.main",
                                                    bgcolor: isActive
                                                        ? "primary.main"
                                                        : theme => theme.palette.primary.light,
                                                }
                                            }}
                                        >
                                            {tab.label}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        {tabValue === "active" ? (
                            activeSupplements.length === 0 ? (
                                <EmptyState message="No active supplements found." subMessage="Add items to your stack to get started." />
                            ) : (
                                <Stack direction="column" spacing={3}>
                                    {activeSupplements.map((supplement) => (
                                        <Box key={supplement.id} sx={{ display: 'flex', flex: { xs: '1 0 100%', md: '0 0 50%', lg: '0 0 33%' } }}>
                                            <SupplementCard supplement={supplement} />
                                        </Box>
                                    ))}
                                </Stack>
                            )
                        ) : (
                            inactiveSupplements.length === 0 ? (
                                <EmptyState message="Archive is empty." subMessage="Inactive supplements will appear here." />
                            ) : (
                                <Stack direction="column" spacing={3}>
                                    {inactiveSupplements.map((supplement) => (
                                        <Box key={supplement.id} sx={{ display: 'flex', flex: { xs: '1 0 100%', md: '0 0 50%', lg: '0 0 33%' } }}>
                                            <SupplementCard supplement={supplement} showActions={false} />
                                        </Box>
                                    ))}
                                </Stack>
                            )
                        )}
                    </Box>

                    <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                        <Fab
                            color="primary"
                            aria-label="add"
                            onClick={() => handleOpenDrawer(null)}
                            sx={{
                                position: 'fixed',
                                bottom: 150,
                                right: 24,
                                display: { xs: 'flex', md: 'none' },
                                zIndex: 100,
                                boxShadow: theme.shadows[10],
                                width: 65,
                                height: 65,
                                '&:active': { transform: 'scale(0.95)' }
                            }}
                        >
                            <AddIcon sx={{ fontSize: 28 }} />
                        </Fab>
                    </Zoom>

                    <Drawer
                        anchor="bottom"
                        open={drawerOpen}
                        onClose={handleCloseDrawer}
                        PaperProps={{
                            sx: {
                                borderTopLeftRadius: 32,
                                borderTopRightRadius: 32,
                                maxHeight: '92vh',
                                height: 'auto',
                                overflow: 'visible',
                                bgcolor: 'background.default',
                                maxWidth: 'md',
                                mx: 'auto'
                            }
                        }}
                    >
                        <Box sx={{ width: 60, height: 6, bgcolor: 'divider', borderRadius: 3, mx: 'auto', mt: 2, mb: 1, opacity: 0.5 }} />
                        <Container maxWidth="sm" sx={{ pb: 4, height: '100%', overflowY: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', py: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                                    {editingSupplement ? "Edit Supplement" : "Add to Stack"}
                                </Typography>
                                <IconButton onClick={handleCloseDrawer} sx={{ position: 'absolute', right: 0, bgcolor: 'action.hover' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <SupplementFormContent />
                        </Container>
                    </Drawer>
                </Stack>
            </Container>
        </Box>
    );
};

export default ProfilePage;