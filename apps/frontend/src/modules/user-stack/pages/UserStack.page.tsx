import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { ToggleButton } from "@connected-repo/ui-mui/form/ToggleButton";
import { ToggleButtonGroup } from "@connected-repo/ui-mui/form/ToggleButtonGroup";
import { AddIcon } from "@connected-repo/ui-mui/icons/AddIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { UserStackEmptyState } from "@frontend/modules/user-stack/components/UserStackEmptyState";
import { orpc } from "@frontend/utils/orpc.client";
import { getStockIconAndColor } from "@frontend/utils/supplement.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";

type StatusFilter = "all" | "active" | "inactive";

// Helper function to format days as short form
const formatDaysShort = (days: string | string[]) => {
	const daysArray = Array.isArray(days) ? days : [days];
	if (daysArray.length === 7) return "Daily";

	const shortDays = daysArray.map(day => day.substring(0, 3)).slice(0, 3);
	return shortDays.join(",");
};



export default function UserStackPage() {
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

	const queryClient = useQueryClient();
	const { data: userStacks, isLoading, error } = useQuery(orpc.userStacks.getAll.queryOptions());

	const updateStackMutation = useMutation(orpc.userStacks.update.mutationOptions());

	const handleStatusFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilter: StatusFilter | null) => {
		if (newFilter !== null) {
			setStatusFilter(newFilter);
		}
	};

	const handleToggleActive = async (stackId: string, isActive: boolean) => {
		try {
			await updateStackMutation.mutateAsync({
				id: stackId,
				isActive: !isActive,
			});
			// Invalidate and refetch stacks
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getAll.queryKey() });
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getTodaysPlan.queryKey() });
		} catch (error) {
			console.error("Failed to update stack status:", error);
		}
	};

	const handleStackClick = (stackId: string) => {
		navigate(`/user-stack/${stackId}`);
	};

	const filteredStacks = userStacks?.filter((stack) => {
		if (statusFilter === "all") return true;
		if (statusFilter === "active") return stack.isActive;
		if (statusFilter === "inactive") return !stack.isActive;
		return true;
	}) || [];

	if (isLoading) return <LoadingSpinner text="Loading user stack..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading user stack: ${errorMessage}`} />
			</Container>
		);
	}

	if (!userStacks || userStacks.length === 0) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<UserStackEmptyState />
			</Container>
		);
	}

	return (
		<Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, pb: 12 }}> {/* Reasonable bottom padding */}
			{/* Background Shape */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "300px",
					background: "radial-gradient(ellipse 80% 50% at 20% 30%, rgba(173, 216, 230, 0.3) 0%, rgba(221, 160, 221, 0.2) 50%, transparent 100%)",
					filter: "blur(40px)",
					zIndex: -1,
					borderRadius: "0 0 50% 50%",
				}}
			/>

			{/* Header */}
			<Box sx={{ mb: 3, textAlign: "center" }}>
				<Typography
					variant="h4"
					component="h1"
					sx={{
						fontFamily: '"Playfair Display", Georgia, serif',
						fontSize: "1.75rem",
						fontWeight: 700,
						color: "#1A1C2E",
						mb: 0.5,
					}}
				>
					My Stack
				</Typography>
				<Typography
					sx={{
						fontSize: "0.875rem",
						color: "#64748B",
						lineHeight: 1.5,
					}}
				>
					Manage your supplements.
				</Typography>
			</Box>

			{/* Filters */}
			<Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
				<ToggleButtonGroup
					value={statusFilter}
					exclusive
					onChange={handleStatusFilterChange}
					aria-label="status filter"
					sx={{
						backgroundColor: "rgba(255, 255, 255, 0.8)",
						borderRadius: "24px",
						boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
						p: 0.25,
						"& .MuiToggleButton-root": {
							borderRadius: "20px",
							border: "none",
							color: "#666666",
							textTransform: "none",
							fontWeight: 500,
							fontSize: "0.75rem",
							px: 2,
							py: 1,
							minWidth: "auto",
							flex: 1,
							transition: "all 0.2s ease",
							"&.Mui-selected": {
								backgroundColor: "#1A1C2E",
								color: "#ffffff",
								"&:hover": {
									backgroundColor: "#2D3047",
								},
							},
							"&:hover": {
								backgroundColor: "rgba(0, 0, 0, 0.05)",
							},
						},
					}}
				>
					<ToggleButton value="all">All</ToggleButton>
					<ToggleButton value="active">Active</ToggleButton>
					<ToggleButton value="inactive">Inactive</ToggleButton>
				</ToggleButtonGroup>
			</Box>

			{/* Uniform Stack Gallery */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						md: "repeat(3, 1fr)",
					},
					gap: 3,
				}}
			>
				{filteredStacks.map((stack) => {
					const isInactive = !stack.isActive;
					const stockIconData = getStockIconAndColor(stack.name);
					return (
						<Box
							key={stack.id}
							sx={{
								position: "relative",
							}}
						>
							{/* 3D Overlapping Circular Image with Themed Background - Positioned outside card */}
							<Box
								sx={{
									position: "absolute",
									top: -15,
									left: 35,
									width: 70,
									height: 70,
									borderRadius: "50%",
									backgroundColor: stockIconData.bgColor,
									border: "4px solid rgba(255, 255, 255, 0.9)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "2rem",
									boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
									zIndex: 3,
									transition: "all 0.3s ease-in-out",
								}}
							>
								{stockIconData.icon}
							</Box>

							<Box
								onClick={() => handleStackClick(stack.id)}
								sx={{
									borderRadius: "32px", // Larger radius for premium feel
									backgroundColor: "rgba(255, 255, 255, 0.5)", // No borders, pure glass
									backdropFilter: "blur(15px)",
									WebkitBackdropFilter: "blur(15px)",
									boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1)",
									p: 3,
									height: "100%",
									cursor: "pointer",
									transition: "all 0.3s ease-in-out",
									filter: isInactive ? "grayscale(0.6)" : "none",
									opacity: isInactive ? 0.4 : 1, // More pronounced inactive state
									position: "relative",
									"&:hover": {
										transform: "translateY(-5px) scale(1.02)", // More pronounced lift
										boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.15)",
									},
								}}
							>

								{/* Active/Inactive Toggle Switch */}
								<Box
									sx={{
										position: "absolute",
										top: 20,
										right: 20,
										zIndex: 3, // Higher z-index to ensure it's above card
									}}
									onClick={(event) => {
										event.stopPropagation();
										event.preventDefault();
										handleToggleActive(stack.id, stack.isActive);
									}}
									onMouseDown={(event) => {
										event.stopPropagation();
									}}
									onMouseUp={(event) => {
										event.stopPropagation();
									}}
								>
									<Switch
										checked={stack.isActive}
										disabled={updateStackMutation.isPending}
										sx={{
											"& .MuiSwitch-switchBase.Mui-checked": {
												color: "#4CAF50",
												"&:hover": {
													backgroundColor: "rgba(76, 175, 80, 0.08)",
												},
											},
											"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
												backgroundColor: "#4CAF50",
											},
											"& .MuiSwitch-track": {
												backgroundColor: "#9E9E9E",
											},
											pointerEvents: "none", // Disable pointer events on switch itself
										}}
									/>
								</Box>

								{/* Content Area */}
								<Box sx={{ pt: 5 }}> {/* Standard padding for uniform cards */}
									{/* Line 1: Supplement Name (Bold Serif) */}
									<Typography
										sx={{
											fontFamily: '"Playfair Display", Georgia, serif',
											fontWeight: 700,
											fontSize: "1.4rem",
											color: "#000000",
											mb: 1.5,
											lineHeight: 1.2,
										}}
									>
										{stack.name}
									</Typography>

									{/* Line 2: Dosage */}
									<Typography
										sx={{
											fontSize: "1.1rem",
											fontWeight: 600,
											color: "#333333",
											mb: 1.5,
										}}
									>
										{stack.dosage} {stack.unit}
									</Typography>

									{/* Line 3: Frequency with days and times */}
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<span style={{ fontSize: "1.1rem" }}>
											{Array.isArray(stack.days) && stack.days.length === 7 ? "📅" : "⏰"}
										</span>
										<Typography
											sx={{
												fontSize: "1rem",
												color: "#666666",
												fontWeight: 500,
											}}
										>
											{Array.isArray(stack.days) && stack.days.length === 7
												? `Daily • ${Array.isArray(stack.timesOfDay) ? stack.timesOfDay.join(", ") : "No times"}`
												: Array.isArray(stack.days)
												? `${formatDaysShort(stack.days)} • ${Array.isArray(stack.timesOfDay) ? stack.timesOfDay.join(", ") : "No times"}`
												: "No schedule"}
										</Typography>
									</Box>

									{/* Tap indicator */}
									<Box
										sx={{
											position: "absolute",
											bottom: 16,
											right: 16,
											display: "flex",
											alignItems: "center",
											gap: 0.5,
											opacity: 0.7,
										}}
									>
										<Typography
											sx={{
												fontSize: "0.75rem",
												color: "#666666",
												fontWeight: 500,
											}}
										>
											View
										</Typography>
										<span style={{ fontSize: "0.875rem", color: "#666666" }}>→</span>
									</Box>
								</Box>
							</Box>
						</Box>
					);
				})}
			</Box>

			{/* Floating Action Button with Soft Glow */}
			<motion.div
				whileHover={{ y: -2, scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				style={{
					position: "fixed",
					bottom: 100,
					right: 24,
					zIndex: 1000,
				}}
			>
				<Button
					onClick={() => navigate("/user-stack/new")}
					sx={{
						width: 64,
						height: 64,
						borderRadius: "50%",
						background: "linear-gradient(135deg, #1A1C2E 0%, #2D3154 100%)",
						color: "#ffffff",
						boxShadow: "0px 8px 32px rgba(26, 28, 46, 0.4), 0px 0px 24px rgba(135, 206, 235, 0.3)",
						"&:hover": {
							background: "linear-gradient(135deg, #2D3047 0%, #3D4166 100%)",
							boxShadow: "0px 12px 48px rgba(26, 28, 46, 0.6), 0px 0px 32px rgba(135, 206, 235, 0.5)",
						},
						transition: "all 0.3s ease",
					}}
				>
					<AddIcon sx={{ fontSize: 28 }} />
				</Button>
			</motion.div>
		</Container>
	);
}