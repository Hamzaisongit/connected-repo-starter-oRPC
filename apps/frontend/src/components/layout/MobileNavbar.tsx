import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { BottomNavigation } from "@connected-repo/ui-mui/navigation/BottomNavigation";
import { BottomNavigationAction } from "@connected-repo/ui-mui/navigation/BottomNavigationAction";
import { AccountCircleIcon } from "@connected-repo/ui-mui/icons/AccountCircleIcon";
import { navItems } from "@frontend/config/nav.config";
import { useLocation, useNavigate } from "react-router";

export const MobileNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Map paths to bottom nav indices
	const getBottomNavValue = () => {
		// Check navigation items first
		const navIndex = navItems.findIndex(item => item.path === location.pathname);
		if (navIndex !== -1) return navIndex;

		// Profile is the last item
		if (location.pathname === "/profile") return navItems.length;

		return 0; // Default to first nav item (Dashboard)
	};

	const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
		// If profile is clicked (last item), navigate to profile
		if (newValue === navItems.length) {
			navigate("/profile");
			return;
		}

		// Navigate to the selected nav item
		const item = navItems[newValue];
		if (item) {
			navigate(item.path);
		}
	};

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
				<BottomNavigation
					value={getBottomNavValue()}
					onChange={handleBottomNavChange}
					showLabels={false}
					sx={{
						height: 64,
						background: "transparent",
						borderRadius: "100px",
						"& .MuiBottomNavigationAction-root": {
							minWidth: 60,
							px: 0,
							color: "#CBD5E1", // Inactive: light grey
							transition: "all 0.3s ease-in-out",
							"&.Mui-selected": {
								color: "#1A1C2E", // Active: deep navy
								"& .MuiSvgIcon-root": {
									transform: "scale(1.2)",
								},
							},
							"&:active": {
								transform: "scale(0.95)",
							},
							"& .MuiSvgIcon-root": {
								fontSize: "1.5rem",
								transition: "transform 0.3s ease-in-out",
							},
						},
					}}
				>
					{/* Navigation items from config */}
					{navItems.map((item) => (
						<BottomNavigationAction
							key={item.path}
							icon={item.mobileIcon || item.desktopIcon}
						/>
					))}
					{/* Profile button */}
					<BottomNavigationAction icon={<AccountCircleIcon />} />
				</BottomNavigation>
			</Paper>
		</>
	);
};
