import { ContentCard } from "@connected-repo/ui-mui/components/ContentCard";
import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { RhfCheckbox } from "@connected-repo/ui-mui/rhf-form/RhfCheckbox";
import { RhfSelect } from "@connected-repo/ui-mui/rhf-form/RhfSelect";
import { RhfSubmitButton } from "@connected-repo/ui-mui/rhf-form/RhfSubmitButton";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";
import type { UserStackCreateInput } from "@connected-repo/zod-schemas/user_stack.zod";
import { orpcFetch } from "@frontend/utils/orpc.client";
import { SUPPLEMENT_UNITS } from "@frontend/utils/supplement.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import z from "zod";

const createUserStackFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	instructions: z.string(),
	isActive: z.boolean(),
	dosage: z.string().min(1, "Dosage is required"),
	unit: z.enum(SUPPLEMENT_UNITS),
	customUnit: z.string().optional(),
	days: z.enum(DAYS_OF_WEEK_ENUM),
	timesOfDay: z.string(),
	imageUrl: z.string().url().nullable().optional(),
}).refine((data) => {
	if (data.unit === "Other" && (!data.customUnit || data.customUnit.trim() === "")) {
		return false;
	}
	return true;
}, {
	message: "Custom unit is required when 'Other' is selected",
	path: ["customUnit"],
});

type CreateUserStackFormData = z.infer<typeof createUserStackFormSchema>;

export function CreateUserStackForm() {
	const [success, setSuccess] = useState("");

	const { formMethods, RhfFormProvider } = useRhfForm<CreateUserStackFormData>({
		onSubmit: async (data) => {
			// Parse instructions as array from newline-separated
			const instructions: string[] = data.instructions
				? data.instructions.split('\n').map((i: string) => i.trim()).filter((i: string) => i)
				: [];
			// Parse timesOfDay as array from comma-separated
			const timesOfDay: string[] = data.timesOfDay
				? data.timesOfDay.split(',').map((t: string) => t.trim()).filter((t: string) => t)
				: [];

			const finalUnit = data.unit === "Other" ? data.customUnit : data.unit;

			const submitData: UserStackCreateInput = {
				...data,
				dosage: Number(data.dosage), // Convert dosage string to number
				unit: finalUnit || "",
				instructions,
				timesOfDay,
			};
			await orpcFetch.userStacks.create(submitData);
			formMethods.reset();
			setSuccess("User stack item added successfully!");
			setTimeout(() => setSuccess(""), 3000);
		},
		formConfig: {
			resolver: zodResolver(createUserStackFormSchema),
			defaultValues: {
				name: "",
				instructions: "",
				isActive: true,
				dosage: "1",
				unit: "mg",
				customUnit: "",
				days: "Monday",
				timesOfDay: "",
				imageUrl: undefined,
			},
		},
	});

	return (
		<ContentCard>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					justifyContent: "space-between",
					alignItems: { xs: "flex-start", sm: "center" },
					gap: { xs: 2, sm: 0 },
					mb: 3
				}}
			>
				<Typography
					variant="h5"
					component="h3"
					sx={{
						fontSize: { xs: "1.25rem", sm: "1.5rem" },
					}}
				>
					Add New Stack Item
				</Typography>
			</Box>

			<RhfFormProvider>
				<Stack spacing={3}>
					<RhfTextField
						name="name"
						label="Supplement/Medication Name"
						placeholder="e.g., Vitamin D3, Omega-3"
						helperText="Enter the name of the supplement or medication"
					/>

					<RhfTextField
						name="instructions"
						label="Instructions"
						multiline
						rows={3}
						placeholder="Enter each instruction on a new line"
						helperText="Enter instructions, one per line (e.g., Take with food, Avoid caffeine)"
					/>

					<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
						<RhfTextField
							name="dosage"
							label="Dosage"
							type="number"
							inputProps={{ min: 1 }}
							sx={{ flex: 1, minWidth: 120 }}
						/>
						<RhfSelect
							name="unit"
							label="Unit"
							options={SUPPLEMENT_UNITS.map(unit => ({ label: unit, value: unit }))}
							placeholder="Select unit"
							sx={{ flex: 1, minWidth: 120 }}
						/>
					</Box>

					{formMethods.watch("unit") === "Other" && (
						<RhfTextField
							name="customUnit"
							label="Custom Unit"
							placeholder="Enter your custom unit"
							helperText="Specify your custom unit (e.g., teaspoons, scoops)"
						/>
					)}

					<RhfSelect
						name="days"
						label="Day of Week"
						options={DAYS_OF_WEEK_ENUM.map(day => ({ label: day, value: day }))}
						placeholder="Select a day"
					/>

					<RhfTextField
						name="timesOfDay"
						label="Times of Day"
						placeholder="e.g., Morning, Afternoon, Evening"
						helperText="Enter times separated by commas (e.g., 8:00 AM, 2:00 PM)"
					/>

					<RhfTextField
						name="imageUrl"
						label="Image URL (Optional)"
						placeholder="https://example.com/image.jpg"
						helperText="Optional: URL to an image of the supplement"
					/>

					<RhfCheckbox
						name="isActive"
						label="Active in my stack"
						checkboxProps={{ defaultChecked: true }}
					/>

					<RhfSubmitButton
						notSubmittingText="Add to Stack"
						isSubmittingText="Adding..."
						props={{
							variant: "contained",
							color: "success",
							fullWidth: true,
						}}
					/>
				</Stack>
			</RhfFormProvider>

			<SuccessAlert message={success} />
		</ContentCard>
	);
}