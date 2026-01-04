import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { navItems } from "@frontend/config/nav.config";
import { useLoaderData, useLocation, useNavigate } from "react-router";

/**
 * ProfileAvatar - Simple clickable avatar that navigates to profile
 */
const ProfileAvatar = () => {
	const navigate = useNavigate();
	const sessionInfo = useLoaderData() as SessionInfo | undefined;
	const user = sessionInfo?.user;

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
					borderColor: "#ffffff",
					background: user?.image ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.12)",
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
					background: "rgba(255, 255, 255, 0.7)",
					backdropFilter: "blur(20px)",
					WebkitBackdropFilter: "blur(20px)", // Safari support
					boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.06)",
					border: "1px solid rgba(255, 255, 255, 0.3)",
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
								color: location.pathname === item.path ? "#1A1C2E" : "#CBD5E1",
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
