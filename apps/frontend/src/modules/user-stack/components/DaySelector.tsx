import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";

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
	return (
		<Box>
			<Typography variant="body2" sx={{ mb: 1, color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>
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
										backgroundColor: isSelected ? "#E0F2FE" : "#F1F5F9",
										color: isSelected ? "#0369A1" : "#64748B",
										border: isSelected ? "none" : "1px solid rgba(0, 0, 0, 0.06)",
										boxShadow: isSelected 
											? "0 0 20px rgba(224, 242, 254, 0.8), 0 0 35px rgba(186, 230, 253, 0.5), 0 4px 12px rgba(186, 230, 253, 0.4)" 
											: "none",
										"&:hover": {
											transform: "scale(1.08)",
											boxShadow: isSelected 
												? "0 0 25px rgba(224, 242, 254, 0.9), 0 0 45px rgba(186, 230, 253, 0.6), 0 6px 16px rgba(186, 230, 253, 0.5)" 
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
