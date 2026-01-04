import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { memo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { InstructionsFieldArray } from "./InstructionsFieldArray";

let moreSectionRenderCount = 0;

export const MoreSection = memo(() => {
	const renderCount = ++moreSectionRenderCount;
	
	const [showMore, setShowMore] = useState(false);
	const { control } = useFormContext();
	
	const prevControlRef = useRef(control);
	const prevShowMoreRef = useRef(showMore);
	
	// Track if control object reference changed
	if (prevControlRef.current !== control) {
		prevControlRef.current = control;
	}
	
	// Track showMore state changes
	if (prevShowMoreRef.current !== showMore) {
		prevShowMoreRef.current = showMore;
	}

	return (
		<>
		{/* More/Less Toggle */}
		<Box 
			onClick={() => setShowMore(!showMore)}
			sx={{ textAlign: "center", py: 0.5 }}
		>
				<Typography 
					sx={{ 
						color: "#075985", 
						fontSize: "0.875rem", 
						fontWeight: 500, 
						textDecoration: "underline",
						cursor: "pointer",
						display: "inline-block",
						"&:hover": { color: "#0C4A6E" } 
					}}
				>
					{showMore ? "Less" : "More"}
				</Typography>
			</Box>

			{/* Collapsible More Content */}
			{showMore && (
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
					<InstructionsFieldArray />

					<Box 
						sx={{ 
							display: "flex", 
							alignItems: "center", 
							justifyContent: "space-between", 
							py: 1, 
							px: 2.5, 
							borderRadius: "100px", 
							backgroundColor: "rgba(248, 250, 252, 0.8)", 
							border: "1px solid rgba(0, 0, 0, 0.06)" 
						}}
					>
						<Typography variant="body2" sx={{ color: "#1A1C2E", fontWeight: 500, fontSize: "0.875rem" }}>
							Active in my stack
						</Typography>
						<Controller
							name="isActive"
							control={control}
							render={({ field }) => (
								<Switch
									checked={field.value}
									onChange={field.onChange}
									sx={{
										"& .MuiSwitch-switchBase.Mui-checked": { color: "#BAE6FD" },
										"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#7DD3FC" },
									}}
								/>
							)}
						/>
					</Box>
				</Box>
			)}
		</>
	);
});

MoreSection.displayName = "MoreSection";
