import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { AppBar } from "@connected-repo/ui-mui/navigation/AppBar";
import { BottomNavigation } from "@connected-repo/ui-mui/navigation/BottomNavigation";
import { BottomNavigationAction } from "@connected-repo/ui-mui/navigation/BottomNavigationAction";
import { Toolbar } from "@connected-repo/ui-mui/navigation/Toolbar";
import { navItems } from "@frontend/config/nav.config";
import { useLocation, useNavigate } from "react-router";
import { UserProfileMenu } from "./UserProfileMenu";

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
            {/* Top AppBar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: 56,
                        px: 2,
                        justifyContent: "space-between",
                    }}
                >
                    {/* Logo */}
                    <Box
                        onClick={() => navigate("/home")}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                letterSpacing: -0.5,
                            }}
                        >
                            HelioCoach
                        </Typography>
                    </Box>

                    {/* User Avatar - triggers menu */}
                    <UserProfileMenu />
                </Toolbar>
            </AppBar>

            {/* Bottom Navigation - FLOATING CAPSULE STYLE */}
            <Paper
                elevation={20} // Higher elevation for floating effect
                sx={{
					p:1.5,
                    position: "fixed",
                    bottom: 40, // Space from bottom
                    left: "50%", 
                    transform: "translateX(-50%)", // Center horizontally
                    width: "calc(100% - 32px)", // Full width minus margins
                    maxWidth: 400, // Limit width on tablets so it stays capsule-like
                    zIndex: 1000,
                    borderRadius: 15, // Fully rounded corners (Capsule)
                    overflow: "hidden", // Clip inner content to radius
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <BottomNavigation
                    value={getBottomNavValue()}
                    onChange={handleBottomNavChange}
                    showLabels={false} // Often looks cleaner without labels in capsule mode, set true if preferred
                    sx={{
                        height: 64,
                        bgcolor: "transparent", // Ensure background is solid
                        "& .MuiBottomNavigationAction-root": {
                            minWidth: "auto", // Allow items to squeeze evenly
                            padding: "6px 0",
                            transition: "all 0.2s ease-in-out",
                            color: "text.secondary",
                            "&.Mui-selected": {
                                color: "primary.main",
                                "& .MuiSvgIcon-root": {
                                    transform: "scale(1.2)",
                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                },
                            },
                            "&:active": {
                                transform: "scale(0.95)",
                            },
                        },
                    }}
                >
                    {/* Navigation items from config */}
                    {navItems.map((item) => (
                        <BottomNavigationAction
                            key={item.path}
                            // label={item.label} // Uncomment if you want labels inside the capsule
                            icon={item.mobileIcon || item.desktopIcon}
                            sx={{
                                "&:hover": {
                                    bgcolor: "action.hover",
                                },
                            }}
                        />
                    ))}
                </BottomNavigation>
            </Paper>
        </>
    );
};