import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { AddIcon } from "@connected-repo/ui-mui/icons/AddIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { motion } from "framer-motion";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RemoveButton } from "./RemoveButton";

export const TimeFieldArray = () => {
	const { control } = useFormContext();
	const { fields: timeFields, append: appendTime, remove: removeTime } = useFieldArray({
		control,
		name: "timesOfDay",
	});

	return (
		<Box>
			<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
				<Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500 }}>
					Time
				</Typography>
			<Box
				onClick={() => appendTime({ hour: "08", minute: "00", period: "AM" })}
				sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 20,
						height: 20,
						borderRadius: "50%",
						backgroundColor: "#E0F2FE",
						color: "#075985",
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
						"&:hover": { backgroundColor: "#BAE6FD", transform: "scale(1.1)" },
					}}
				>
					<AddIcon sx={{ fontSize: "0.875rem" }} />
				</Box>
			</Box>
			<Stack spacing={1.25}>
					{timeFields.map((field, index) => (
						<motion.div
							key={field.id}
							initial={{ opacity: 0, x: -20, height: 0 }}
							animate={{ opacity: 1, x: 0, height: "auto" }}
							exit={{ opacity: 0, x: 20, height: 0 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							style={{ overflow: "hidden" }}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<Box
									sx={{
										display: "flex",
										gap: 0.5,
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: "rgba(248, 250, 252, 0.8)",
										borderRadius: "100px",
										padding: "10px 18px",
										border: "1px solid rgba(0, 0, 0, 0.06)",
										flex: 1,
										transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
										"&:hover": {
											backgroundColor: "#FFFFFF",
											boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
										},
									}}
								>
									<RhfTextField
										name={`timesOfDay.${index}.hour`}
										placeholder="08"
										size="small"
										type="number"
										inputProps={{ min: 1, max: 12, style: { textAlign: "center" } }}
										sx={{
											width: 50,
											mb: 0,
											"& .MuiOutlinedInput-root": {
												backgroundColor: "transparent",
												fontSize: "1.25rem",
												fontWeight: 600,
												"& fieldset": { border: "none" },
												"& input": { padding: "4px 0" },
											},
										}}
									/>
									<Typography sx={{ fontSize: "1.25rem", fontWeight: 600, color: "#64748B" }}>:</Typography>
									<RhfTextField
										name={`timesOfDay.${index}.minute`}
										placeholder="00"
										size="small"
										type="number"
										inputProps={{ min: 0, max: 59, style: { textAlign: "center" } }}
										sx={{
											width: 50,
											mb: 0,
											"& .MuiOutlinedInput-root": {
												backgroundColor: "transparent",
												fontSize: "1.25rem",
												fontWeight: 600,
												"& fieldset": { border: "none" },
												"& input": { padding: "4px 0" },
											},
										}}
									/>
									<RhfTextField
										name={`timesOfDay.${index}.period`}
										type="hidden"
										value="AM"
										sx={{ display: "none" }}
									/>
									<Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
										{["AM", "PM"].map((period) => (
											<Box
												key={period}
												onClick={() => {
													// For now, just use AM as default since the Controller was causing issues
												}}
												sx={{
													px: 1.75,
													py: 0.625,
													borderRadius: "100px",
													cursor: "pointer",
													fontSize: "0.75rem",
													fontWeight: 600,
													transition: "all 0.2s ease-in-out",
													backgroundColor: period === "AM" ? "#1A1C2E" : "transparent",
													color: period === "AM" ? "#FFFFFF" : "#9CA3AF",
													"&:hover": {
														backgroundColor: period === "AM" ? "#2D3047" : "rgba(0, 0, 0, 0.04)",
													},
												}}
											>
												{period}
											</Box>
										))}
									</Box>
								</Box>
								{timeFields.length > 1 && <RemoveButton onClick={() => removeTime(index)} />}
							</Box>
						</motion.div>
					))}
			</Stack>
		</Box>
	);
};
