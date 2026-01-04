import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { AddIcon } from "@connected-repo/ui-mui/icons/AddIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { motion } from "framer-motion";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RemoveButton } from "./RemoveButton";

export const InstructionsFieldArray = () => {
	const { control } = useFormContext();
	const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
		control,
		name: "instructions",
	});

	return (
		<Box>
			<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
				<Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500 }}>
					Instructions
				</Typography>
			<Box
				onClick={() => appendInstruction({ value: "" })}
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
					{instructionFields.map((field, index) => (
						<motion.div
							key={field.id}
							initial={{ opacity: 0, x: -20, height: 0 }}
							animate={{ opacity: 1, x: 0, height: "auto" }}
							exit={{ opacity: 0, x: 20, height: 0 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							style={{ overflow: "hidden" }}
						>
							<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
								<RhfTextField
									name={`instructions.${index}.value`}
									placeholder="e.g., Take with food"
									size="small"
									fullWidth
									sx={{
										mb: 0,
										"& .MuiOutlinedInput-root": {
											borderRadius: "100px",
											backgroundColor: "rgba(248, 250, 252, 0.8)",
											fontSize: "0.875rem",
											"& fieldset": { border: "1px solid rgba(0, 0, 0, 0.06)" },
											"&:hover fieldset": { border: "1px solid rgba(0, 0, 0, 0.12)", backgroundColor: "#FFFFFF" },
											"&.Mui-focused fieldset": { border: "2px solid #BAE6FD", backgroundColor: "#FFFFFF" },
										},
									}}
								/>
								{instructionFields.length > 1 && <RemoveButton onClick={() => removeInstruction(index)} />}
							</Box>
						</motion.div>
					))}
			</Stack>
		</Box>
	);
};
