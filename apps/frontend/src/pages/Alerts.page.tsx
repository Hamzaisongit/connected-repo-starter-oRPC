import { Alert as MuiAlert } from "@mui/material";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import Button from "@mui/material/Button";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const AlertsPage = () => {
	const alerts = [
		{
			id: "1",
			severity: "error" as const,
			icon: <LocalFireDepartmentIcon />,
			title: "You're about to break your streak!",
			description: "You haven't taken any scheduled supplements for 2 days. Taking your supplements consistently is key to maintaining good health.",
			time: "2 days",
			actionable: true,
			actionText: "Go to Home",
		},
		{
			id: "2",
			severity: "warning" as const,
			icon: <WarningIcon />,
			title: "Upcoming supplement due",
			description: "You have a supplement scheduled for today that hasn't been taken yet. Remember to take it on time to maintain your adherence.",
			time: "Today at 18:35",
			actionable: false,
		},
		{
			id: "3",
			severity: "info" as const,
			icon: <InfoIcon />,
			title: "New supplement added to schedule",
			description: "You've successfully added Vitamin D3 to your daily supplement schedule. Remember to take it with food for better absorption.",
			time: "Just now",
			actionable: false,
		},
		{
			id: "4",
			severity: "error" as const,
			icon: <ErrorIcon />,
			title: "Medication interaction warning",
			description: "Taking Iron and Calcium supplements together may reduce absorption. Consider taking them at least 2 hours apart for maximum effectiveness.",
			time: "Today",
			actionable: false,
		},
		{
			id: "5",
			severity: "warning" as const,
			icon: <HealthAndSafetyIcon />,
			title: "Low supplement stock",
			description: "Your Fish Oil supplement is running low. You have approximately 3 days of supply remaining. Consider reordering soon.",
			time: "3 days left",
			actionable: true,
			actionText: "Order More",
		},
		{
			id: "6",
			severity: "info" as const,
			icon: <MedicationLiquidIcon />,
			title: "Streak milestone achieved!",
			description: "Congratulations! You've maintained a 10-day supplement adherence streak. Keep up the great work!",
			time: "10 days streak",
			actionable: false,
		},
	];

	const errorAlerts = alerts.filter((a) => a.severity === "error");
	const warningAlerts = alerts.filter((a) => a.severity === "warning");
	const infoAlerts = alerts.filter((a) => a.severity === "info");

	const AlertCard = ({ alert }: { alert: typeof alerts[0] }) => {
		const getAlertColor = () => {
			switch (alert.severity) {
				case "error":
					return "#ef4444";
				case "warning":
					return "#f59e0b";
				case "info":
					return "#3b82f6";
				default:
					return "#6b7280";
			}
		};

		const getAlertBg = () => {
			switch (alert.severity) {
				case "error":
					return "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
				case "warning":
					return "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
				case "info":
					return "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)";
				default:
					return "background.paper";
			}
		};

		return (
			<Card
				sx={{
					p: 0,
					borderRadius: 3,
					overflow: "hidden",
					transition: "all 0.3s ease-in-out",
					"&:hover": {
						transform: "translateY(-4px)",
						boxShadow: 4,
					},
				}}
			>
				<Box
					sx={{
						borderLeft: 4,
						borderColor: getAlertColor(),
					}}
				>
					<Box
						sx={{
							p: 3,
							background: getAlertBg(),
						}}
					>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
								<Box
									sx={{
										p: 1.5,
										borderRadius: 2,
										background: getAlertColor(),
										color: "white",
									}}
								>
									{alert.icon}
								</Box>
								<Stack sx={{ flex: 1 }}>
									<Typography variant="h6" fontWeight={600} gutterBottom>
										{alert.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{alert.description}
									</Typography>
								</Stack>
							</Stack>
							<Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
								{alert.time}
							</Typography>
						</Box>
						{alert.actionable && (
							<Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
								<Button
									variant="text"
									endIcon={<ArrowForwardIcon />}
									sx={{
										color: getAlertColor(),
										fontWeight: 600,
										"&:hover": {
											backgroundColor: "action.hover",
										},
									}}
								>
									{alert.actionText}
								</Button>
							</Box>
						)}
					</Box>
				</Box>
			</Card>
		);
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				py: { xs: 3, md: 4 },
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={4}>
					<Typography variant="h4" fontWeight={600}>
						Alerts & Notifications
					</Typography>

					{errorAlerts.length > 0 && (
						<MuiAlert
							severity="error"
							sx={{
								borderRadius: 2,
								boxShadow: 1,
							}}
						>
							<Typography variant="body2" fontWeight={500}>
								{errorAlerts.length} critical alert{errorAlerts.length > 1 ? "s" : ""} requiring your attention
							</Typography>
						</MuiAlert>
					)}

					{errorAlerts.length === 0 && warningAlerts.length > 0 && (
						<MuiAlert
							severity="warning"
							sx={{
								borderRadius: 2,
								boxShadow: 1,
							}}
						>
							<Typography variant="body2" fontWeight={500}>
								{warningAlerts.length} warning{warningAlerts.length > 1 ? "s" : ""} - review your supplements schedule
							</Typography>
						</MuiAlert>
					)}

					{errorAlerts.length === 0 && warningAlerts.length === 0 && infoAlerts.length > 0 && (
						<MuiAlert
							severity="info"
							sx={{
								borderRadius: 2,
								boxShadow: 1,
							}}
						>
							<Typography variant="body2" fontWeight={500}>
								{infoAlerts.length} update{infoAlerts.length > 1 ? "s" : ""} regarding your supplements
							</Typography>
						</MuiAlert>
					)}

					{errorAlerts.length === 0 && warningAlerts.length === 0 && infoAlerts.length === 0 && (
						<Card
							sx={{
								p: 4,
								textAlign: "center",
								borderRadius: 3,
							}}
						>
							<InfoIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
							<Typography variant="h6" color="text.secondary" gutterBottom>
								No alerts
							</Typography>
							<Typography variant="body2" color="text.secondary">
								You're all caught up! Keep maintaining your supplement routine.
							</Typography>
						</Card>
					)}

					<Stack spacing={3}>
						<Typography variant="h5" fontWeight={600}>
							Critical Alerts ({errorAlerts.length})
						</Typography>
						{errorAlerts.length === 0 ? (
							<Card
								sx={{
									p: 4,
									textAlign: "center",
									borderRadius: 3,
								}}
							>
								<Typography variant="body2" color="text.secondary">
									No critical alerts
								</Typography>
							</Card>
						) : (
							<Stack spacing={2}>
								{errorAlerts.map((alert) => (
									<AlertCard key={alert.id} alert={alert} />
								))}
							</Stack>
						)}
					</Stack>

					{warningAlerts.length > 0 && (
						<Stack spacing={3}>
							<Typography variant="h5" fontWeight={600}>
								Warnings ({warningAlerts.length})
							</Typography>
							<Stack spacing={2}>
								{warningAlerts.map((alert) => (
									<AlertCard key={alert.id} alert={alert} />
								))}
							</Stack>
						</Stack>
					)}

					{infoAlerts.length > 0 && (
						<Stack spacing={3}>
							<Typography variant="h5" fontWeight={600}>
								Updates ({infoAlerts.length})
							</Typography>
							<Stack spacing={2}>
								{infoAlerts.map((alert) => (
									<AlertCard key={alert.id} alert={alert} />
								))}
							</Stack>
						</Stack>
					)}
				</Stack>
			</Container>
		</Box>
	);
};

export default AlertsPage;