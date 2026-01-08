import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Controller, type UseFormReturn } from "react-hook-form";

interface TimeFieldArrayProps {
	formMethods: UseFormReturn<any>;
}

export const TimeFieldArray = ({ formMethods }: TimeFieldArrayProps) => {
	return (
		<Box
		>
			<Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500, mb: 1.5 }}>
				Time
			</Typography>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				}}
			>
				<Controller
					name="reminderTime"
					control={formMethods.control}
					render={({ field }) => (
						<TimePicker
							value={field.value ? dayjs(field.value, "HH:mm") : null}
							onChange={(newValue) => {
								field.onChange(newValue ? newValue.format("HH:mm:ss") : "");
							}}
							slotProps={{
								textField: {
									size: "small",
									sx: {
										maxWidth: 150,
										mb: 0,
										"& .MuiOutlinedInput-root": {
											backgroundColor: "transparent",
											fontSize: "1.25rem",
											fontWeight: 600,
											"& fieldset": { border: "none" },
											"& input": { padding: "4px 0" },
										},
									},
								},
							}}
						/>
					)}
				/>
			</Box>
			{formMethods.formState.errors.reminderTime && (
				<Typography sx={{ fontSize: "0.75rem", color: "#EF4444", mt: 0.75, ml: 1.75 }}>
					{String(formMethods.formState.errors.reminderTime?.message)}
				</Typography>
			)}
		</Box>
	);
};
