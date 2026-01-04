import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";
import { orpc } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
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
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// --- Schema & Types ---
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
}

const DAYS_OF_WEEK = DAYS_OF_WEEK_ENUM as readonly [string, ...string[]];

// --- Helper Components ---

const DayToggle = ({ day, selected, onClick }: { day: string; selected: boolean; onClick: () => void }) => {
    const theme = useTheme();
    return (
        <Box
            onClick={onClick}
            sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.75rem",
                transition: "all 0.2s ease",
                bgcolor: selected ? "primary.main" : "background.paper",
                color: selected ? "primary.contrastText" : "text.secondary",
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                "&:hover": {
                    bgcolor: selected ? "primary.dark" : "background.default",
                    borderColor: selected ? "primary.dark" : "primary.light",
                }
            }}
        >
            {day.charAt(0)}
        </Box>
    );
};

const ProfilePage = () => {
    const [tabValue, setTabValue] = useState("active");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSupplement, setEditingSupplement] = useState<SupplementWithId | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const {
        register,
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
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            timesOfDay: ["08:00"],
            isActive: true,
        },
    });

    // We use watch to sync local state logic with RHF
    const currentDays = watch("days");
    const currentTimes = watch("timesOfDay");
    const currentInstructions = watch("instructions");

    const handleOpenDialog = (supplement: SupplementWithId | null = null) => {
        setEditingSupplement(supplement);
        if (supplement) {
            reset({ ...supplement });
        } else {
            reset({
                name: "",
                dosage: 1,
                unit: "tablet",
                instructions: ["Take with food"],
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                timesOfDay: ["08:00"],
                isActive: true,
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingSupplement(null);
        reset();
    };

    const { data: supplements = [], isLoading: supplementsLoading, refetch: refetchSupplements } = useQuery(
        orpc.supplements.getAllSupplements.queryOptions()
    );

    const createMutation = useMutation({
        ...orpc.supplements.createSupplement.mutationOptions(),
        onSuccess: () => {
            handleCloseDialog();
            refetchSupplements();
        },
    });

    const updateMutation = useMutation({
        ...orpc.supplements.updateSupplement.mutationOptions(),
        onSuccess: () => {
            handleCloseDialog();
            refetchSupplements();
        },
    });

    const toggleMutation = useMutation({
        ...orpc.supplements.toggleActive.mutationOptions(),
        onSuccess: () => {
            refetchSupplements();
        },
    });

    const onSubmit = async (data: SupplementFormData) => {
        setIsLoading(true);
        try {
            if (editingSupplement) {
                await updateMutation.mutateAsync({ ...data, id: editingSupplement.id });
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("[Profile] Error saving supplement:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (supplement: SupplementWithId) => {
        await toggleMutation.mutateAsync({ id: supplement.id, isActive: !supplement.isActive });
    };

    // --- Form Logic Helpers ---
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

    const activeSupplements = (supplements ?? []).filter((s) => s.isActive);
    const inactiveSupplements = (supplements ?? []).filter((s) => !s.isActive);

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
                                <IconButton size="small" onClick={() => handleOpenDialog(supplement)}>
                                    <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
                <Stack spacing={2}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "primary.light" }} />
                        <Typography variant="body2" fontWeight={500} color="primary.main">
                            {supplement.timesOfDay.join(", ")}
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
                                        bgcolor: supplement.days.includes(day) ? 'primary.main' : 'background.default',
                                        color: supplement.days.includes(day) ? 'primary.contrastText' : 'text.disabled',
                                        border: '1px solid',
                                        borderColor: supplement.days.includes(day) ? 'primary.main' : 'divider'
                                    }}
                                >
                                    {day.charAt(0)}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Instructions
                        </Typography>
                        {supplement.instructions.map((inst, i) => (
                            <Typography key={i} variant="body2" color="secondary.dark" sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                                <span style={{ marginRight: 6, color: theme.palette.secondary.main }}>•</span> {inst} 
                            </Typography>
                        ))}
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
    
    
    // ... (Assume imports for DayToggle, etc. are handled)
    
const SupplementForm = () => {
        const theme = useTheme();
    
    return (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.grey[400], 0.1) }}>
                <Stack spacing={4} sx={{ p: 1 }}>
                    
                    {/* --- SECTION 1: ESSENTIALS --- */}
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
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                Supplement Details
                            </Typography>
                        </Stack>
    
                        <Stack spacing={2.5}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Supplement Name"
                                        placeholder="e.g. Vitamin D3"
                                        fullWidth
                                        variant="outlined"
                                        // Subtle background for inputs
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Controller
                                        name="dosage"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
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
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller
                                        name="unit"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} select label="Unit" fullWidth error={!!errors.unit}>
                                                {["tablet", "capsule", "mg", "mcg", "ml", "drops", "g", "IU", "billion CFU"].map((u) => (
                                                    <MenuItem key={u} value={u}>{u}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Box>
    
                    <Divider sx={{ borderStyle: 'dashed' }} />
    
                    {/* --- SECTION 2: SCHEDULE --- */}
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
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                Frequency & Timing
                            </Typography>
                        </Stack>
    
                        {/* Days Selector */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Days of Week
                            </Typography>
                            <Stack direction="row" spacing={0.5} justifyContent="space-between" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 3 }}>
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
    
                        {/* Times Grid */}
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Reminder Times
                            </Typography>
                            <Grid container spacing={1.5}>
                                {currentTimes.map((time, idx) => (
                                    <Grid item xs={6} sm={4} key={idx}>
                                        <Controller
                                            name={`timesOfDay.${idx}`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="time"
                                                    fullWidth
                                                    size="small"
                                                    sx={{ 
                                                        '& .MuiInputBase-input': { fontWeight: 600, fontSize: '0.9rem' }
                                                    }}
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
                                    </Grid>
                                ))}
                                <Grid item xs={6} sm={4}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<AddIcon />}
                                        onClick={addTime}
                                        sx={{ 
                                            height: 40, 
                                            borderStyle: 'dashed', 
                                            borderColor: 'divider', 
                                            color: 'text.secondary', 
                                            borderRadius: 1,
                                            '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'transparent' } 
                                        }}
                                    >
                                        Add Time
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
    
                    <Divider sx={{ borderStyle: 'dashed' }} />
    
                    {/* --- SECTION 3: EXTRAS --- */}
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
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                Additional Details
                            </Typography>
                        </Stack>
    
                        <Stack spacing={2}>
                            {currentInstructions.map((item, idx) => (
                                <Controller
                                    key={idx}
                                    name={`instructions.${idx}`}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            placeholder="e.g. Take after breakfast"
                                            fullWidth
                                            size="small"
                                            InputProps={{
                                                // Bullet point visual
                                                startAdornment: <InputAdornment position="start"><Typography color="text.disabled" fontWeight="bold">•</Typography></InputAdornment>,
                                                endAdornment: currentInstructions.length > 1 && (
                                                    <InputAdornment position="end">
                                                        <IconButton size="small" onClick={() => removeInstruction(idx)}>
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
                                sx={{ alignSelf: 'flex-start', color: 'text.secondary', fontWeight: 600 }}
                            >
                                Add Instruction
                            </Button>
                        </Stack>
    
                        {/* Styled Switch Card */}
                        <Card variant="outlined" sx={{ mt: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.background.default, 0.5), borderColor: 'divider', borderRadius: 2 }}>
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
    
                    {/* --- FOOTER ACTIONS --- */}
                    <Stack direction="row" spacing={2} pt={2}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseDialog}
                            disabled={isLoading}
                            color="inherit"
                            sx={{ 
                                flex: 1, 
                                py: 1.5, 
                                borderColor: 'divider', 
                                color: 'text.secondary',
                                borderRadius: 3
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            sx={{ 
                                flex: 1, 
                                py: 1.5, 
                                boxShadow: theme.shadows[4],
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                borderRadius: 3,
                                fontWeight: 700
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : editingSupplement ? "Save Changes" : "Add Supplement"}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        );
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 3, md: 6 } }}>
            <Container maxWidth="lg">
                <Stack spacing={5}>
                    {/* Header */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="primary.main">
                                My Stack
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage your daily stack and schedule
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleOpenDialog(null)}
                            startIcon={<AddIcon />}
                            sx={{ borderRadius: 3, px: 3, boxShadow: 2, bgcolor: "primary.main", color: "primary.contrastText" }}
                        >
                            Add Supplement
                        </Button>
                    </Stack>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1}>
                            {[
                                { val: 'active', label: `Active (${activeSupplements.length})` },
                                { val: 'inactive', label: `Archived (${inactiveSupplements.length})` }
                            ].map((tab) => (
                                <Box
                                    key={tab.val}
                                    onClick={() => setTabValue(tab.val)}
                                    sx={{
                                        px: 3, py: 1.5,
                                        cursor: 'pointer',
                                        borderBottom: 2,
                                        borderColor: tabValue === tab.val ? 'primary.main' : 'transparent',
                                        color: tabValue === tab.val ? 'primary.main' : 'text.secondary',
                                        fontWeight: tabValue === tab.val ? 600 : 400,
                                        transition: 'all 0.2s',
                                        "&:hover": { color: 'primary.main', bgcolor: 'primary.lighter' }
                                    }}
                                >
                                    {tab.label}
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    {/* Content Grid */}
                    <Box sx={{ width: '100%' }}>
                        {tabValue === "active" ? (
                            activeSupplements.length === 0 ? (
                                <EmptyState message="No active supplements found." subMessage="Add items to your stack to get started." />
                            ) : (
                                <Stack direction="column" spacing={3}>
                                    {activeSupplements.map((supplement) => (
                                        <Grid item xs={12} md={6} lg={4} key={supplement.id} sx={{ display: 'flex' }}>
                                            <SupplementCard supplement={supplement} />
                                        </Grid>
                                    ))}
                                </Stack>
                            )
                        ) : (
                            inactiveSupplements.length === 0 ? (
                                <EmptyState message="Archive is empty." subMessage="Inactive supplements will appear here." />
                            ) : (
                                <Stack direction="column" spacing={3}>
                                    {inactiveSupplements.map((supplement) => (
                                        <Grid item xs={12} md={6} lg={4} key={supplement.id} sx={{ display: 'flex' }}>
                                            <SupplementCard supplement={supplement} showActions={false} />
                                        </Grid>
                                    ))}
                                </Stack>
                            )
                        )}
                    </Box>
                </Stack>
                <Dialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3, bgcolor: 'primary.default'} }}
                >
                    <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: 700, color: "primary.main" }}>
                        {editingSupplement ? "Edit Supplement" : "Add New Supplement"}
                    </Typography>
                    <SupplementForm />
                </Dialog>
            </Container>
        </Box>
    );
};

const EmptyState = ({ message, subMessage }: { message: string, subMessage: string }) => (
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

export default ProfilePage;