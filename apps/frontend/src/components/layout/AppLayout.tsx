import { Box } from "@connected-repo/ui-mui/layout/Box";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Outlet, useLoaderData } from "react-router";
import { PwaInstallPrompt } from "../pwa/PwaInstallPrompt.pwa";
import { PwaUpdatePrompt } from "../pwa/PwaUpdatePrompt.pwa";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileNavbar } from "./MobileNavbar";

/**
 * AppLayout - Main layout wrapper for pages
 *
 * Responsive behavior:
 * - Mobile (< md): Bottom navigation + minimal top bar
 * - Desktop (>= md): Top navigation bar with links
 *
 * Session data is loaded by authLoader and passed to children via Outlet context
 * Child components access it via useOutletContext<SessionInfo>()
 */
export const AppLayout = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Get session data from authLoader (can be undefined)
	const sessionInfo = useLoaderData() as SessionInfo | undefined;

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				bgcolor: "background.default",
			}}
		>
			{isMobile ? <MobileNavbar /> : <DesktopNavbar />}

			{/* Main content area */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					pt: { xs: 2, md: 3 },
					pb: { xs: 15, md: 3 }, // Extra padding bottom on mobile for bottom nav
					px: { xs: 2, sm: 3, md: 4 },
					bgcolor: theme.palette.background.default
				}}
			>
				<Outlet context={sessionInfo || null} />
				<PwaInstallPrompt></PwaInstallPrompt>
				<PwaUpdatePrompt></PwaUpdatePrompt>
			</Box>
		</Box>
	);
};
