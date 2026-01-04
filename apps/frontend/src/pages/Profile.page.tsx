import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog } from "@connected-repo/ui-mui/feedback/Dialog";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicationIcon from "@mui/icons-material/Medication";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";

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

const ProfilePage = () => {
	const [tabValue, setTabValue] = useState("active");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingSupplement, setEditingSupplement] = useState<SupplementWithId | null>(null);
	const [formDays, setFormDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
	const [formTimes, setFormTimes] = useState<string[]>(["08:00"]);
	const [formInstructions, setFormInstructions] = useState<string[]>(["Take with food"]);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
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

	const watchedIsActive = watch("isActive");

	const handleOpenDialog = (supplement: SupplementWithId | null = null) => {
		setEditingSupplement(supplement);
		if (supplement) {
			reset({
				name: supplement.name,
				dosage: supplement.dosage,
				unit: supplement.unit,
				instructions: supplement.instructions,
				days: supplement.days,
				timesOfDay: supplement.timesOfDay,
				isActive: supplement.isActive,
			});
			setFormDays(supplement.days);
			setFormTimes(supplement.timesOfDay);
			setFormInstructions(supplement.instructions);
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
			setFormDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
			setFormTimes(["08:00"]);
			setFormInstructions(["Take with food"]);
		}
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingSupplement(null);
		reset();
	};

	const onSubmit = async (data: z.infer<typeof supplementSchema>) => {
		setIsLoading(true);
		try {
			console.log("Saving supplement:", data);
			handleCloseDialog();
		} catch (error) {
			console.error("Error saving supplement:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleDay = (day: string) => {
		const newDays = formDays.includes(day) ? formDays.filter((d) => d !== day) : [...formDays, day];
		setFormDays(newDays);
	};

	const handleAddTime = () => {
		setFormTimes([...formTimes, "09:00"]);
	};

	const handleRemoveTime = (index: number) => {
		setFormTimes(formTimes.filter((_, i) => i !== index));
	};

	const handleTimeChange = (index: number, value: string) => {
		const newTimes = [...formTimes];
		newTimes[index] = value;
		setFormTimes(newTimes);
	};

	const handleAddInstruction = () => {
		setFormInstructions([...formInstructions, ""]);
	};

	const handleRemoveInstruction = (index: number) => {
		setFormInstructions(formInstructions.filter((_, i) => i !== index));
	};

	const handleInstructionChange = (index: number, value: string) => {
		const newInstructions = [...formInstructions];
		newInstructions[index] = value;
		setFormInstructions(newInstructions);
	};

	const mockSupplements: SupplementWithId[] = [
		{
			id: "1",
			name: "Vitamin D3",
			dosage: 50,
			unit: "mcg",
			instructions: ["Take one capsule in the morning with food."],
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			timesOfDay: ["08:15"],
			isActive: true,
		},
		{
			id: "2",
			name: "Fish Oil",
			dosage: 1200,
			unit: "mg",
			instructions: ["Take with a meal."],
			days: ["Monday", "Wednesday", "Friday", "Sunday"],
			timesOfDay: ["18:35"],
			isActive: true,
		},
		{
			id: "3",
			name: "Multivitamin",
			dosage: 1,
			unit: "tablet",
			instructions: ["Take right after breakfast."],
			days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
			timesOfDay: ["09:05"],
			isActive: true,
		},
		{
			id: "4",
			name: "Iron",
			dosage: 18,
			unit: "mg",
			instructions: ["Take on an empty stomach if possible."],
			days: ["Monday", "Wednesday", "Friday"],
			timesOfDay: ["13:45"],
			isActive: false,
		},
		{
			id: "5",
			name: "Probiotic",
			dosage: 10,
			unit: "billion CFU",
			instructions: ["Take before breakfast."],
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			timesOfDay: ["06:50"],
			isActive: true,
		},
		{
			id: "6",
			name: "Magnesium Glycinate",
			dosage: 200,
			unit: "mg",
			instructions: ["Take at bedtime for best absorption."],
			days: ["Tuesday", "Thursday", "Saturday"],
			timesOfDay: ["22:55"],
			isActive: false,
		},
	];

	const handleToggleActive = (supplementId: string, currentStatus: boolean) => {
		console.log(`Toggle ${supplementId} to ${!currentStatus}`);
	};

	const handleDelete = (supplementId: string) => {
		console.log(`Delete ${supplementId}`);
	};

	const activeSupplements = mockSupplements.filter((s) => s.isActive);
	const inactiveSupplements = mockSupplements.filter((s) => !s.isActive);

	const SupplementCard = ({ supplement, showActions = true }: { supplement: SupplementWithId; showActions?: boolean }) => (
		<Card
			sx={{
				p: 3,
				borderRadius: 3,
				transition: "all 0.3s ease-in-out",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: 4,
				},
			}}
		>
			<Stack spacing={2}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
					<Stack spacing={1} sx={{ flex: 1 }}>
						<Typography variant="h6" fontWeight={600}>
							{supplement.name}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{supplement.dosage} {supplement.unit}
						</Typography>
					</Stack>
					{showActions && (
						<Box sx={{ display: "flex", gap: 1 }}>
							<Button size="small" variant="outlined" onClick={() => handleOpenDialog(supplement)}>
								<EditIcon fontSize="small" />
							</Button>
							<Button size="small" variant="outlined" color="error" onClick={() => handleDelete(supplement.id)}>
								<DeleteIcon fontSize="small" />
							</Button>
						</Box>
					)}
				</Box>

				<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
						<Typography variant="body2" color="text.secondary">
							{supplement.timesOfDay.join(", ")}
						</Typography>
					</Box>
					{!showActions && (
						<Switch checked={supplement.isActive} onChange={() => handleToggleActive(supplement.id, supplement.isActive)} />
					)}
				</Box>

				<Box>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Days:
					</Typography>
					<Stack direction="row" spacing={0.5} flexWrap="wrap">
						{DAYS_OF_WEEK.map((day) => (
							<Box
								key={day}
								sx={{
									px: 1,
									py: 0.5,
									borderRadius: 1,
									fontSize: "0.75rem",
									backgroundColor: supplement.days.includes(day) ? "primary.main" : "action.disabledBackground",
									color: supplement.days.includes(day) ? "primary.contrastText" : "text.disabled",
								}}
							>
								{day.slice(0, 3)}
							</Box>
						))}
					</Stack>
				</Box>

				<Box>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Instructions:
					</Typography>
					<Stack spacing={0.5}>
						{supplement.instructions.map((instruction, idx) => (
							<Typography key={idx} variant="body2">
								• {instruction}
							</Typography>
						))}
					</Stack>
				</Box>
			</Stack>
		</Card>
	);

	const SupplementForm = () => (
        <Box sx={{ mt: 2, p:4 }}>
            {/* Opens Main Stack */}
            <Stack spacing={3}> 
                
                {/* Opens Content Stack */}
                <Stack spacing={2}> 
                    <Typography variant="h6" fontWeight={600}>
                        Basic Information
                    </Typography>
                    <Stack spacing={2}>
                        <Stack spacing={1}>
                            <Typography variant="body2">Name</Typography>
                            <input
                                {...register("name")}
                                placeholder="e.g., Vitamin D3"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    fontSize: "16px",
                                }}
                            />
                            {errors.name && (
                                <Typography variant="caption" color="error">
                                    {errors.name.message}
                                </Typography>
                            )}
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <Stack spacing={1} sx={{ flex: 1 }}>
                                <Typography variant="body2">Dosage</Typography>
                                <input
                                    type="number"
                                    {...register("dosage", { valueAsNumber: true })}
                                    placeholder="1"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #ccc",
                                        fontSize: "16px",
                                    }}
                                />
                                {errors.dosage && (
                                    <Typography variant="caption" color="error">
                                        {errors.dosage.message}
                                    </Typography>
                                )}
                            </Stack>
                            <Stack spacing={1} sx={{ flex: 1 }}>
                                <Typography variant="body2">Unit</Typography>
                                <select
                                    {...register("unit")}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #ccc",
                                        fontSize: "16px",
                                    }}
                                >
                                    <option value="tablet">Tablet</option>
                                    <option value="capsule">Capsule</option>
                                    <option value="mg">mg</option>
                                    <option value="mcg">mcg</option>
                                    <option value="ml">ml</option>
                                    <option value="drops">Drops</option>
                                    <option value="g">g</option>
                                    <option value="IU">IU</option>
                                </select>
                                {errors.unit && (
                                    <Typography variant="caption" color="error">
                                        {errors.unit.message}
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Schedule
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2">Days to take</Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {DAYS_OF_WEEK.map((day) => (
                                    <Box
                                        key={day}
                                        onClick={() => handleToggleDay(day)}
                                        sx={{
                                            px: 1.5,
                                            py: 0.75,
                                            borderRadius: 2,
                                            fontSize: "0.875rem",
                                            border: "1px solid",
                                            borderColor: formDays.includes(day) ? "primary.main" : "divider",
                                            backgroundColor: formDays.includes(day) ? "primary.main" : "background.paper",
                                            color: formDays.includes(day) ? "primary.contrastText" : "text.primary",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                backgroundColor: formDays.includes(day) ? "primary.dark" : "action.hover",
                                            },
                                        }}
                                    >
                                        {day}
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="body2">Times to take (HH:MM format)</Typography>
                            <Stack spacing={1}>
                                {formTimes.map((time, idx) => (
                                    <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                        <input
                                            value={time}
                                            onChange={(e) => handleTimeChange(idx, e.target.value)}
                                            placeholder="08:00"
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                borderRadius: "8px",
                                                border: "1px solid #ccc",
                                                fontSize: "16px",
                                            }}
                                        />
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleRemoveTime(idx)}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}
                                <Button
                                    variant="outlined"
                                    onClick={handleAddTime}
                                >
                                    Add Time
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Instructions
                        </Typography>
                        <Stack spacing={1}>
                            {formInstructions.map((instruction, idx) => (
                                <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    <input
                                        value={instruction}
                                        onChange={(e) => handleInstructionChange(idx, e.target.value)}
                                        placeholder="e.g., Take with food"
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            fontSize: "16px",
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleRemoveInstruction(idx)}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            ))}
                            <Button
                                variant="outlined"
                                onClick={handleAddInstruction}
                            >
                                Add Instruction
                            </Button>
                        </Stack>
                    </Stack>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/* Ensure Switch is imported from @mui/material */}
                        <Switch checked={watchedIsActive} {...register("isActive")} />
                        <Typography variant="body2">Active</Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseDialog}
                            disabled={isLoading}
                            sx={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            sx={{ flex: 1 }}
                        >
                            {isLoading ? <CircularProgress size={20} /> : editingSupplement ? "Update" : "Add"}
                        </Button>
                    </Stack>
                {/* Closes Content Stack */}
                </Stack> 
            {/* Closes Main Stack (Fixed: was previously </Box>) */}
            </Stack>
        </Box>
    );

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				py: { xs: 3, md: 4 },
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={4}>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Typography variant="h4" fontWeight={600}>
							My Supplements
						</Typography>
						<Button
							variant="contained"
							onClick={() => handleOpenDialog(null)}
							startIcon={<AddIcon />}
						>
							Add Supplement
						</Button>
					</Box>

					<Stack direction="row" spacing={2}>
						<Button
							variant={tabValue === "active" ? "contained" : "outlined"}
							onClick={() => setTabValue("active")}
							sx={{ flex: 1 }}
						>
							Active ({activeSupplements.length})
						</Button>
						<Button
							variant={tabValue === "inactive" ? "contained" : "outlined"}
							onClick={() => setTabValue("inactive")}
							sx={{ flex: 1 }}
						>
							Inactive ({inactiveSupplements.length})
						</Button>
					</Stack>

					{tabValue === "active" && (
						<Stack spacing={3}>
							{activeSupplements.length === 0 ? (
								<Card
									sx={{
										p: 6,
										textAlign: "center",
										borderRadius: 3,
									}}
								>
									<MedicationIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
									<Typography variant="h6" color="text.secondary" gutterBottom>
										No active supplements
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Add supplements to start tracking your daily intake
									</Typography>
								</Card>
							) : (
								activeSupplements.map((supplement) => (
									<SupplementCard key={supplement.id} supplement={supplement} />
								))
							)}
						</Stack>
					)}

					{tabValue === "inactive" && (
						<Stack spacing={3}>
							{inactiveSupplements.length === 0 ? (
								<Card
									sx={{
										p: 6,
										textAlign: "center",
										borderRadius: 3,
									}}
								>
									<Typography variant="h6" color="text.secondary" gutterBottom>
										No inactive supplements
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Deactivate supplements you're not taking anymore
									</Typography>
								</Card>
							) : (
								inactiveSupplements.map((supplement) => (
									<SupplementCard key={supplement.id} supplement={supplement} showActions={false} />
								))
							)}
						</Stack>
					)}
				</Stack>

				<Dialog
					open={dialogOpen}
					onClose={handleCloseDialog}
					title={editingSupplement ? "Edit Supplement" : "Add New Supplement"}
					maxWidth="md"
				>
					<SupplementForm />
				</Dialog>
			</Container>
		</Box>
	);
};

export default ProfilePage;