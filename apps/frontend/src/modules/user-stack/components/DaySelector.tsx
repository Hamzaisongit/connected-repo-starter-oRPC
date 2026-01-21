import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

interface DaySelectorProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
}

const DAYS = [
	{ label: "S", value: "Sunday" },
	{ label: "M", value: "Monday" },
	{ label: "T", value: "Tuesday" },
	{ label: "W", value: "Wednesday" },
	{ label: "T", value: "Thursday" },
	{ label: "F", value: "Friday" },
	{ label: "S", value: "Saturday" },
];

export function DaySelector<T extends FieldValues>({ control, name }: DaySelectorProps<T>) {
	const theme = useTheme();
	return (
		<Box>
			<Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary, fontSize: "0.8rem", fontWeight: 500 }}>
				Frequency
			</Typography>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<Box sx={{ display: "flex", gap: 0.75, justifyContent: "space-between" }}>
						{DAYS.map((day) => {
							const isSelected = field.value.includes(day.value);
							return (
								<Box
									key={day.value}
									onClick={() => {
										const newValue = isSelected
											? field.value.filter((d: string) => d !== day.value)
											: [...field.value, day.value];
										field.onChange(newValue);
									}}
									sx={{
										width: 36,
										height: 36,
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										fontSize: "0.85rem",
										fontWeight: 600,
										transition: "all 0.3s ease-in-out",
										backgroundColor: isSelected ? alpha(theme.palette.info.main, 0.12) : theme.palette.grey[100],
										color: isSelected ? theme.palette.info.dark : theme.palette.text.secondary,
										border: isSelected ? "none" : `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
										boxShadow: isSelected
											? `0 0 20px ${alpha(theme.palette.info.main, 0.8)}, 0 0 35px ${alpha(theme.palette.info.light, 0.5)}, 0 4px 12px ${alpha(theme.palette.info.light, 0.4)}`
											: "none",
										"&:hover": {
											transform: "scale(1.08)",
											boxShadow: isSelected
												? `0 0 25px ${alpha(theme.palette.info.main, 0.9)}, 0 0 45px ${alpha(theme.palette.info.light, 0.6)}, 0 6px 16px ${alpha(theme.palette.info.light, 0.5)}`
												: "none",
										},
									}}
								>
									{day.label}
								</Box>
							);
						})}
					</Box>
				)}
			/>
		</Box>
	);
}
