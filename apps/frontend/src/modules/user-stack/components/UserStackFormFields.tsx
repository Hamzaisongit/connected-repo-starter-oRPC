import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { PhotoCameraIcon } from "@connected-repo/ui-mui/icons/PhotoCameraIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { RhfSelect } from "@connected-repo/ui-mui/rhf-form/RhfSelect";
import { RhfSubmitButton } from "@connected-repo/ui-mui/rhf-form/RhfSubmitButton";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { SUPPLEMENT_UNITS } from "@frontend/utils/supplement.constants";
import { memo, useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import { MoreSection } from "./MoreSection";
import { TimeFieldArray } from "./TimeFieldArray";
import { FrequencySelector } from "./FrequencySelector";

const PhotoAssistCard = memo(() => (
	<Box
		sx={{
			backgroundColor: "#FFFFFF",
			borderRadius: "20px",
			p: 1.5,
			boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
			border: "1px solid rgba(0, 0, 0, 0.05)",
		}}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1.5,
				cursor: "pointer",
				transition: "all 0.2s ease-in-out",
				p: 1.5,
				borderRadius: "12px",
				"&:hover": {
					backgroundColor: "rgba(224, 242, 254, 0.3)",
				},
			}}
		>
			<Box
				sx={{
					width: 44,
					height: 44,
					borderRadius: "10px",
					backgroundColor: "rgba(224, 242, 254, 0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<PhotoCameraIcon sx={{ color: "#075985", fontSize: "1.35rem" }} />
			</Box>
			<Box sx={{ flex: 1 }}>
				<Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#1A1C2E", mb: 0.125 }}>
					Photo Assist
				</Typography>
				<Typography sx={{ fontSize: "0.7rem", color: "#64748B" }}>
					Tap to scan label instantly
				</Typography>
			</Box>
			<Typography sx={{ color: "#64748B", fontSize: "1.15rem" }}>›</Typography>
		</Box>
	</Box>
));

PhotoAssistCard.displayName = "PhotoAssistCard";

const FormDivider = memo(() => (
	<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
		<Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(0, 0, 0, 0.06)" }} />
		<Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.5px" }}>
			OR MANUAL ENTRY
		</Typography>
		<Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(0, 0, 0, 0.06)" }} />
	</Box>
));

FormDivider.displayName = "FormDivider";



interface UserStackFormFieldsProps {
	formMethods: UseFormReturn<any>;
	submitButtonText: string;
	submittingText: string;
}

export function UserStackFormFields({ formMethods, submitButtonText, submittingText }: UserStackFormFieldsProps) {
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
					backgroundColor: "#FFFFFF",
					borderRadius: "20px",
					p: 2.5,
					boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
					border: "1px solid rgba(0, 0, 0, 0.05)",
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
							backgroundColor: "#4F6F52",
							color: "#ffffff",
							fontSize: "1rem",
							fontWeight: 600,
							textTransform: "none",
							boxShadow: "0px 4px 12px rgba(79, 111, 82, 0.25)",
							transition: "all 0.3s ease-in-out",
							mt: 1,
							"&:hover": {
								backgroundColor: "#3D5740",
								transform: "translateY(-2px)",
								boxShadow: "0px 6px 18px rgba(79, 111, 82, 0.35)",
							},
							"&:active": { transform: "translateY(0)" },
						},
					}}
				/>
			</Stack>
		</Stack>
	);
}
