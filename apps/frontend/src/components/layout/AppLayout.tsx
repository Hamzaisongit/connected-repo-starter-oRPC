import { useEffect } from "react";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet, useLoaderData } from "react-router";
import { useThemeMode } from "@connected-repo/ui-mui/theme/ThemeContext";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileNavbar } from "./MobileNavbar";

/**
 * AppLayout - Main layout wrapper for authenticated pages
 *
 * Responsive behavior:
 * - Mobile (< md): Bottom navigation with profile button
 * - Desktop (>= md): Top navigation bar with links
 *
 * Session data is loaded by authLoader and passed to children via Outlet context
 * Child components access it via useOutletContext<SessionInfo>()
 */
export const AppLayout = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Get session data from authLoader
	const sessionInfo = useLoaderData() as SessionInfo;

	const { setThemeMode } = useThemeMode();

	useEffect(() => {
		if (sessionInfo.user?.themeSetting) {
			setThemeMode(sessionInfo.user.themeSetting);
		}
	}, [sessionInfo.user?.themeSetting, setThemeMode]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				background: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
				position: "relative",
			}}
		>
			{isMobile ? <MobileNavbar /> : <DesktopNavbar />}

			{/* Main content area */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					pt: { xs: 2, md: 3 },
					pb: { xs: 10, md: 3 }, // Extra padding bottom on mobile for bottom nav
					position: "relative",
					zIndex: 1,
					// Remove horizontal padding to allow full-width centering
					px: 0,
				}}
			>
				<Outlet context={sessionInfo} />
			</Box>
		</Box>
	);
};
