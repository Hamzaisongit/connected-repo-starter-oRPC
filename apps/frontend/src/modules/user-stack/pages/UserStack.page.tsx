import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { ToggleButton } from "@connected-repo/ui-mui/form/ToggleButton";
import { ToggleButtonGroup } from "@connected-repo/ui-mui/form/ToggleButtonGroup";
import { AddIcon } from "@connected-repo/ui-mui/icons/AddIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card"
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { NotificationPermissionDialog } from "@frontend/components/NotificationPermissionDialog";
import { env } from "@frontend/configs/env.config";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { useSuprSend } from "@frontend/hooks/useSuprsend";
import { UserStackEmptyState } from "@frontend/modules/user-stack/components/UserStackEmptyState";
import { enablePushNotifications } from "@frontend/utils/notifications.utils";
import { orpc } from "@frontend/utils/orpc.client";
import { getStockIconAndColor } from "@frontend/utils/supplement.utils";
import { alpha, useTheme } from "@mui/material/styles";
import { SuprSendProvider } from "@suprsend/react-core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useOutletContext, useSearchParams } from "react-router";

type StatusFilter = "all" | "active" | "inactive";

// Helper function to format days as short form
const formatDaysShort = (days: string | string[]) => {
	const daysArray = Array.isArray(days) ? days : [days];
	if (daysArray.length === 7) return "Daily";

	const shortDays = daysArray.map(day => day.substring(0, 3)).slice(0, 3);
	return shortDays.join(",");
};


function UserStackPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const highlightedStackId = searchParams.get("highlight");

	const theme = useTheme();

    const userSessionInfo = useOutletContext<SessionInfo>();
    
    const [showNotificationPermissionDialog, setShowNotificationPermissionDialog] = useState<boolean>(false)
    const {suprSendClient} = useSuprSend(userSessionInfo.user.id)

	const queryClient = useQueryClient();
	const { data: userStacks, isLoading, error } = useQuery(orpc.userStacks.getAll.queryOptions());

	// Scroll to highlighted item when it appears
	useEffect(() => {
		if (highlightedStackId && userStacks && userStacks.length > 0) {
			const element = document.getElementById(`stack-${highlightedStackId}`);
			if (element) {
				element.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}
	}, [highlightedStackId, userStacks]);

    useEffect(()=>{
        if(userStacks && userStacks.length === 1){
            suprSendClient.webpush.pushSubscribed()
                .then((subscribed) => {
                    //don't show dialog if webpush is already subscribed/registered 
                    if (subscribed) return;
                    setShowNotificationPermissionDialog(true)
                })
        }
    }, [userStacks, suprSendClient])

	const updateStackMutation = useMutation(orpc.userStacks.update.mutationOptions());

	const handleStatusFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilter: StatusFilter | null) => {
		if (newFilter !== null) {
			setStatusFilter(newFilter);
		}
	};

	const handleToggleActive = async (stackId: string, isActive: boolean) => {
		try {
			await updateStackMutation.mutateAsync({
				id: stackId,
				isActive: !isActive,
			});
			// Invalidate and refetch stacks
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getAll.queryKey() });
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getTodaysPlan.queryKey() });
		} catch (error) {
			console.error("Failed to update stack status:", error);
		}
	};

	const handleStackClick = (stackId: string) => {
		navigate(`/user-stack/${stackId}`);
	};

	const filteredStacks = userStacks?.filter((stack) => {
		if (statusFilter === "all") return true;
		if (statusFilter === "active") return stack.isActive;
		if (statusFilter === "inactive") return !stack.isActive;
		return true;
	}) || [];

	if (isLoading) return <LoadingSpinner text="Loading user stack..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading user stack: ${errorMessage}`} />
			</Container>
		);
	}

	if (!userStacks || userStacks.length === 0) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<UserStackEmptyState variant="all" />
			</Container>
		);
	}

	// Show filtered empty state when there are stacks but none match the current filter
	const showFilteredEmptyState = filteredStacks.length === 0 && userStacks.length > 0;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, pb: 12, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
            {/* Background Shape - Theme Aware */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "300px",
                    // Dynamic gradient using theme primary/secondary colors
                    background: `radial-gradient(ellipse 80% 50% at 20% 30%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 100%)`,
                    filter: "blur(40px)",
                    zIndex: -1,
                    borderRadius: "0 0 50% 50%",
                }}
            />

            {/* Header */}
            <Box sx={{ mb: 3, textAlign: "center" }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontFamily: 'serif',
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                    }}
                >
                    My Stack
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your supplements.
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={handleStatusFilterChange}
                    aria-label="status filter"
                    sx={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        borderRadius: "24px",
                        boxShadow: theme.shadows[1],
                        p: 0.25,
                        "& .MuiToggleButton-root": {
                            borderRadius: "20px",
                            border: "none",
                            color: "text.secondary",
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "0.75rem",
                            px: 2,
                            py: 1,
                            minWidth: "auto",
                            flex: 1,
                            transition: "all 0.2s ease",
                            "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                            }
                        },
                    }}
                >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="active">Active</ToggleButton>
                    <ToggleButton value="inactive">Inactive</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Filtered Empty State */}
            {showFilteredEmptyState && (
                <UserStackEmptyState variant={statusFilter} />
            )}

            {/* Uniform Stack Gallery */}
            {!showFilteredEmptyState && (
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                    },
                    gap: 3,
                }}
            >
                {filteredStacks.map((stack) => {
                    const isInactive = !stack.isActive;
                    const isHighlighted = stack.id === highlightedStackId;
                    const stockIconData = getStockIconAndColor(stack.name);
                    
                    return (
                        <motion.div
                            key={stack.id}
                            id={`stack-${stack.id}`}
                            initial={isHighlighted ? { scale: 0.95, opacity: 0.8 } : { scale: 1, opacity: 1 }}
                            animate={isHighlighted ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <Box sx={{ position: "relative", mt: 2 }}> {/* Margin top for the overlapping icon */}
                                
                                {/* 3D Overlapping Circular Image */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: -35,
                                        left: 35,
                                        width: 70,
                                        height: 70,
                                        borderRadius: "50%",
                                        backgroundColor: stockIconData.bgColor,
                                        border: "4px solid",
                                        borderColor: "background.paper", // Seamless blend with card bg
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "2rem",
                                        boxShadow: (theme) => theme.shadows[3],
                                        zIndex: 3,
                                    }}
                                >
                                    {stockIconData.icon}
                                </Box>

                                {/* Main Card Area */}
                                <Card
                                    onClick={() => handleStackClick(stack.id)}
                                    sx={{
                                        height: "100%",
                                        cursor: "pointer",
                                        position: "relative",
                                        overflow: "visible", // Allow icon overlap
                                        transition: "all 0.3s ease-in-out",
                                        p: 3,
                                        pt: 5, // Extra padding top to clear the icon
                                        
                                        // Highlight Logic
                                        border: isHighlighted ? "2px solid" : "1px solid",
                                        borderColor: isHighlighted ? alpha(theme.palette.primary.main, 0.5) : "divider",
                                        boxShadow: isHighlighted ? (theme) => `0px 12px 40px ${alpha(theme.palette.primary.main, 0.15)}` : undefined,
                                        
                                        // Inactive Logic
                                        filter: isInactive ? "grayscale(1)" : "none",
                                        opacity: isInactive ? 0.6 : 1,

                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: (theme) => theme.shadows[8],
                                        },
                                    }}
                                >
                                    {/* Active/Inactive Toggle Switch */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 20,
                                            right: 20,
                                            zIndex: 3,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <Switch
                                            checked={stack.isActive}
                                            onChange={() => handleToggleActive(stack.id, stack.isActive)}
                                            disabled={updateStackMutation.isPending}
                                            color="success"
                                        />
                                    </Box>

                                    {/* Content Area */}
                                    <Box>
                                        {/* Supplement Name */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontFamily: 'serif',
                                                fontWeight: 700,
                                                lineHeight: 1.2,
                                                mb: 1.5,
                                                pr: 4, // Space for toggle
                                            }}
                                        >
                                            {stack.name}
                                        </Typography>

                                        {/* Dosage */}
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 600,
                                                color: "text.primary",
                                                mb: 1.5,
                                            }}
                                        >
                                            {stack.dosage} {stack.unit}
                                        </Typography>

                                        {/* Frequency Line */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography sx={{ fontSize: "1.1rem" }}>
                                                {stack.reminderDays.length === 7 ? "📅" : "⏰"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                {stack.reminderDays.length === 7
                                                    ? `Daily • ${stack.reminderTime.slice(0, 5)}`
                                                    : `${formatDaysShort(stack.reminderDays)} • ${stack.reminderTime.slice(0, 5)}`}
                                            </Typography>
                                        </Box>

                                        {/* View Indicator */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 16,
                                                right: 16,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                opacity: 0.7,
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                View
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">→</Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
            )}

            {/* Floating Action Button */}
            <motion.div
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: "fixed",
                    bottom: 110, 
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/user-stack/new")}
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        minWidth: 64,
                        p: 0,
                        // Custom shadow using primary color for glow
                        boxShadow: (theme) => `0px 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                        "&:hover": {
                            boxShadow: (theme) => `0px 12px 48px ${alpha(theme.palette.primary.main, 0.6)}`,
                        },
                    }}
                >
                    <AddIcon sx={{ fontSize: 28 }} />
                </Button>
            </motion.div>

            {/* Dialog to ask early users for notification permission */}
            <NotificationPermissionDialog 
                userId={userSessionInfo.user.id}
                show={showNotificationPermissionDialog}
                setShow={setShowNotificationPermissionDialog}
            >
            </NotificationPermissionDialog>
        </Container>
    );
}

export default () => (
	<SuprSendProvider
		publicApiKey={env.VITE_SUPRSEND_PUBLIC_API_KEY}
		vapidKey={env.VITE_SUPRSEND_PUBLIC_VAPID_KEY}
		swFileName={import.meta.env.DEV ? "./dev-sw.js?dev-sw" : "./sw.js"}
	>
		<UserStackPage />
	</SuprSendProvider>
);