import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@connected-repo/ui-mui/feedback/Dialog";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { CalendarTodayIcon } from "@connected-repo/ui-mui/icons/CalendarTodayIcon";
import { DarkModeIcon } from "@connected-repo/ui-mui/icons/DarkModeIcon";
import { DeleteIcon } from "@connected-repo/ui-mui/icons/DeleteIcon";
import { LightModeIcon } from "@connected-repo/ui-mui/icons/LightModeIcon";
import { LogoutIcon } from "@connected-repo/ui-mui/icons/LogoutIcon";
import { SettingsIcon } from "@connected-repo/ui-mui/icons/SettingsIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Divider } from "@connected-repo/ui-mui/layout/Divider";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { useThemeMode } from "@connected-repo/ui-mui/theme/ThemeContext";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { authClient } from "@frontend/utils/auth.client";
import { orpc } from "@frontend/utils/orpc.client";
import { logSessionEvent, logSessionException } from "@frontend/utils/session-logger.utils";
import { alpha, useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useOutletContext, useRevalidator } from "react-router";

const ProfilePage = () => {
	// Get session data from authLoader
	const { user } = useOutletContext<SessionInfo>();
	const navigate = useNavigate();
	const { mode, setThemeMode } = useThemeMode();
	const queryClient = useQueryClient();
	const revalidator = useRevalidator();
	const theme = useTheme();

	// Dialog states
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");

	const handleLogout = () => {
		authClient
			.signOut()
			.then(() => {
				navigate("/auth/login");
			})
			.catch((error) => {
				console.error("Logout failed:", error);
				navigate("/auth/login");
			});
	};

	const handleDeleteAccount = () => {
		// TODO: Implement account deletion API call
		console.log("Account deletion requested");
		setDeleteDialogOpen(false);
		setDeleteConfirmText("");
		// After deletion, redirect to login
		// navigate("/auth/login");
	};

	const handleThemeChange = async () => {
		if (!user?.id) return;
		let newMode: "light" | "dark" | "system";
		if (mode === "light") {
			newMode = "dark";
		} else if (mode === "dark") {
			newMode = "system";
		} else {
			newMode = "light";
		}

		logSessionEvent('log', 'Frontend: Theme change initiated', {
			userId: user.id,
			userEmail: user.email,
			oldMode: mode,
			newMode: newMode,
		});

		setThemeMode(newMode);
		try {
			await authClient.updateUser({ themeSetting: newMode });
			
			logSessionEvent('log', 'Frontend: Theme update successful', {
				userId: user.id,
				newMode: newMode,
			});

			queryClient.invalidateQueries({ queryKey: orpc.profile.getProfile.queryOptions().queryKey });
			revalidator.revalidate();
		} catch (error) {
			logSessionException(error instanceof Error ? error : new Error(String(error)), {
				error_type: 'theme_update_failed',
				userId: user.id,
				userEmail: user.email,
				oldMode: mode,
				newMode: newMode,
			}, 'Theme update failed');
			setThemeMode(mode);
		}
	};

	const getThemeDisplay = () => {
		if (mode === "light") {
			return {
				icon: <DarkModeIcon sx={{ color: theme.palette.secondary.contrastText, fontSize: "1.5rem" }} />,
				title: "Switch to Dark Mode",
				subtitle: "Currently using light theme",
				bgColor: alpha(theme.palette.background.paper, 0.5),
			};
		}
		if (mode === "dark") {
			return {
				icon: <SettingsIcon sx={{ color: theme.palette.secondary.contrastText, fontSize: "1.5rem" }} />,
				title: "Switch to System Mode",
				subtitle: "Currently using dark theme",
				bgColor: alpha(theme.palette.background.paper, 0.5),
			};
		}
		return {
			icon: <LightModeIcon sx={{ color: theme.palette.secondary.contrastText, fontSize: "1.5rem" }} />,
			title: "Switch to Light Mode",
			subtitle: "Currently using system theme",
			bgColor: alpha(theme.palette.background.paper, 0.5),
		};
	};

	if (!user) {
		return (
			<Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<LoadingSpinner text="Loading profile..." />
			</Box>
		);
	}

	// Format dates
	const formatDate = (timestamp: number | undefined) => {
		if (!timestamp) return "Not available";
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const accountCreatedDate = formatDate(user.createdAt);
	const themeDisplay = getThemeDisplay();

	return (
		<Box
			sx={{
				py: { xs: 2, md: 3 },
				background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.mode === 'light' ? '#E2E8F0' : '#1a1a1a'} 100%)`,
				minHeight: "100vh",
			}}
		>
			<Container maxWidth="lg">
				<Fade in timeout={400}>
					<Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
						{/* Header */}
						<Box sx={{ textAlign: "center", mb: 3 }}>
							<Typography
								variant="h4"
								sx={{
									fontFamily: '"Playfair Display", Georgia, serif',
									fontWeight: 700,
									color: theme.palette.text.primary,
									mb: 1,
									fontSize: { xs: "1.75rem", md: "2.125rem" },
								}}
							>
								Profile & Settings
							</Typography>
							<Typography
								variant="body1"
								sx={{
									color: theme.palette.text.secondary,
									fontSize: "1rem",
								}}
							>
								Manage your account information
							</Typography>
						</Box>

						{/* Profile Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Paper
								sx={{
									borderRadius: "32px",
									backgroundColor: alpha(theme.palette.background.paper, 0.95),
									backdropFilter: "blur(10px)",
									WebkitBackdropFilter: "blur(10px)",
									boxShadow: theme.shadows[4],
									p: { xs: 3, md: 4 },
									mb: 3,
								}}
							>
								{/* Avatar Section */}
								<Box sx={{ textAlign: "center", mb: 4 }}>
									<Avatar
										src={user.image || undefined}
										alt={user.name || user.email}
										sx={{
											width: { xs: 96, md: 120 },
											height: { xs: 96, md: 120 },
											mx: "auto",
											mb: 2,
											border: "4px solid",
											borderColor: theme.palette.divider,
											background: user.image
												? "transparent"
												: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
											boxShadow: theme.shadows[4],
											fontSize: "2.5rem",
											fontWeight: 600,
										}}
									>
										{!user.image && (user.name?.[0] || user.email?.[0] || "U")}
									</Avatar>
									<Typography
										variant="h5"
										sx={{
											fontFamily: '"Playfair Display", Georgia, serif',
											fontWeight: 600,
											color: theme.palette.text.primary,
											mb: 0.5,
										}}
									>
										{user.name}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: theme.palette.text.secondary,
											fontSize: "0.95rem",
										}}
									>
										{user.email}
									</Typography>
								</Box>

								<Divider sx={{ my: 3 }} />

								{/* Account Details */}
								<Stack spacing={3}>
									<Box>
										<Typography
											variant="subtitle2"
											sx={{
												color: theme.palette.text.primary,
												fontWeight: 600,
												mb: 2,
												fontSize: "1rem",
											}}
										>
											Account Details
										</Typography>

										{/* Email Verification Status */}
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
												py: 1.5,
												px: 2,
												mt: 1.5,
												borderRadius: 1.5,
												backgroundColor: user.emailVerified
													? alpha(theme.palette.success.main, 0.2)
													: alpha(theme.palette.error.main, 0.2),
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													width: 40,
													height: 40,
													borderRadius: 1.5,
													backgroundColor: user.emailVerified
														? alpha(theme.palette.success.main, 0.5)
														: alpha(theme.palette.error.main, 0.5),
												}}
											>
												<Box
													sx={{
														fontSize: "1.25rem",
													}}
												>
													{user.emailVerified ? "✓" : "✗"}
												</Box>
											</Box>
											<Box sx={{ flex: 1 }}>
												<Typography
													variant="caption"
													sx={{
														color: theme.palette.text.secondary,
														fontSize: "0.75rem",
														display: "block",
														mb: 0.25,
													}}
												>
													Email Verification
												</Typography>
												<Typography
													variant="body2"
													sx={{
														color: user.emailVerified ? theme.palette.success.main : theme.palette.error.main,
														fontWeight: 500,
														fontSize: "0.95rem",
													}}
												>
													{user.emailVerified ? "Verified" : "Not verified"}
												</Typography>
											</Box>
										</Box>

										{/* Account Created */}
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
												py: 1.5,
												px: 2,
												mt: 1.5,
												borderRadius: 1.5,
												backgroundColor: alpha(theme.palette.secondary.light, 0.2)
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													width: 40,
													height: 40,
													borderRadius: 1.5,
													backgroundColor: alpha(theme.palette.background.paper, 0.5),
												}}
											>
												<CalendarTodayIcon sx={{ color: theme.palette.secondary.contrastText, fontSize: "1.25rem" }} />
											</Box>
											<Box sx={{ flex: 1 }}>
												<Typography
													variant="caption"
													sx={{
														color: theme.palette.text.secondary,
														fontSize: "0.75rem",
														display: "block",
														mb: 0.25,
													}}
												>
													Member Since
												</Typography>
												<Typography
													variant="body2"
													sx={{
														color: theme.palette.text.primary,
														fontWeight: 500,
														fontSize: "0.95rem",
													}}
												>
													{accountCreatedDate}
												</Typography>
											</Box>
										</Box>

										{/* Timezone */}
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
												py: 1.5,
												px: 2,
												mt: 1.5,
												borderRadius: 1.5,
												backgroundColor: alpha(theme.palette.secondary.light, 0.2),
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													width: 40,
													height: 40,
													borderRadius: 1.5,
													backgroundColor: alpha(theme.palette.background.paper, 0.5),
												}}
											>
												<SettingsIcon sx={{ color: theme.palette.secondary.contrastText, fontSize: "1.25rem" }} />
											</Box>
											<Box sx={{ flex: 1 }}>
												<Typography
													variant="caption"
													sx={{
														color: theme.palette.text.secondary,
														fontSize: "0.75rem",
														display: "block",
														mb: 0.25,
													}}
												>
													Timezone
												</Typography>
												<Typography
													variant="body2"
													sx={{
														color: theme.palette.text.primary,
														fontWeight: 500,
														fontSize: "0.95rem",
													}}
												>
													{user.timezone || "Not set"}
												</Typography>
											</Box>
										</Box>
									</Box>
								</Stack>
							</Paper>
						</motion.div>

						{/* Settings Section */}
						<Box sx={{ maxWidth: 500, mx: "auto", width: "100%" }}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
							>
								<Typography
									variant="subtitle2"
									sx={{
										color: theme.palette.text.primary,
										fontWeight: 600,
										mb: 2,
										fontSize: "1rem",
									}}
								>
									Settings
								</Typography>

								<Stack spacing={2}>
									{/* Theme Toggle - Clickable Box */}
									<Box
										onClick={handleThemeChange}
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											p: 2.5,
											borderRadius: 2.5,
											backgroundColor: alpha(theme.palette.background.paper, 0.8),
											backdropFilter: "blur(10px)",
											WebkitBackdropFilter: "blur(10px)",
											boxShadow: theme.shadows[1],
											cursor: "pointer",
											transition: "all 0.2s ease-in-out",
											"&:hover": {
												backgroundColor: alpha(theme.palette.background.paper, 0.95),
												boxShadow: theme.shadows[2],
												transform: "translateY(-2px)",
											},
											"&:active": {
												transform: "translateY(0)",
											},
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												width: 48,
												height: 48,
												borderRadius: 1.5,
												backgroundColor: themeDisplay.bgColor,
											}}
										>
											{themeDisplay.icon}
										</Box>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="body2"
												sx={{
													color: theme.palette.text.primary,
													fontWeight: 500,
													fontSize: "1rem",
												}}
											>
												{themeDisplay.title}
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: theme.palette.text.secondary,
													fontSize: "0.8rem",
												}}
											>
												{themeDisplay.subtitle}
											</Typography>
										</Box>
									</Box>

									{/* Logout - Clickable Box */}
									<Box
										onClick={() => setLogoutDialogOpen(true)}
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											p: 2.5,
											borderRadius: 2.5,
											backgroundColor: alpha(theme.palette.background.paper, 0.5),
											backdropFilter: "blur(10px)",
											WebkitBackdropFilter: "blur(10px)",
											boxShadow: theme.shadows[1],
											cursor: "pointer",
											transition: "all 0.2s ease-in-out",
											"&:hover": {
												backgroundColor: alpha(theme.palette.background.paper, 0.95),
												boxShadow: theme.shadows[2],
												transform: "translateY(-2px)",
											},
											"&:active": {
												transform: "translateY(0)",
											},
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												width: 48,
												height: 48,
												borderRadius: 1.5,
												backgroundColor: alpha(theme.palette.background.paper, 0.5),
											}}
										>
											<LogoutIcon sx={{ color: theme.palette.secondary.contrastText, fontSize: "1.5rem" }} />
										</Box>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="body2"
												sx={{
													color: theme.palette.text.primary,
													fontWeight: 500,
													fontSize: "1rem",
												}}
											>
												Logout
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: theme.palette.text.secondary,
													fontSize: "0.8rem",
												}}
											>
												Sign out of your account
											</Typography>
										</Box>
									</Box>
								</Stack>
							</motion.div>

							{/* Danger Zone Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<Typography
									variant="subtitle2"
									sx={{
										color: theme.palette.error.main,
										fontWeight: 500,
										mb: 2,
										mt: 4,
										fontSize: "1rem",
									}}
								>
									Danger Zone
								</Typography>

								<Stack spacing={2}>
									{/* Delete Account - Clickable Box */}
									<Box
										onClick={() => setDeleteDialogOpen(true)}
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											p: 2.5,
											borderRadius: 2.5,
											backgroundColor: alpha(theme.palette.background.paper, 0.8),
											backdropFilter: "blur(10px)",
											WebkitBackdropFilter: "blur(10px)",
											border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
											boxShadow: `0px 2px 8px ${alpha(theme.palette.error.main, 0.08)}`,
											cursor: "pointer",
											transition: "all 0.2s ease-in-out",
											"&:hover": {
												backgroundColor: alpha(theme.palette.error.light, 0.95),
												borderColor: alpha(theme.palette.error.main, 0.4),
												boxShadow: `0px 4px 12px ${alpha(theme.palette.error.main, 0.16)}`,
												transform: "translateY(-2px)",
											},
											"&:active": {
												transform: "translateY(0)",
											},
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												width: 48,
												height: 48,
												borderRadius: 1.5,
												backgroundColor: alpha(theme.palette.error.main, 0.1),
											}}
										>
											<DeleteIcon sx={{ color: theme.palette.error.main, fontSize: "1.5rem" }} />
										</Box>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="body2"
												sx={{
													color: theme.palette.error.main,
													fontWeight: 600,
													fontSize: "1rem",
												}}
											>
												Delete Account
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: theme.palette.text.secondary,
													fontSize: "0.8rem",
												}}
											>
												Permanently remove account and data
											</Typography>
										</Box>
									</Box>
								</Stack>
							</motion.div>
						</Box>
					</Box>
				</Fade>
			</Container>

			{/* Logout Confirmation Dialog */}
			<Dialog
				open={logoutDialogOpen}
				onClose={() => setLogoutDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>⚠️ Confirm Logout</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Are you sure you want to logout from your account?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setLogoutDialogOpen(false);
							handleLogout();
						}}
						sx={{
							color: theme.palette.error.main,
						}}
					>
						Logout
					</Button>
					<Button onClick={() => setLogoutDialogOpen(false)} color="secondary" variant="contained">
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Account Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeleteConfirmText("");
				}}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>⚠️ Delete Account</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						This action cannot be undone. This will permanently delete your account and remove your personal
						data. Some system logs and backups may be retained for operational purposes.
					</DialogContentText>
					<DialogContentText sx={{ mb: 2, fontWeight: 600 }}>
						Type "DELETE" to confirm:
					</DialogContentText>
					<TextField
						autoFocus
						fullWidth
						value={deleteConfirmText}
						onChange={(e) => setDeleteConfirmText(e.target.value)}
						placeholder="DELETE"
					/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleDeleteAccount}
						disabled={deleteConfirmText !== "DELETE"}
						sx={{
							color: theme.palette.error.main,
						}}
					>
						Delete Account
					</Button>
					<Button
						onClick={() => {
							setDeleteDialogOpen(false);
							setDeleteConfirmText("");
						}}
						color="secondary"
						variant="contained"
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ProfilePage;
