import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { AppBar } from "@connected-repo/ui-mui/navigation/AppBar";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { Toolbar } from "@connected-repo/ui-mui/navigation/Toolbar";
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

/**
 * DesktopNavbar - Top navigation bar for desktop layout
 *
 * Features:
 * - App logo/brand
 * - Navigation links (Dashboard, Posts, Create Post)
 * - User profile avatar on right
 * - Sticky position
 */
export const DesktopNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	return (
		<AppBar
			position="sticky"
			elevation={0}
			sx={{
				background: "transparent",
				backdropFilter: "blur(10px)",
				WebkitBackdropFilter: "blur(10px)", // Safari support
				borderBottom: "none",
			}}
		>
			<Toolbar sx={{ gap: 2, px: 3, justifyContent: "space-between" }}>
				{/* Logo/Brand */}
				<Box
					onClick={() => navigate("/dashboard")}
					sx={{
						display: "flex",
						alignItems: "center",
						cursor: "pointer",
						transition: "transform 0.2s ease-in-out",
						"&:hover": {
							transform: "scale(1.02)",
						},
					}}
				>
					<Typography
						variant="h6"
						component="div"
						sx={{
							fontFamily: '"Playfair Display", Georgia, serif',
							fontWeight: 600,
							color: "primary.main",
							letterSpacing: "0.02em",
						}}
					>
						HelioCoach
					</Typography>
				</Box>

				{/* Navigation Links */}
				<Box sx={{ display: "flex", gap: 1 }}>
					{navItems.map((item) => (
						<Button
							key={item.path}
							onClick={() => navigate(item.path)}
							startIcon={item.desktopIcon}
							sx={{
								px: 2,
								py: 1,
								borderRadius: "32px",
								color: isActive(item.path)
									? "primary.main"
									: "text.secondary",
								bgcolor: isActive(item.path)
									? "primary.lighter"
									: "transparent",
								fontWeight: isActive(item.path) ? 600 : 500,
								transition: "all 0.2s ease-in-out",
								minHeight: "auto",
								"&:hover": {
									bgcolor: isActive(item.path)
										? "primary.light"
										: "action.hover",
									transform: "translateY(-2px)",
								},
								"&:active": {
									transform: "translateY(0)",
								},
							}}
						>
							{item.label}
						</Button>
					))}
				</Box>

				{/* User Profile Avatar */}
				<ProfileAvatar />
			</Toolbar>
		</AppBar>
	);
};
