import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { navItems } from "@frontend/config/nav.config";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { alpha, useTheme } from "@mui/material/styles";
import { useLoaderData, useLocation, useNavigate } from "react-router";

/**
 * ProfileAvatar - Simple clickable avatar that navigates to profile
 */
const ProfileAvatar = () => {
	const navigate = useNavigate();
	const sessionInfo = useLoaderData() as SessionInfo | undefined;
	const user = sessionInfo?.user;
	const theme = useTheme();

	return (
		<IconButton
			onClick={() => navigate("/profile")}
			size="small"
			sx={{
				transition: "transform 0.2s ease-in-out",
				"&:hover": {
					transform: "scale(1.05)",
				},
			}}
			aria-label="Go to profile"
		>
			<Avatar
				src={user?.image || undefined}
				alt={user?.name || user?.email || "User"}
				sx={{
					width: 40,
					height: 40,
					border: "2px solid",
					borderColor: theme.palette.divider,
					background: user?.image ? "transparent" : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					boxShadow: theme.shadows[2],
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						boxShadow: theme.shadows[3],
					},
				}}
			>
				{!user?.image && (user?.name?.[0] || user?.email?.[0] || "U")}
			</Avatar>
		</IconButton>
	);
};

export const MobileNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useTheme();


  return (
		<>
			{/* Floating Glass Bottom Navigation - Pill Style */}
			<Paper
				sx={{
					position: "fixed",
					bottom: 24,
					left: 16,
					right: 16,
					zIndex: 1000,
					borderRadius: "100px",
					background: alpha(theme.palette.background.paper, 0.7),
					backdropFilter: "blur(20px)",
					WebkitBackdropFilter: "blur(20px)", // Safari support
					boxShadow: theme.shadows[5],
					border: `1px solid ${alpha(theme.palette.background.paper, 0.3)}`,
					overflow: "hidden",
				}}
				elevation={0}
			>
				<Box sx={{ 
					display: "flex", 
					alignItems: "center", 
					justifyContent: "space-between",
					height: 64,
					px: 2,
				}}>
					{/* Navigation items from config */}
					{navItems.map((item, index) => (
						<Box
							key={item.path}
							onClick={() => navigate(item.path)}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flex: 1,
								height: "100%",
								cursor: "pointer",
								color: location.pathname === item.path ? theme.palette.text.primary : theme.palette.text.disabled,
								transition: "all 0.3s ease-in-out",
								"&:active": {
									transform: "scale(0.95)",
								},
								"& .MuiSvgIcon-root": {
									fontSize: "1.5rem",
									transition: "transform 0.3s ease-in-out",
									transform: location.pathname === item.path ? "scale(1.2)" : "scale(1)",
								},
							}}
						>
							{item.mobileIcon || item.desktopIcon}
						</Box>
					))}
					{/* Profile Avatar */}
					<Box sx={{ 
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flex: 1,
					}}>
						<ProfileAvatar />
					</Box>
				</Box>
			</Paper>
		</>
	);
};
