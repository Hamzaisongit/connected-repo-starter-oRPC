import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import type { userStackSelectAllZod } from "@connected-repo/zod-schemas/user_stack.zod";
import type { z } from "zod";

type UserStack = z.infer<typeof userStackSelectAllZod>;

interface UserStackCardViewProps {
	stacks: UserStack[];
	onStackClick: (stackId: string) => void;
}

export function UserStackCardView({ stacks, onStackClick }: UserStackCardViewProps) {
	const formatDays = (days: string | string[]) => {
		const daysArray = Array.isArray(days) ? days : [days];
		if (daysArray.length === 7) return "Every day";
		if (daysArray.length === 0) return "No schedule";
		return daysArray.slice(0, 3).join(", ") + (daysArray.length > 3 ? "..." : "");
	};

	const formatTimes = (times: string[]) => {
		if (times.length === 0) return "No times set";
		return times.join(", ");
	};

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: {
					xs: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				},
				gap: { xs: 2, sm: 2.5, lg: 3 },
				width: "100%",
				maxWidth: "100%",
				overflow: "hidden",
			}}
		>
			{stacks.map((stack) => (
				<Box
					key={stack.id}
					sx={{
						display: "flex",
						minHeight: 0,
						minWidth: 0,
					}}
				>
					<Card
						onClick={() => onStackClick(stack.id)}
						sx={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							cursor: "pointer",
							border: "1px solid",
							borderColor: "divider",
							transition: "all 0.25s ease-in-out",
							"&:hover": {
								transform: "translateY(-6px)",
								boxShadow: 6,
								borderColor: "primary.main",
							},
						}}
					>
						<CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 2, sm: 2.5, lg: 3 } }}>
							{/* Status and Name Section */}
							<Box sx={{ mb: 2 }}>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
									<Chip
										label={stack.isActive ? "Active" : "Inactive"}
										color={stack.isActive ? "success" : "default"}
										size="small"
										sx={{
											fontWeight: 600,
											fontSize: "0.7rem",
										}}
									/>
								</Box>
								<Typography
									variant="h6"
									color="text.primary"
									fontWeight={600}
									sx={{
										lineHeight: 1.3,
										mb: 1,
									}}
								>
									{stack.name}
								</Typography>
							</Box>

							{/* Dosage and Unit */}
							<Box sx={{ mb: 2 }}>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ fontWeight: 500 }}
								>
									Dosage: {stack.dosage} {stack.unit}
								</Typography>
							</Box>

							{/* Schedule Info */}
							<Box sx={{ mb: 2 }}>
								<Typography
									variant="caption"
									color="text.secondary"
									display="block"
									sx={{ mb: 0.5 }}
								>
									Days: {formatDays(stack.days)}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									display="block"
								>
									Times: {formatTimes(stack.timesOfDay)}
								</Typography>
							</Box>

							{/* Instructions Preview */}
							{stack.instructions.length > 0 && (
								<Typography
									variant="body2"
									color="text.primary"
									sx={{
										flexGrow: 1,
										lineHeight: 1.5,
										overflow: "hidden",
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
									}}
								>
									{stack.instructions.slice(0, 2).join(" ")}
									{stack.instructions.length > 2 && "..."}
								</Typography>
							)}

							{/* Footer */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-end",
									alignItems: "center",
									pt: 2,
									mt: "auto",
									borderTop: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography
									variant="caption"
									color="primary.main"
									fontWeight={600}
									sx={{
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									View Details →
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Box>
			))}
		</Box>
	);
}