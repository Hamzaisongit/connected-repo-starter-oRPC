import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { AddIcon } from "@connected-repo/ui-mui/icons/AddIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router";

type EmptyStateVariant = "all" | "active" | "inactive";

interface UserStackEmptyStateProps {
	variant?: EmptyStateVariant;
}

const emptyStateContent: Record<EmptyStateVariant, { title: string; description: string; showAddButton: boolean }> = {
	all: {
		title: "No schedule yet",
		description: "Start your wellness journey by adding your first supplement to your daily routine.",
		showAddButton: true,
	},
	active: {
		title: "No active supplements",
		description: "You don't have any active supplements. Activate existing ones from your stack or add new supplements.",
		showAddButton: true,
	},
	inactive: {
		title: "No inactive supplements",
		description: "All your supplements are currently active. Great job staying on track with your wellness routine!",
		showAddButton: false,
	},
};

export function UserStackEmptyState({ variant = "all" }: UserStackEmptyStateProps) {
	const navigate = useNavigate();
	const theme = useTheme();
	const content = emptyStateContent[variant];

	return (
		<Box
			sx={{
				textAlign: "center",
				py: 8,
				px: 3,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			{/* Icon Container - Rounded Square with Calendar Icon */}
			<Box
				sx={{
					position: "relative",
					width: { xs: 120, md: 140 },
					height: { xs: 120, md: 140 },
					mb: 4,
					borderRadius: "32px",
					bgcolor: alpha(theme.palette.primary.main, 0.08),
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Calendar/Checklist Icon */}
				<Box
					sx={{
						width: { xs: 48, md: 56 },
						height: { xs: 56, md: 64 },
						borderRadius: "8px",
						bgcolor: "background.paper",
						boxShadow: theme.shadows[2],
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					{/* Calendar Header */}
					<Box
						sx={{
							height: "20%",
							bgcolor: theme.palette.primary.main,
						}}
					/>
					{/* Calendar Body with lines */}
					<Box
						sx={{
							flex: 1,
							p: 1,
							display: "flex",
							flexDirection: "column",
							gap: 0.5,
							justifyContent: "center",
						}}
					>
						<Box sx={{ height: 4, bgcolor: alpha(theme.palette.text.secondary, 0.2), borderRadius: 1, width: "80%" }} />
						<Box sx={{ height: 4, bgcolor: alpha(theme.palette.text.secondary, 0.2), borderRadius: 1, width: "60%" }} />
						<Box sx={{ height: 4, bgcolor: alpha(theme.palette.text.secondary, 0.2), borderRadius: 1, width: "70%" }} />
					</Box>
				</Box>

				{/* Plus Badge */}
				<Box
					sx={{
						position: "absolute",
						top: { xs: 12, md: 16 },
						right: { xs: 12, md: 16 },
						width: { xs: 28, md: 32 },
						height: { xs: 28, md: 32 },
						borderRadius: "50%",
						bgcolor: theme.palette.primary.main,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						boxShadow: theme.shadows[3],
					}}
				>
					<AddIcon sx={{ fontSize: { xs: 16, md: 18 }, color: "primary.contrastText" }} />
				</Box>
			</Box>

			<Typography
				variant="h5"
				color="text.primary"
				sx={{
					fontFamily: "serif",
					fontWeight: 600,
					mb: 1.5,
				}}
			>
				{content.title}
			</Typography>

			<Typography
				variant="body2"
				color="text.secondary"
				sx={{
					mb: 4,
					maxWidth: 320,
					lineHeight: 1.6,
				}}
			>
				{content.description}
			</Typography>

			{content.showAddButton && (
				<Button
					variant="contained"
					size="large"
					startIcon={<AddIcon />}
					onClick={() => navigate("/user-stack/new")}
					sx={{
						px: 4,
						py: 1.5,
						fontSize: "0.95rem",
						fontWeight: 600,
						textTransform: "none",
						borderRadius: "28px",
						boxShadow: `0px 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
						"&:hover": {
							boxShadow: `0px 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
						},
					}}
				>
					Add Supplement
				</Button>
			)}
		</Box>
	);
}
