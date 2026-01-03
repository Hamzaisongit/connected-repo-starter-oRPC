import { DashboardIcon } from "@connected-repo/ui-mui/icons/DashboardIcon";
import { GridViewIcon } from "@connected-repo/ui-mui/icons/GridViewIcon";
import { HomeIcon } from "@connected-repo/ui-mui/icons/HomeIcon";
import { PostAddIcon } from "@connected-repo/ui-mui/icons/PostAddIcon";

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
		label: "Dashboard",
		path: "/dashboard",
		desktopIcon: <DashboardIcon fontSize="small" />,
		mobileIcon: <HomeIcon />, // Different icon for mobile
	},
	{
		label: "My Stack",
		path: "/user-stack",
		desktopIcon: <GridViewIcon fontSize="small" />,
		mobileIcon: <GridViewIcon />,
	},
	{
		label: "Add to Stack",
		path: "/user-stack/new",
		desktopIcon: <PostAddIcon fontSize="small" />,
		mobileIcon: <PostAddIcon />,
	},
];
