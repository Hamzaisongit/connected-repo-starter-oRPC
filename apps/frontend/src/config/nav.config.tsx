import { HomeIcon } from "@connected-repo/ui-mui/icons/HomeIcon";
import { DashboardIcon } from "@connected-repo/ui-mui/icons/DashboardIcon";
import { ErrorOutlineIcon } from "@connected-repo/ui-mui/icons/ErrorOutlineIcon";
import { AccountCircleIcon } from "@connected-repo/ui-mui/icons/AccountCircleIcon";

interface NavItem {
	/** Display label for the nav item */
	label: string;
	/** Route path */
	path: string;
	/** Icon for desktop navbar */
	desktopIcon: React.ReactNode;
	/** Icon for mobile navbar (optional, defaults to desktopIcon) */
	mobileIcon?: React.ReactNode;
}

/**
 * Main navigation items for the application
 * Used by both DesktopNavbar and MobileNavbar
 */
export const navItems: NavItem[] = [
	{
		label: "Home",
		path: "/home",
		desktopIcon: <HomeIcon fontSize="small" />,
		mobileIcon: <HomeIcon />,
	},
	{
		label: "Alerts",
		path: "/alerts",
		desktopIcon: <ErrorOutlineIcon fontSize="small" />,
		mobileIcon: <ErrorOutlineIcon />,
	},
	{
		label: "Insights",
		path: "/insights",
		desktopIcon: <DashboardIcon fontSize="small" />,
		mobileIcon: <DashboardIcon />,
	},
	{
		label: "Profile",
		path: "/profile",
		desktopIcon: <AccountCircleIcon fontSize="small" />,
		mobileIcon: <AccountCircleIcon />,
	},
];
