import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import { memo } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

const DAYS_OF_WEEK = [
	{ label: "S", value: "Sunday" },
	{ label: "M", value: "Monday" },
	{ label: "T", value: "Tuesday" },
	{ label: "W", value: "Wednesday" },
	{ label: "T", value: "Thursday" },
	{ label: "F", value: "Friday" },
	{ label: "S", value: "Saturday" },
] as const;

const DAILY_DAYS = DAYS_OF_WEEK.map(d => d.value);
const WEEKDAYS_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKEND_DAYS = ["Saturday", "Sunday"];
const ALTERNATE_DAYS_1 = ["Monday", "Wednesday", "Friday"]; // Starting from Monday
const ALTERNATE_DAYS_2 = ["Sunday", "Tuesday", "Thursday", "Saturday"]; // Starting from Sunday

const DayButton = memo<{ day: typeof DAYS_OF_WEEK[number]; isSelected: boolean; onClick: () => void }>(
	({ day, isSelected, onClick }) => {
		const theme = useTheme();
		return (
			<Box
				onClick={onClick}
				sx={{
					width: 40,
					height: 40,
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					fontSize: "0.875rem",
					fontWeight: 600,
					transition: "all 0.3s ease-in-out",
					backgroundColor: isSelected ? alpha(theme.palette.info.main, 1) : theme.palette.background.default,
					color: isSelected ? theme.palette.info.contrastText : theme.palette.text.secondary,
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
	}
);

DayButton.displayName = "DayButton";

interface FrequencySelectorProps {
	formMethods: UseFormReturn<any>;
}

export const FrequencySelector = memo<FrequencySelectorProps>(({ formMethods }) => {
	const theme = useTheme();
	return (
		<Stack direction="column" gap={1} sx={{ m: 0, mt: 0 }}>
			<Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: "0.875rem", fontWeight: 500 }}>
				Frequency
			</Typography>
			<Controller
				name="reminderDays"
				control={formMethods.control}
				render={({ field, fieldState: { error } }) => {
					const sortedCurrent = [...field.value].sort();
					const isDaily = JSON.stringify(sortedCurrent) === JSON.stringify(DAILY_DAYS.sort());
					const isWeekdays = JSON.stringify(sortedCurrent) === JSON.stringify(WEEKDAYS_DAYS.sort());
					const isWeekend = JSON.stringify(sortedCurrent) === JSON.stringify(WEEKEND_DAYS.sort());
					const isAlternate1 = JSON.stringify(sortedCurrent) === JSON.stringify(ALTERNATE_DAYS_1.sort());
					const isAlternate2 = JSON.stringify(sortedCurrent) === JSON.stringify(ALTERNATE_DAYS_2.sort());
					const isAlternate = isAlternate1 || isAlternate2;

					const handleDailyClick = () => {
						if (isDaily) {
							field.onChange([]);
						} else {
							field.onChange(DAILY_DAYS);
						}
					};

					const handleAlternateClick = () => {
						if (isAlternate1) {
							field.onChange(ALTERNATE_DAYS_2);
						} else if (isAlternate2) {
							field.onChange([]);
						} else {
							field.onChange(ALTERNATE_DAYS_1);
						}
					};

					const handleWeekdaysClick = () => {
						if (isWeekdays) {
							field.onChange([]);
						} else {
							field.onChange(WEEKDAYS_DAYS);
						}
					};

					const handleWeekendClick = () => {
						if (isWeekend) {
							field.onChange([]);
						} else {
							field.onChange(WEEKEND_DAYS);
						}
					};

					return (
						<>
							<Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
								{DAYS_OF_WEEK.map((day) => {
									const isSelected = field.value.includes(day.value);
									return (
										<DayButton
											key={day.value}
											day={day}
											isSelected={isSelected}
											onClick={() => {
												const newValue = isSelected
													? field.value.filter((d: string) => d !== day.value)
													: [...field.value, day.value];
												field.onChange(newValue);
											}}
										/>
									);
								})}
							</Box>
							<Stack direction="row" gap={0.75} sx={{ mt: 1, justifyContent: "center" }}>
								<Box
									onClick={handleDailyClick}
									sx={{
										px: 1.25,
										py: 0.4,
										borderRadius: 1.5,
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 500,
										backgroundColor: isDaily ? alpha(theme.palette.info.main, 0.75) : theme.palette.background.default,
										color: isDaily ? theme.palette.info.contrastText : theme.palette.text.secondary,
										border: `1px solid ${isDaily ? alpha(theme.palette.info.light, 0.6) : alpha(theme.palette.common.black, 0.06)}`,
										transition: "all 0.2s ease-in-out"
									}}
								>
									Daily
								</Box>
								<Box
									onClick={handleAlternateClick}
									sx={{
										px: 1.25,
										py: 0.4,
										borderRadius: 1.5,
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 500,
										backgroundColor: isAlternate ? alpha(theme.palette.info.main, 0.75) : theme.palette.background.default,
										color: isAlternate ? theme.palette.info.contrastText : theme.palette.text.secondary,
										border: `1px solid ${isAlternate ? alpha(theme.palette.info.light, 0.6) : alpha(theme.palette.common.black, 0.06)}`,
										transition: "all 0.2s ease-in-out"
									}}
								>
									Alternate
								</Box>
								<Box
									onClick={handleWeekdaysClick}
									sx={{
										px: 1.25,
										py: 0.4,
										borderRadius: 1.5,
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 500,
										backgroundColor: isWeekdays ? alpha(theme.palette.info.main, 0.75) : theme.palette.background.default,
										color: isWeekdays ? theme.palette.info.contrastText : theme.palette.text.secondary,
										border: `1px solid ${isWeekdays ? alpha(theme.palette.info.light, 0.6) : alpha(theme.palette.common.black, 0.06)}`,
										transition: "all 0.2s ease-in-out"
									}}
								>
									Weekdays
								</Box>
								<Box
									onClick={handleWeekendClick}
									sx={{
										px: 1.25,
										py: 0.4,
										borderRadius: 1.5,
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 500,
										backgroundColor: isWeekend ? alpha(theme.palette.info.main, 0.75) : theme.palette.background.default,
										color: isWeekend ? theme.palette.info.contrastText : theme.palette.text.secondary,
										border: `1px solid ${isWeekend ? alpha(theme.palette.info.light, 0.6) : alpha(theme.palette.common.black, 0.06)}`,
										transition: "all 0.2s ease-in-out"
									}}
								>
									Weekends
								</Box>
							</Stack>
							{error && (
								<Typography sx={{ fontSize: "0.75rem", color: theme.palette.error.main, mt: 0.75, ml: 1.75 }}>
									{error.message}
								</Typography>
							)}
						</>
					);
				}}
			/>
		</Stack>
	);
});

FrequencySelector.displayName = "FrequencySelector";