import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { PrimaryButton } from "@connected-repo/ui-mui/components/PrimaryButton";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@connected-repo/ui-mui/feedback/Dialog";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { MonetizationOnIcon } from "@connected-repo/ui-mui/icons/MonetizationOnIcon";
import { ShieldIcon } from "@connected-repo/ui-mui/icons/ShieldIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import { alpha, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface BuyShieldsDialogProps {
	open: boolean;
	onClose: () => void;
}

export const BuyShieldsDialog = ({ open, onClose }: BuyShieldsDialogProps) => {
	const theme = useTheme();
	const queryClient = useQueryClient();
	const [shieldsToBuy, setShieldsToBuy] = useState<number>(1);
	const [error, setError] = useState<string>("");

	const { data: userStats, isLoading } = useQuery({
		...orpc.userStats.getMine.queryOptions(),
		enabled: open,
	});

	const buyShieldsMutation = useMutation({
		...orpc.rewardsLedger.buyShields.mutationOptions(),
		onSuccess: () => {
			// Invalidate queries to refresh balances
			queryClient.invalidateQueries({ queryKey: orpc.userStats.getMine.queryKey() });
			// Invalidate all rewards history queries
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "rewardsLedger" && query.queryKey[1] === "getRewardsHistory",
			});
			setShieldsToBuy(1);
			setError("");
			onClose(); // Close dialog on success
		},
		onError: (err) => {
			setError(err.message || "Failed to purchase shields");
		},
	});

	useEffect(() => {
		// Reset form when dialog opens/closes
		if (!open) {
			setShieldsToBuy(1);
			setError("");
		}
	}, [open]);

	const COINS_PER_SHIELD = 50;
	const maxShieldsCanBuy = Math.floor((userStats?.coinsBalance ?? 0) / COINS_PER_SHIELD);
	const totalCost = shieldsToBuy * COINS_PER_SHIELD;

	const handleBuyShields = async () => {
		setError("");

		if (shieldsToBuy < 1) {
			setError("Please enter a valid number of shields");
			return;
		}

		if (shieldsToBuy > maxShieldsCanBuy) {
			setError(
				`You can only buy up to ${maxShieldsCanBuy} shield${maxShieldsCanBuy !== 1 ? "s" : ""} with your current balance`,
			);
			return;
		}

		await buyShieldsMutation.mutateAsync({ shieldCount: shieldsToBuy });
	};

	const handleShieldsChange = (value: number) => {
		setError("");
		setShieldsToBuy(Math.max(0, Math.min(value, maxShieldsCanBuy)));
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<ShieldIcon sx={{ color: theme.palette.primary.main, fontSize: "1.5rem" }} />
				Buy Shields
			</DialogTitle>
			<DialogContent>
				{isLoading ? (
					<Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
						<LoadingSpinner />
					</Box>
				) : (
					<Box sx={{ pt: 1 }}>
						{/* Current Balances */}
						<Stack spacing={1.5} sx={{ mb: 3 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1.5,
									p: 1.5,
									borderRadius: 1.5,
									bgcolor: alpha("#FFD700", 0.1),
								}}
							>
								<MonetizationOnIcon sx={{ color: "#FFD700", fontSize: "1.25rem" }} />
								<Box>
									<Typography variant="caption" color="text.secondary">
										Your Coins
									</Typography>
									<Typography variant="body1" sx={{ fontWeight: 600 }}>
										{userStats?.coinsBalance.toLocaleString() ?? 0}
									</Typography>
								</Box>
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1.5,
									p: 1.5,
									borderRadius: 1.5,
									bgcolor: alpha(theme.palette.primary.main, 0.1),
								}}
							>
								<ShieldIcon sx={{ color: theme.palette.primary.main, fontSize: "1.25rem" }} />
								<Box>
									<Typography variant="caption" color="text.secondary">
										Your Shields
									</Typography>
									<Typography variant="body1" sx={{ fontWeight: 600 }}>
										{userStats?.shieldsBalance.toLocaleString() ?? 0}
									</Typography>
								</Box>
							</Box>
						</Stack>

						{/* Exchange Rate Info */}
						<Box
							sx={{
								mb: 3,
								p: 2,
								borderRadius: 1.5,
								bgcolor: alpha(theme.palette.info.main, 0.08),
								border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
							}}
						>
							<Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
								Exchange Rate: 50 coins = 1 shield
							</Typography>
						</Box>

						{/* Purchase Form */}
						<Stack spacing={2}>
							<TextField
								type="number"
								label="Shields to buy"
								value={shieldsToBuy}
								onChange={(e) => handleShieldsChange(Number.parseInt(e.target.value) || 0)}
								fullWidth
								inputProps={{
									min: 0,
									max: maxShieldsCanBuy,
									step: 1,
								}}
								disabled={buyShieldsMutation.isPending || maxShieldsCanBuy === 0}
								helperText={`Cost: ${totalCost} coins • Max: ${maxShieldsCanBuy}`}
							/>

							{error && (
								<Typography variant="body2" color="error">
									{error}
								</Typography>
							)}

							{maxShieldsCanBuy === 0 && (
								<Typography variant="body2" color="warning.main">
									You need at least 50 coins to buy a shield
								</Typography>
							)}

							<PrimaryButton
								onClick={handleBuyShields}
								disabled={
									buyShieldsMutation.isPending ||
									shieldsToBuy < 1 ||
									shieldsToBuy > maxShieldsCanBuy ||
									maxShieldsCanBuy === 0
								}
								fullWidth
								sx={{ mt: 1 }}
							>
								{buyShieldsMutation.isPending
									? "Purchasing..."
									: `Buy ${shieldsToBuy} Shield${shieldsToBuy !== 1 ? "s" : ""} for ${totalCost} Coins`}
							</PrimaryButton>
						</Stack>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
};
