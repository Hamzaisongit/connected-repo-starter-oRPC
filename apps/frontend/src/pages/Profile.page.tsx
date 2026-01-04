import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog } from "@connected-repo/ui-mui/feedback/Dialog";
import { 
  CircularProgress, 
  TextField, 
  MenuItem, 
  IconButton, 
  Grid, 
  Chip, 
  Divider,
  InputAdornment,
  Tooltip,
  useTheme,
  alpha
} from "@mui/material"; // Using standard MUI for form inputs to replace raw HTML
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicationIcon from "@mui/icons-material/Medication";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OpacityIcon from "@mui/icons-material/Opacity";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";

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

// A small circular button for selecting days (M T W T F S S)
const DayToggle = ({ day, selected, onClick }: { day: string; selected: boolean; onClick: () => void }) => {
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
                    bgcolor: selected ? "primary.dark" : "action.hover",
                    borderColor: selected ? "primary.dark" : "text.secondary",
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

    const onSubmit = async (data: SupplementFormData) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800)); 
            console.log("Saving supplement:", data);
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving supplement:", error);
        } finally {
            setIsLoading(false);
        }
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

    // --- Mock Data ---
    const mockSupplements: SupplementWithId[] = [
        { id: "1", name: "Vitamin D3", dosage: 50, unit: "mcg", instructions: ["Take one capsule in the morning with food."], days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], timesOfDay: ["08:15"], isActive: true },
        { id: "2", name: "Fish Oil", dosage: 1200, unit: "mg", instructions: ["Take with a meal."], days: ["Monday", "Wednesday", "Friday", "Sunday"], timesOfDay: ["18:35"], isActive: true },
        { id: "3", name: "Multivitamin", dosage: 1, unit: "tablet", instructions: ["Take right after breakfast."], days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], timesOfDay: ["09:05"], isActive: true },
        { id: "4", name: "Iron", dosage: 18, unit: "mg", instructions: ["Take on an empty stomach if possible."], days: ["Monday", "Wednesday", "Friday"], timesOfDay: ["13:45"], isActive: false },
        { id: "5", name: "Probiotic", dosage: 10, unit: "billion CFU", instructions: ["Take before breakfast."], days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], timesOfDay: ["06:50"], isActive: true },
    ];

    const activeSupplements = mockSupplements.filter((s) => s.isActive);
    const inactiveSupplements = mockSupplements.filter((s) => !s.isActive);

	const SupplementCard = ({ supplement, showActions = true }: { supplement: SupplementWithId; showActions?: boolean }) => (
        <Card
            sx={{
                width: "100%", // <--- VITAL: Forces card to fill the grid column
                display: 'flex',
                flexDirection: 'column',
                height: '100%', // Ensures cards in the same row match height
                position: 'relative',
                borderRadius: 4,
                overflow: 'visible',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: 'primary.light',
                },
            }}
        >
            {/* ... rest of your card content (Box, Typography, etc) ... */}
            <Box sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}> {/* Added width 100% here too just in case */}
                        <Box sx={{ 
                            width: 48, height: 48, 
                            borderRadius: 3, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <MedicationIcon />
                        </Box>
                        <Box sx={{ flex: 1 }}> {/* Allow text container to grow */}
                            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                                {supplement.name}
                            </Typography>
                            <Chip 
                                size="small" 
                                label={`${supplement.dosage} ${supplement.unit}`} 
                                sx={{ mt: 0.5, fontWeight: 600, bgcolor: 'action.hover', borderRadius: 1 }} 
                            />
                        </Box>
                    </Box>
                    
                    {showActions && (
                        <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenDialog(supplement)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>

                {/* ... rest of content ... */}
                <Stack spacing={2}>
                     {/* ... Times, Schedule, Instructions ... */}
                     {/* (Keeping existing code hidden for brevity, ensure you keep the inner content!) */}
                     <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" fontWeight={500} color="text.primary">
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
                                        bgcolor: supplement.days.includes(day) ? 'primary.main' : 'transparent',
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
                            <Typography key={i} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                                <span style={{ marginRight: 6, color: theme.palette.primary.main }}>•</span> {inst} avaoid taking w/ lorem epsum!
                            </Typography>
                        ))}
                    </Box>
                </Stack>
            </Box>
            
            {!showActions && (
                <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                         <Typography variant="body2" color="text.secondary">Currently Inactive</Typography>
                         <Switch size="small" checked={supplement.isActive} />
                    </Stack>
                </Box>
            )}
        </Card>
    );
    // --- The Form Component (Now Beautified) ---
    const SupplementForm = () => (
        <Box sx={{ p: 2 }}>
            <Stack spacing={4}>
                {/* Section 1: Basic Info */}
                <Box>
                    <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <LocalPharmacyIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                            Supplement Details
                        </Typography>
                    </Stack>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
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
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="dosage"
                                control={control}
                                render={({ field }) => (
                                    <TextField 
                                        {...field} 
                                        label="Dosage" 
                                        type="number"
                                        fullWidth 
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        InputProps={{ endAdornment: <OpacityIcon color="action" fontSize="small" sx={{ opacity: 0.5 }} /> }}
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
                </Box>

                <Divider />

                {/* Section 2: Schedule */}
                <Box>
                    <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <CalendarTodayIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                            Frequency & Timing
                        </Typography>
                    </Stack>
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>Select Days</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>Alert Times</Typography>
                        <Grid container spacing={2}>
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
                                                InputLabelProps={{ shrink: true }}
                                                InputProps={{
                                                    endAdornment: currentTimes.length > 1 && (
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => removeTime(idx)} edge="end">
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
                                    sx={{ height: 40, borderStyle: 'dashed' }}
                                >
                                    Add Time
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                <Divider />

                {/* Section 3: Instructions & Status */}
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                        Additional Notes
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {currentInstructions.map((item, idx) => (
                            <Controller
                                key={idx}
                                name={`instructions.${idx}`}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        placeholder="e.g. Take with a full glass of water"
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            endAdornment: currentInstructions.length > 1 && (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => removeInstruction(idx)} edge="end">
                                                        <DeleteIcon fontSize="small" color="action" />
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
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Add Instruction
                        </Button>
                    </Stack>

                    <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2, display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
                        <Box>
                             <Typography variant="body2" fontWeight={600}>Active Tracking</Typography>
                             <Typography variant="caption" color="text.secondary">Enable daily reminders for this item</Typography>
                        </Box>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => <Switch {...field} checked={field.value} />}
                        />
                    </Box>
                </Box>

                <Stack direction="row" spacing={2} pt={2}>
                    <Button variant="outlined" onClick={handleCloseDialog} disabled={isLoading} sx={{ flex: 1, py: 1.2 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isLoading} sx={{ flex: 1, py: 1.2 }}>
                        {isLoading ? <CircularProgress size={20} color="inherit" /> : editingSupplement ? "Save Changes" : "Add Supplement"}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: { xs: 3, md: 6 } }}>
            <Container maxWidth="lg">
                <Stack spacing={5}>
                    {/* Header */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="text.primary">
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
                            sx={{ borderRadius: 3, px: 3, boxShadow: 2 }}
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
                                        "&:hover": { color: 'primary.main', bgcolor: 'action.hover' }
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
								// Ensure spacing={3} and width="100%"
								<Grid container spacing={3} sx={{ width: '100%', m: 0 }}> 
									{activeSupplements.map((supplement) => (
										// xs={12} forces full width on mobile. md={6} makes it 2-column on desktop
										<Grid item xs={12} md={6} lg={4} key={supplement.id} sx={{ display: 'flex' }}>
											<SupplementCard supplement={supplement} />
										</Grid>
									))}
								</Grid>
							)
						) : (
								inactiveSupplements.length === 0 ? (
								<EmptyState message="Archive is empty." subMessage="Inactive supplements will appear here." />
							) : (
								<Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
									{inactiveSupplements.map((supplement) => (
										<Grid item xs={12} md={6} lg={4} key={supplement.id} sx={{ display: 'flex' }}>
											<SupplementCard supplement={supplement} showActions={false} />
										</Grid>
									))}
								</Grid>
							)
						)}
					</Box>
                </Stack>

                <Dialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <Typography variant="h6" sx={{ p: 3, pb: 0, fontWeight: 700 }}>
                         {editingSupplement ? "Edit Supplement" : "Add New Supplement"}
                    </Typography>
                    <SupplementForm />
                </Dialog>
            </Container>
        </Box>
    );
};

// Simple empty state component
const EmptyState = ({ message, subMessage }: { message: string, subMessage: string }) => (
    <Box sx={{ 
        py: 10, 
        textAlign: "center", 
        bgcolor: 'background.paper', 
        borderRadius: 4, 
        border: '1px dashed', 
        borderColor: 'divider' 
    }}>
        <MedicationIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.primary" gutterBottom>
            {message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {subMessage}
        </Typography>
    </Box>
);

export default ProfilePage;