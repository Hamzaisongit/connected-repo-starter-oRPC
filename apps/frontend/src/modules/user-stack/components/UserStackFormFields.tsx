import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { RhfSelect } from "@connected-repo/ui-mui/rhf-form/RhfSelect";
import { RhfSubmitButton } from "@connected-repo/ui-mui/rhf-form/RhfSubmitButton";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { SUPPLEMENT_UNITS } from "@frontend/utils/supplement.constants";
import { alpha, useTheme } from "@mui/material/styles";
import { memo, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FrequencySelector } from "./FrequencySelector";
import { MoreSection } from "./MoreSection";
import { PhotoAssistCard } from "./PhotoAssistCard";
import { TimeFieldArray } from "./TimeFieldArray";

const FormDivider = memo(() => {
	const theme = useTheme();
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
			<Box sx={{ flex: 1, height: "1px", backgroundColor: alpha(theme.palette.common.black, 0.06) }} />
			<Typography sx={{ fontSize: "0.65rem", color: theme.palette.text.disabled, fontWeight: 500, letterSpacing: "0.5px" }}>
				OR MANUAL ENTRY
			</Typography>
			<Box sx={{ flex: 1, height: "1px", backgroundColor: alpha(theme.palette.common.black, 0.06) }} />
		</Box>
	);
});

FormDivider.displayName = "FormDivider";



interface UserStackFormFieldsProps {
	formMethods: UseFormReturn<any>;
	submitButtonText: string;
	submittingText: string;
}

export function UserStackFormFields({ formMethods, submitButtonText, submittingText }: UserStackFormFieldsProps) {
	const theme = useTheme();
	const unitOptions = useMemo(() =>
		SUPPLEMENT_UNITS.map(unit => ({ label: unit, value: unit })),
		[]
	);

	const selectedUnit = formMethods.watch("unit");

	return (
		<Stack spacing={2}>
			{/* Photo Assist Card */}
			<PhotoAssistCard />

			{/* Divider */}
			<FormDivider />

			{/* Form Card */}
			<Stack
				spacing={2.5}
				sx={{
					backgroundColor: theme.palette.background.paper,
					borderRadius: 2,
					p: 4,
					boxShadow: theme.shadows[1],
					border: `1px solid ${alpha(theme.palette.common.black, 0.05)}`,
				}}
			>
				{/* Name Field */}
				<RhfTextField
					name="name"
					label="Supplement Name"
					placeholder="e.g. Magnesium Glycinate"
				/>

				{/* Dosage Row */}
				<Stack direction="row" sx={{ gap: 2 }}>
					<RhfTextField
						name="dosage"
						label="Dosage"
						type="number"
						inputProps={{ min: 1 }}
						sx={{ flex: 1.4 }}
					/>
					<RhfSelect
						name="unit"
						label="Unit"
						options={unitOptions}
						placeholder="Select unit"
						sx={{ flex: 1 }}
					/>
				</Stack>

				{selectedUnit === "Other" && (
					<RhfTextField
						name="customUnit"
						label="Custom Unit"
						placeholder="Enter your custom unit"
					/>
				)}

				{/* Frequency */}
				<FrequencySelector formMethods={formMethods} />

				{/* Time */}
				<TimeFieldArray formMethods={formMethods} />

				{/* More Section */}
				<MoreSection />

				{/* Submit Button */}
				<RhfSubmitButton
					notSubmittingText={submitButtonText}
					isSubmittingText={submittingText}
					props={{
						variant: "contained",
						fullWidth: true,
						sx: {
							height: "52px",
							borderRadius: "100px",
							backgroundColor: theme.palette.success.main,
							color: theme.palette.success.contrastText,
							fontSize: "1rem",
							fontWeight: 600,
							textTransform: "none",
							boxShadow: `0px 4px 12px ${alpha(theme.palette.success.main, 0.25)}`,
							transition: "all 0.3s ease-in-out",
							mt: 1,
							"&:hover": {
								backgroundColor: theme.palette.success.dark,
								transform: "translateY(-2px)",
								boxShadow: `0px 6px 18px ${alpha(theme.palette.success.main, 0.35)}`,
							},
							"&:active": { transform: "translateY(0)" },
						},
					}}
				/>
			</Stack>
		</Stack>
	);
}
